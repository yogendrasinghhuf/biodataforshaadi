# System Architecture

## Overview

ShaadiiBiodata is a full-stack web application built with modern technologies, featuring a React frontend and Node.js backend with Razorpay payment integration.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User's Browser                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              React Frontend (Port 3000)                 │ │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────────┐   │ │
│  │  │  Home    │  │Templates │  │  CreateBiodata     │   │ │
│  │  │  Page    │  │  Page    │  │  (Multi-step Form) │   │ │
│  │  └──────────┘  └──────────┘  └────────────────────┘   │ │
│  │                                                          │ │
│  │  ┌──────────────────┐  ┌──────────────────────────┐   │ │
│  │  │  Preview Page    │  │  PDF Generator (jsPDF)   │   │ │
│  │  │  + Payment UI    │  │  (Browser-based)         │   │ │
│  │  └──────────────────┘  └──────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/API Calls
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Node.js Backend (Port 5000)                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    Express Server                       │ │
│  │  ┌──────────────────┐  ┌──────────────────────────┐   │ │
│  │  │  Payment Routes  │  │  Razorpay Integration    │   │ │
│  │  │  - Create Order  │  │  - Order Creation        │   │ │
│  │  │  - Verify        │  │  - Signature Verify      │   │ │
│  │  └──────────────────┘  └──────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Razorpay API
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Razorpay Service                        │
│  - Payment Processing                                        │
│  - UPI, Cards, Net Banking, Wallets                         │
│  - Webhooks                                                  │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
App.tsx (Router)
│
├── Header (Navigation)
│   ├── Logo
│   ├── Nav Links (Home, Templates)
│   └── Create Button
│
├── Pages
│   ├── Home
│   │   ├── Hero Section
│   │   ├── Features Grid
│   │   ├── How It Works
│   │   └── CTA Section
│   │
│   ├── Templates
│   │   ├── Filter Bar
│   │   ├── Template Cards (x7)
│   │   └── Pricing Display
│   │
│   ├── CreateBiodata
│   │   ├── Progress Bar
│   │   ├── Step 1: Religion Selection
│   │   ├── Step 2: Personal Info
│   │   ├── Step 3: Religion Details
│   │   ├── Step 4: Family Details
│   │   ├── Step 5: Contact Info
│   │   ├── Step 6: Preferences
│   │   ├── Step 7: Photo Upload
│   │   └── Step 8: Template Selection
│   │
│   └── Preview
│       ├── Biodata Preview
│       ├── Payment Summary
│       ├── Razorpay Checkout
│       └── PDF Generator
│
└── Footer
    ├── About Links
    ├── Feature List
    └── Copyright
```

## Data Flow

### 1. Biodata Creation Flow

```
User Input (Forms)
      ↓
Form State Management (React useState)
      ↓
Data Validation
      ↓
Local Storage (Optional)
      ↓
Preview Page (Review)
      ↓
Payment Initiation
```

### 2. Payment Flow

```
User Clicks "Pay"
      ↓
Frontend → POST /api/payment/create-order
      ↓
Backend → Razorpay API (Create Order)
      ↓
Backend ← Order Details
      ↓
Frontend ← Order Details
      ↓
Open Razorpay Checkout Modal
      ↓
User Completes Payment
      ↓
Razorpay → Payment Response
      ↓
Frontend → POST /api/payment/verify
      ↓
Backend Verifies Signature
      ↓
Backend → Success Response
      ↓
Frontend Generates PDF
      ↓
Auto-download PDF
      ↓
Redirect to Success Page
```

### 3. PDF Generation Flow (Browser-Based)

```
User Data (from form state)
      ↓
Template Selection (colors, layout)
      ↓
jsPDF Initialization
      ↓
Add Content:
   - Header with template colors
   - Personal information
   - Religion-specific details
   - Family information
   - Contact details
   - Partner preferences
   - Photo (if uploaded)
      ↓
Generate PDF Blob
      ↓
Trigger Browser Download
      ↓
PDF Downloaded to User's Device
```

## Technology Stack Details

### Frontend Stack

```
React 18 (UI Framework)
   │
   ├── TypeScript (Type Safety)
   ├── React Router v6 (Navigation)
   ├── CSS3 with Variables (Styling)
   ├── jsPDF (PDF Generation)
   ├── Axios (HTTP Client)
   └── Create React App (Build Tool)
```

### Backend Stack

```
Node.js (Runtime)
   │
   ├── Express.js (Web Framework)
   ├── Razorpay SDK (Payment Processing)
   ├── dotenv (Environment Variables)
   ├── CORS (Cross-Origin Support)
   └── body-parser (Request Parsing)
```

## API Endpoints

### Backend REST API

```
Base URL: http://localhost:5000 (dev) or https://your-domain.com (prod)

POST /api/payment/create-order
├── Request Body:
│   {
│     "amount": 49,
│     "currency": "INR",
│     "receipt": "biodata_1234567890"
│   }
└── Response:
    {
      "success": true,
      "order": {
        "id": "order_xxxxxxxxxxxxx",
        "amount": 4900,
        "currency": "INR"
      }
    }

