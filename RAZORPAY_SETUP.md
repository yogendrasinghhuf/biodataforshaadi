# Razorpay Integration Setup Guide

This guide will help you set up Razorpay payment gateway for your ShaadiiBiodata application.

## Step 1: Create Razorpay Account

1. Visit https://razorpay.com/
2. Click on "Sign Up" button
3. Fill in your business details:
   - Business Name
   - Email Address
   - Phone Number
4. Complete the email verification
5. Complete KYC (Know Your Customer) process for production use

## Step 2: Get API Keys

### For Testing (Development)

1. Log in to Razorpay Dashboard: https://dashboard.razorpay.com/
2. Switch to "Test Mode" using the toggle on the left sidebar
3. Navigate to **Settings** → **API Keys**
4. Click on "Generate Test Keys" if not already generated
5. You'll see two keys:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret** (starts with `rzp_test_`)
6. Click "Copy" to copy these keys

### For Production (Live)

1. Complete KYC verification
2. Switch to "Live Mode"
3. Navigate to **Settings** → **API Keys**
4. Generate Live Keys
5. You'll see:
   - **Key ID** (starts with `rzp_live_`)
   - **Key Secret** (starts with `rzp_live_`)

## Step 3: Configure Backend Server

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Create `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` file and add your Razorpay keys:
   ```env
   # For Testing
   RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
   RAZORPAY_KEY_SECRET=YYYYYYYYYYYYYYYY

   # Server Configuration
   PORT=5000
   ```

4. Save the file

## Step 4: Configure Frontend

1. Open `frontend/src/pages/Preview.tsx`

2. Find this line (around line 52):
   ```typescript
   key: 'YOUR_RAZORPAY_KEY_ID', // TODO: Replace with actual key from env
   ```

3. Replace it with your Razorpay Key ID:
   ```typescript
   key: 'rzp_test_XXXXXXXXXXXX', // Your actual Key ID
   ```

**Important**: Use only the Key ID (public key), never expose the Key Secret in frontend code!

## Step 5: Test Payment Integration

### Test Mode Credentials

Use these test cards for testing payments:

#### Successful Payment
- **Card Number**: 4111 1111 1111 1111
- **CVV**: Any 3 digits
- **Expiry Date**: Any future date
- **Name**: Your Name

#### Failed Payment (for testing failures)
- **Card Number**: 4000 0000 0000 0002

#### UPI Test
- Use UPI ID: `success@razorpay`
- Enter any UPI PIN

### Testing Process

1. Start both backend and frontend servers:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm start

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

2. Go to http://localhost:3000
3. Create a biodata
4. Select a template
5. On preview page, click "Pay" button
6. Use test credentials above
7. Complete the payment

## Step 6: Webhook Setup (Optional but Recommended)

Webhooks help you receive payment confirmations even if the user closes the browser.

1. In Razorpay Dashboard, go to **Settings** → **Webhooks**
2. Click "Add New Webhook"
3. Enter your webhook URL:
   ```
   https://yourdomain.com/api/webhook
   ```
4. Select events to listen:
   - ✅ payment.captured
   - ✅ payment.failed
5. Copy the webhook secret
6. Add to your `.env` file:
   ```env
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
   ```

## Step 7: Going Live (Production)

### Before Going Live Checklist:

- [ ] Complete KYC verification on Razorpay
- [ ] Switch to Live API keys
- [ ] Update `.env` with live keys
- [ ] Update frontend with live Key ID
- [ ] Set up webhooks with production URL
- [ ] Test with real small amounts
- [ ] Enable HTTPS on your server
- [ ] Add proper error handling
- [ ] Set up payment reconciliation

### Switch to Live Keys:

1. Get Live API Keys from Razorpay Dashboard (Live Mode)
2. Update `server/.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXX
   RAZORPAY_KEY_SECRET=YYYYYYYYYYYYYYYY
   ```
3. Update `frontend/src/pages/Preview.tsx` with live Key ID
4. Redeploy your application

## Payment Flow Overview

```
User fills biodata
    ↓
Selects template
    ↓
Clicks "Pay" button
    ↓
Frontend calls /api/payment/create-order
    ↓
Backend creates Razorpay order
    ↓
Returns order details to frontend
    ↓
Frontend opens Razorpay checkout
    ↓
User completes payment
    ↓
Razorpay sends response
    ↓
Frontend calls /api/payment/verify
    ↓
Backend verifies signature
    ↓
If valid: Generate & download PDF
    ↓
Complete!
```

## Environment Variables Reference

```env
# Razorpay API Keys
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX        # Your Key ID (Test or Live)
RAZORPAY_KEY_SECRET=YYYYYYYYYYYYYYYY         # Your Key Secret (Test or Live)

# Optional: Webhook Secret
RAZORPAY_WEBHOOK_SECRET=webhook_secret_here

# Server Configuration
PORT=5000
NODE_ENV=development                          # or 'production'
```

## Security Best Practices

1. **Never expose Key Secret**: Only use it on the backend
2. **Always verify payments**: Never trust client-side success
3. **Use HTTPS in production**: Protect data in transit
4. **Store secrets in environment variables**: Never commit to git
5. **Implement rate limiting**: Prevent abuse
6. **Log all transactions**: For reconciliation and debugging
7. **Handle errors gracefully**: Show user-friendly messages

## Troubleshooting

### Issue: Payment fails with "Invalid key"
- **Solution**: Check if you're using correct Key ID in frontend
- Ensure backend has correct Key ID and Secret in `.env`

### Issue: Signature verification fails
- **Solution**: Ensure Key Secret in backend matches the one used to create order
- Check if order_id and payment_id are being passed correctly

### Issue: Payment succeeds but PDF doesn't download
- **Solution**: Check browser console for errors
- Verify payment verification endpoint is working
- Check if jsPDF is generating PDF correctly

### Issue: "Network Error" when creating order
- **Solution**: Ensure backend server is running
- Check if CORS is properly configured
- Verify API endpoint URL is correct

## Getting Help

- **Razorpay Documentation**: https://razorpay.com/docs/
- **Razorpay Support**: https://razorpay.com/support/
- **API Reference**: https://razorpay.com/docs/api/

## Test Scenarios

Test these scenarios before going live:

1. ✅ Successful payment with card
2. ✅ Successful payment with UPI
3. ✅ Failed payment handling
4. ✅ User cancels payment
5. ✅ Network interruption during payment
6. ✅ Multiple payment attempts
7. ✅ Different template prices
8. ✅ Payment verification
9. ✅ PDF generation after payment
10. ✅ Error messages display correctly

---

Once you've completed these steps, your payment integration will be ready!

**Note**: When you provide your actual Razorpay credentials, make sure to update both the backend `.env` file and the frontend `Preview.tsx` file.
