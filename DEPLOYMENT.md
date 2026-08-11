# Deployment Guide

This guide will help you deploy your ShaadiiBiodata application to production.

## Pre-Deployment Checklist

- [ ] Razorpay KYC completed and live keys obtained
- [ ] All features tested locally
- [ ] Payment flow tested with real transactions (small amounts)
- [ ] Environment variables documented
- [ ] Domain name purchased (optional)
- [ ] SSL certificate ready (most platforms provide free SSL)

## Deployment Options

### Option 1: Recommended Setup (Easiest)

- **Frontend**: Vercel or Netlify (Free tier available)
- **Backend**: Railway or Render (Free tier available)

### Option 2: All-in-One

- **Both**: Heroku (Paid after free tier ends)

### Option 3: VPS

- **Both**: DigitalOcean, AWS, or Linode (Full control, requires more setup)

---

## Frontend Deployment

### Deploy to Vercel (Recommended - Easiest)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Or use Vercel Dashboard**
   - Go to https://vercel.com/
   - Sign in with GitHub
   - Import your repository
   - Select `frontend` folder as root directory
   - Build command: `npm run build`
   - Output directory: `build`
   - Deploy

5. **Update API URL**
   - After deploying backend, update the API endpoint in `frontend/src/pages/Preview.tsx`
   - Replace `http://localhost:5000` with your backend URL
   - Redeploy

### Deploy to Netlify (Alternative)

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

3. **Or use Netlify Dashboard**
   - Go to https://netlify.com/
   - Drag and drop the `build` folder
   - Or connect your GitHub repository

---

## Backend Deployment

### Deploy to Railway (Recommended - Free tier available)

1. **Go to Railway**
   - Visit https://railway.app/
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select `server` directory

3. **Set Environment Variables**
   - Go to your project settings
   - Click "Variables"
   - Add:
     ```
     RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXX
     RAZORPAY_KEY_SECRET=your_live_secret
     PORT=5000
     NODE_ENV=production
     ```

4. **Deploy**
   - Railway auto-deploys on push
   - Get your deployment URL (e.g., `your-app.railway.app`)

5. **Update CORS**
   - In `server/index.js`, update CORS to allow your frontend domain:
   ```javascript
   app.use(cors({
     origin: 'https://your-frontend-domain.vercel.app'
   }));
   ```

### Deploy to Render (Alternative)

1. **Go to Render**
   - Visit https://render.com/
   - Sign in with GitHub

2. **Create New Web Service**
   - Click "New +"
   - Select "Web Service"
   - Connect your repository
   - Root directory: `server`
   - Build command: `npm install`
   - Start command: `npm start`

3. **Set Environment Variables**
   - Add the same variables as Railway

4. **Deploy**
   - Render auto-deploys
   - Get your service URL

### Deploy to Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login and Create App**
   ```bash
   heroku login
   cd server
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXX
   heroku config:set RAZORPAY_KEY_SECRET=your_live_secret
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

---

## Full Deployment Process

### Step 1: Prepare for Production

1. **Update Frontend API Endpoint**

   In `frontend/src/pages/Preview.tsx`, create an environment-based URL:

   ```typescript
   const API_URL = process.env.NODE_ENV === 'production'
     ? 'https://your-backend-url.railway.app'
     : 'http://localhost:5000';

   // Replace all instances of http://localhost:5000 with API_URL
   ```

2. **Update Razorpay Keys**

   In `frontend/src/pages/Preview.tsx`:
   ```typescript
   key: 'rzp_live_XXXXXXXXXXXX', // Your live Key ID
   ```

3. **Build and Test Locally**
   ```bash
   cd frontend
   npm run build

   # Test the production build
   npx serve -s build
   ```

### Step 2: Deploy Backend First

1. Deploy backend to Railway/Render (see above)
2. Note down your backend URL (e.g., `https://your-app.railway.app`)
3. Test backend health endpoint:
   ```bash
   curl https://your-app.railway.app/api/health
   ```

### Step 3: Deploy Frontend

1. Update API_URL in frontend code with your backend URL
2. Commit changes
3. Deploy to Vercel/Netlify (see above)
4. Note down your frontend URL (e.g., `https://your-app.vercel.app`)

### Step 4: Update CORS

1. In your backend `server/index.js`, update CORS:
   ```javascript
   app.use(cors({
     origin: ['https://your-frontend-domain.vercel.app', 'https://your-custom-domain.com'],
     credentials: true
   }));
   ```
2. Redeploy backend

### Step 5: Test Production