POST /api/payment/verify
├── Request Body:
│   {
│     "razorpay_order_id": "order_xxxxxxxxxxxxx",
│     "razorpay_payment_id": "pay_xxxxxxxxxxxxx",
│     "razorpay_signature": "xxxxxxxxxxxxxxxxxxxxxxxx"
│   }
└── Response:
    {
      "success": true,
      "message": "Payment verified successfully"
    }

GET /api/health
└── Response:
    {
      "status": "OK",
      "message": "Server is running"
    }
```

## State Management

### Frontend State

```
CreateBiodata Component:
├── step (current step number)
├── religion (selected religion)
├── formData (all form fields)
├── photo (uploaded image file)
└── selectedTemplate (template ID)

Templates Component:
├── filter (category filter)
└── sortBy (price sorting)

Preview Component:
├── loading (payment processing state)
├── formData (from navigation state)
├── templateId (from navigation state)
└── photo (from navigation state)
```

## Security Architecture

### Frontend Security
- No sensitive data stored
- All processing in browser
- HTTPS enforced in production
- CSP headers (Content Security Policy)

### Backend Security
- Environment variables for secrets
- Server-side signature verification
- CORS configuration
- Input validation (recommended)
- Rate limiting (recommended)

### Payment Security
- Razorpay handles all card data
- PCI DSS compliant
- Signature verification on backend
- No sensitive payment data stored

## Deployment Architecture

### Production Setup

```
┌─────────────────────────────────┐
│  Cloudflare / CDN (Optional)    │
│  - DDoS Protection              │
│  - SSL/TLS                      │
└─────────────────────────────────┘
               ↓
┌─────────────────────────────────┐
│  Frontend (Vercel/Netlify)      │
│  - Static Files                 │
│  - Serverless Functions         │
│  - Auto-scaling                 │
│  - Global CDN                   │
└─────────────────────────────────┘
               ↓
┌─────────────────────────────────┐
│  Backend (Railway/Render)       │
│  - Node.js Runtime              │
│  - Environment Variables        │
│  - Auto-scaling                 │
│  - Health Checks                │
└─────────────────────────────────┘
               ↓
┌─────────────────────────────────┐
│  Razorpay Payment Gateway       │
│  - Payment Processing           │
│  - Multiple Payment Methods     │
└─────────────────────────────────┘
```

## Performance Considerations

### Frontend Optimization
- Lazy loading of routes (React.lazy)
- Code splitting by route
- Optimized images (future enhancement)
- CSS minification
- Tree shaking (unused code removal)

### Backend Optimization
- Stateless API (horizontal scaling ready)
- Quick response times
- Efficient signature verification
- Connection pooling (if database added)

## Browser Compatibility

```
Supported Browsers:
├── Chrome 90+ ✓
├── Firefox 88+ ✓
├── Safari 14+ ✓
├── Edge 90+ ✓
└── Mobile Browsers ✓
    ├── iOS Safari 14+
    └── Android Chrome 90+
```

## Data Privacy Architecture

### Privacy-First Design

```
User Data Flow:
1. User enters data → Stored in React state (RAM)
2. User uploads photo → Converted to blob (RAM)
3. Payment completed → Data processed in browser
4. PDF generated → jsPDF (client-side)
5. PDF downloaded → User's device
6. Page closed → All data cleared

NO SERVER STORAGE OF:
- Personal information
- Photos
- Generated PDFs
```

## Scalability

### Current Capacity
- Frontend: Unlimited (static files via CDN)
- Backend: 100-1000 req/sec (depends on hosting)
- Bottleneck: Payment processing rate (Razorpay limits)

### Scale Strategy
```
Small (< 1000 users/month)
└── Current architecture (Free/cheap hosting)

Medium (1000-10,000 users/month)
├── Add caching (Redis)
├── Load balancer
└── Database for analytics

Large (10,000+ users/month)
├── Kubernetes orchestration
├── Microservices architecture
├── Separate PDF generation service
└── CDN for assets
```

## Monitoring & Analytics

### Recommended Monitoring

```
Frontend:
├── Google Analytics (User behavior)
├── Sentry (Error tracking)
└── Vercel Analytics (Performance)

Backend:
├── New Relic / Datadog (APM)
├── Sentry (Error tracking)
├── Razorpay Dashboard (Payments)
└── Custom logging
```

## Future Enhancements Architecture

```
Potential Additions:
├── User Authentication (JWT)
├── Database (MongoDB/PostgreSQL)
│   ├── User profiles
│   ├── Saved biodatas
│   └── Template purchases history
├── Email Service (SendGrid)
│   └── PDF delivery via email
├── Admin Dashboard
│   ├── Analytics
│   ├── User management
│   └── Template management
└── Advanced Features
    ├── Template customization
    ├── Multi-language support
    ├── Social sharing
    └── QR code generation
```

---

## Architecture Benefits

✅ **Scalable**: Can handle growth from 10 to 10,000 users
✅ **Secure**: Payment processing follows best practices
✅ **Privacy-Focused**: No personal data stored on servers
✅ **Cost-Effective**: Minimal server costs
✅ **Fast**: Static frontend, efficient backend
✅ **Maintainable**: Clear separation of concerns
✅ **Modern**: Uses latest technologies and patterns

---

This architecture provides a solid foundation for a production-ready wedding biodata platform!
