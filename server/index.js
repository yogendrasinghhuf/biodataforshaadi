const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Resend } = require('resend');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Razorpay instance
// TODO: Replace with actual credentials from .env file
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'YOUR_KEY_ID_HERE',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET_HERE'
});

// Resend (HTTP-based email API) for the payment/download notification
// email. Switched from Gmail SMTP because outbound SMTP is blocked/hangs
// from Render's network — Resend works over normal HTTPS instead.
// RESEND_API_KEY from https://resend.com/api-keys.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function sendNotificationEmail({ subject, lines }) {
  if (!resend || !process.env.NOTIFICATION_EMAIL_USER) {
    console.warn('Email credentials not configured — skipping notification email');
    return;
  }

  // onboarding@resend.dev is Resend's shared sandbox sender, usable without
  // verifying a custom domain — fine for a low-volume internal notification.
  const { error } = await resend.emails.send({
    from: 'BiodataForShaadi <onboarding@resend.dev>',
    to: process.env.NOTIFICATION_EMAIL_USER,
    subject,
    text: lines.filter(Boolean).join('\n')
  });

  if (error) {
    throw new Error(error.message || 'Resend send failed');
  }
}

// Create order endpoint
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;

    const options = {
      amount: amount * 100, // amount in paise
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// Verify payment endpoint
app.post('/api/payment/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, templateName } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET_HERE')
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Notification email is best-effort — a delivery failure must not fail
      // the payment verification response the frontend is waiting on.
      sendNotificationEmail({
        subject: 'BiodataForShaadi — New Payment Received',
        lines: [
          'A payment was just completed and verified.',
          '',
          `Order ID: ${razorpay_order_id}`,
          `Payment ID: ${razorpay_payment_id}`,
          amount ? `Amount: ₹${amount}` : null,
          templateName ? `Template: ${templateName}` : null
        ]
      }).catch((error) => console.error('Failed to send payment notification email:', error));

      res.json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

// Notify on biodata PDF download (payment is not yet wired up, so this fires
// on every download in the meantime).
app.post('/api/notify-download', async (req, res) => {
  const { formData, templateName } = req.body;

  try {
    const fullName = formData?.fullName || 'Unknown';
    const dateOfBirth = formData?.dateOfBirth || 'Unknown';
    const downloadedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const subject = `Biodata | ${fullName} | DOB-${dateOfBirth} | ${downloadedAt} | ${templateName || 'No Template'}`;

    // Every other form field, in whatever order the frontend sent them —
    // excludes fullName/dateOfBirth since those are already in the subject.
    const detailLines = Object.entries(formData || {})
      .filter(([key, value]) => key !== 'fullName' && key !== 'dateOfBirth' && value)
      .map(([key, value]) => `${key}: ${value}`);

    await sendNotificationEmail({
      subject,
      lines: [
        'A biodata PDF was just downloaded.',
        '',
        `Name: ${fullName}`,
        `Date of Birth: ${dateOfBirth}`,
        `Template: ${templateName || 'No Template'}`,
        `Downloaded At: ${downloadedAt}`,
        '',
        ...detailLines
      ]
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to send download notification email:', error);
    // Best-effort — the frontend already has its PDF, so a failed email here
    // is not something the user should see as an error.
    res.status(200).json({ success: false });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