1. Visit your frontend URL
2. Create a test biodata
3. Make a small real payment (₹9 template)
4. Verify PDF downloads correctly
5. Check Razorpay dashboard for the transaction

---

## Custom Domain Setup

### Frontend (Vercel)

1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain (e.g., `shaadibiodata.com`)
4. Update DNS records as instructed by Vercel
5. SSL certificate is automatically provisioned

### Backend (Railway)

1. Go to your Railway project settings
2. Click "Settings" → "Domains"
3. Add custom domain (e.g., `api.shaadibiodata.com`)
4. Update DNS records
5. SSL is automatically handled

---

## Environment Variables Summary

### Backend (.env or hosting platform)
```env
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_live_secret_here
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Frontend (Update in code or .env)
```env
REACT_APP_API_URL=https://your-backend-url.railway.app
REACT_APP_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXX
```

---

## Post-Deployment

### Monitor Your Application

1. **Razorpay Dashboard**
   - Monitor payments
   - Check for failed transactions
   - Review settlement reports

2. **Error Monitoring** (Recommended)
   - Set up Sentry: https://sentry.io/
   - Track frontend and backend errors

3. **Analytics** (Recommended)
   - Google Analytics
   - Plausible Analytics
   - Track user behavior and conversions

### Security Hardening

1. **Rate Limiting**
   Add to `server/index.js`:
   ```javascript
   const rateLimit = require('express-rate-limit');

   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });

   app.use('/api/', limiter);
   ```

2. **Helmet.js** (Security headers)
   ```bash
   cd server
   npm install helmet
   ```

   In `server/index.js`:
   ```javascript
   const helmet = require('helmet');
   app.use(helmet());
   ```

3. **Input Validation**
   ```bash
   npm install express-validator
   ```

### Backup Strategy

1. **Database** (if you add one later)
   - Regular automated backups
   - Store in separate location

2. **Code**
   - Keep in Git repository
   - GitHub/GitLab provides backup

3. **Payment Records**
   - Download from Razorpay regularly
   - Keep local records

---

## Scaling Considerations

### If Your Site Gets Popular

1. **CDN**: Use Vercel's built-in CDN or Cloudflare
2. **Caching**: Implement Redis for session management
3. **Database**: Add MongoDB/PostgreSQL for user accounts
4. **Queue**: Use Bull Queue for PDF generation if adding server-side generation
5. **Monitoring**: Use New Relic or Datadog

---

## Cost Estimates

### Free Tier (Getting Started)
- **Frontend** (Vercel): Free for personal projects
- **Backend** (Railway): $5/month after free trial
- **Domain**: $10-15/year
- **Razorpay**: Transaction fees only (2% + GST)

**Total**: ~$70-80/year + transaction fees

### Growing Business
- **Frontend** (Vercel Pro): $20/month
- **Backend** (Railway/Render): $10-20/month
- **Database** (if added): $15-25/month
- **Domain**: $15/year
- **SSL**: Free (Let's Encrypt)
- **Email** (if added): $6/month

**Total**: ~$500-700/year + transaction fees

---

## Troubleshooting Deployment

### Frontend not connecting to backend
- Check CORS settings in backend
- Verify API URL is correct
- Check browser console for errors

### Payment not working
- Verify live Razorpay keys are set
- Check Razorpay dashboard for errors
- Test in Razorpay's test mode first

### Build failures
- Check Node.js version compatibility
- Review build logs
- Ensure all dependencies are in package.json

### 404 errors on refresh
- For Vercel/Netlify: Add `_redirects` file
- Configure for single-page application routing

---

## Rollback Strategy

If something goes wrong:

1. **Frontend**: Vercel/Netlify keeps previous deployments
   - Go to deployments
   - Click on previous successful deployment
   - Click "Promote to Production"

2. **Backend**: Railway/Render
   - Go to deployments
   - Rollback to previous version
   - Or redeploy from specific Git commit

---

## Support Channels

- **Vercel**: https://vercel.com/support
- **Railway**: https://railway.app/help
- **Razorpay**: https://razorpay.com/support/
- **GitHub Issues**: For code-related problems

---

## Checklist Before Launch

- [ ] All features working locally
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Live Razorpay keys configured
- [ ] Test payment completed successfully
- [ ] PDF generation working
- [ ] Mobile responsive verified
- [ ] All links working
- [ ] HTTPS enabled
- [ ] Custom domain configured (optional)
- [ ] Analytics set up (optional)
- [ ] Error monitoring active (optional)

---

## You're Ready to Launch! 🚀

Once all steps are complete, your ShaadiiBiodata platform will be live and ready to accept real customers!
