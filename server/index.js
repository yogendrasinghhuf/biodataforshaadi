const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
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

// Gmail SMTP transporter for the payment-completed notification email.
// EMAIL_APP_PASSWORD is a Gmail App Password (not the account password),
// generated at https://myaccount.google.com/apppasswords.
const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NOTIFICATION_EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

async function sendPaymentNotificationEmail({ orderId, paymentId, amount, templateName }) {
  if (!process.env.EMAIL_APP_PASSWORD || !process.env.NOTIFICATION_EMAIL_USER) {
    console.warn('Email credentials not configured — skipping payment notification email');
    return;
  }

  await mailTransporter.sendMail({
    from: process.env.NOTIFICATION_EMAIL_USER,
    to: process.env.NOTIFICATION_EMAIL_USER,
    subject: 'BiodataForShaadi — New Payment Received',
    text: [
      'A payment was just completed and verified.',
      '',
      `Order ID: ${orderId}`,
      `Payment ID: ${paymentId}`,
      amount ? `Amount: ₹${amount}` : null,
      templateName ? `Template: ${templateName}` : null
    ].filter(Boolean).join('\n')
  });
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
      sendPaymentNotificationEmail({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount,
        templateName
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
