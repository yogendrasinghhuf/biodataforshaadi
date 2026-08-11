# Quick Start Guide

Get your ShaadiiBiodata website up and running in 5 minutes!

## Prerequisites

Make sure you have installed:
- Node.js (v14 or higher) - Download from https://nodejs.org/
- A Razorpay account - Sign up at https://razorpay.com/

## Step 1: Install Dependencies

Open two terminal windows and run these commands:

### Terminal 1 - Backend Setup
```bash
cd server
npm install
```

### Terminal 2 - Frontend Setup
```bash
cd frontend
npm install
```

## Step 2: Configure Razorpay (Quick Setup)

### Option A: Test Mode (Recommended for development)

1. Create `.env` file in `server` directory:
```bash
cd server
cp .env.example .env
```

2. For now, you can use placeholder values to test the UI:
```env
RAZORPAY_KEY_ID=rzp_test_placeholder
RAZORPAY_KEY_SECRET=placeholder_secret
PORT=5000
```

**Note**: The payment won't work with placeholders. Follow `RAZORPAY_SETUP.md` for full payment integration.

### Option B: Real Razorpay Keys (For working payments)

See detailed instructions in `RAZORPAY_SETUP.md`

## Step 3: Start the Application

Keep both terminals open:

### Terminal 1 - Start Backend
```bash
cd server
npm start
```

You should see: `Server is running on port 5000`

### Terminal 2 - Start Frontend
```bash
cd frontend
npm start
```

Browser will automatically open to http://localhost:3000

## Step 4: Explore the Website

Once both servers are running:

1. **Home Page** (http://localhost:3000)
   - Click "Get Started Now"

2. **Create Biodata**
   - Select a religion (Hindu, Muslim, Christian, or Sikh)
   - Fill in the multi-step form
   - Upload a photo
   - Choose a template

3. **Preview & Payment**
   - Review your biodata
   - (Payment will work only with real Razorpay keys)

## Step 5: Customize (Optional)

### Change Colors

Edit `frontend/src/index.css`:
```css
:root {
  --primary-red: #DC2626;      /* Change to your red shade */
  --primary-green: #16A34A;    /* Change to your green shade */
  --primary-yellow: #EAB308;   /* Change to your yellow shade */
}
```

### Add More Templates

Edit `frontend/src/data/templates.ts` and add new template objects.

### Modify Template Prices

In `frontend/src/data/templates.ts`, change the `price` field for any template.

## Common Issues & Solutions

### Issue: "npm: command not found"
**Solution**: Install Node.js from https://nodejs.org/

### Issue: Port 3000 or 5000 already in use
**Solution**:
```bash
# Kill process on port 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5000 (Mac/Linux)
lsof -ti:5000 | xargs kill -9

# On Windows
# Use Task Manager to end Node.js processes
```

### Issue: Frontend can't connect to backend
**Solution**: Make sure backend is running on port 5000. Check console for errors.

### Issue: CSS not loading properly
**Solution**: Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

## Project Structure Overview

```
shaadibiodata/
├── frontend/          → React app (Port 3000)
│   ├── src/
│   │   ├── pages/    → Home, Templates, CreateBiodata, Preview
│   │   ├── components/ → Header, Footer
│   │   └── data/     → Templates & form fields
│
├── server/           → Express API (Port 5000)
│   └── index.js     → Payment endpoints
│
├── README.md        → Full documentation
├── QUICK_START.md   → This file
└── RAZORPAY_SETUP.md → Payment setup guide
```

## Next Steps

1. **Test the UI**: Fill out forms and explore different templates
2. **Set up Razorpay**: Follow `RAZORPAY_SETUP.md` for payment integration
3. **Customize**: Modify colors, add templates, change branding
4. **Deploy**: Ready to go live? See deployment section in `README.md`

## Support

- Full documentation: See `README.md`
- Payment setup: See `RAZORPAY_SETUP.md`
- Need help? Check the troubleshooting sections

## What You Get

- ✅ Multi-religion support (Hindu, Muslim, Christian, Sikh)
- ✅ 7 premium templates (₹9 to ₹99)
- ✅ Responsive design (mobile + desktop)
- ✅ Browser-based PDF generation
- ✅ Razorpay payment integration ready
- ✅ Red, green, yellow color theme
- ✅ Professional UI/UX

Happy coding! 🎉
