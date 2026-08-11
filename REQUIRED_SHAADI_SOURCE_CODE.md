# BiodataForShaadi — Complete Source Code
> Share with REQUIRED_SHAADI_STYLES.md to recreate project from scratch.

## Setup
```bash
mkdir MarriageBiodata && cd MarriageBiodata
mkdir frontend server
cd frontend && npx create-react-app . --template typescript
cd ../server && npm init -y && npm install express cors razorpay dotenv
```

---

## `frontend/package.json`
```json
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.1",
    "@testing-library/user-event": "^13.5.0",
    "@types/jest": "^27.5.2",
    "@types/node": "^16.18.126",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "axios": "^1.13.2",
    "html2canvas": "^1.4.1",
    "jspdf": "^4.0.0",
    "jspdf-autotable": "^5.0.7",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "react-easy-crop": "^5.5.6",
    "react-image-crop": "^11.0.10",
    "react-router-dom": "^7.11.0",
    "react-scripts": "5.0.1",
    "typescript": "^4.9.5",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}

```

## `server/package.json`
```json
{
  "name": "server",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "dependencies": {
    "body-parser": "^2.2.1",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.2.1",
    "razorpay": "^2.9.6"
  }
}

```

## `server/index.js`
```js
const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET_HERE')
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
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

```

## `frontend/src/index.tsx`
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

```

## `frontend/src/App.tsx`
```tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Templates from './pages/Templates';
import CreateBiodataNew from './pages/CreateBiodataNew';
import Preview from './pages/Preview';
import LegalPage from './pages/LegalPage';
import './App.css';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/create" element={<CreateBiodataNew />} />
            <Route path="/download" element={<Preview />} />
            <Route path="/terms" element={<LegalPage />} />
            <Route path="/privacy" element={<LegalPage />} />
            <Route path="/refund" element={<LegalPage />} />
            <Route path="/shipping" element={<LegalPage />} />
            <Route path="/contact" element={<LegalPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

```

## `frontend/src/components/Header.tsx`
```tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <Link to="/" className="logo">
            <span className="logo-text text-gradient">BiodataForShaadi</span>
          </Link>

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>

          <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <li>
              <Link
                to="/"
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/templates"
                className={`nav-link ${isActive('/templates') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Templates
              </Link>
            </li>
            <li>
              <Link
                to="/create"
                className="btn btn-primary nav-btn"
                onClick={() => setMobileMenuOpen(false)}
              >
                Create Biodata
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;

```

## `frontend/src/components/Footer.tsx`
```tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-logo text-gradient">BiodataForShaadi</h3>
            <p className="footer-description">
              Create beautiful marriage biodatas with our easy-to-use platform.
              Privacy-focused, professional, and affordable.
            </p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/templates">Templates</Link></li>
              <li><Link to="/create">Create Biodata</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Why Choose Us?</h4>
            <ul className="footer-links">
              <li>100% Safe Payments</li>
              <li>Privacy First</li>
              <li>All Templates @ ₹11</li>
              <li>Easy to Create</li>
              <li>Lightning Fast</li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Support</h4>
            <ul className="footer-links">
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/refund">Refund Policy</Link></li>
              <li><Link to="/shipping">Shipping and Delivery Policy</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} BiodataForShaadi. All rights reserved.</p>
          <p className="footer-tagline">Made with ❤️ for finding perfect matches</p>
          <p className="footer-ssl">🔐 SSL Secured — every connection to our site is encrypted</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

```

## `frontend/src/data/godIcons.ts`
```ts
export interface GodIcon {
  id: string;
  label: string;
  /** Inline SVG markup, viewBox 0 0 100 100 */
  svg: string;
}

export const godIcons: GodIcon[] = [
  {
    id: 'om',
    label: 'Om',
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text x='50' y='76' text-anchor='middle' font-size='60' fill='#F57C00' font-family='serif' font-weight='600'>ॐ</text></svg>"
  },
  {
    id: 'shree',
    label: 'Shree',
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text x='50' y='74' text-anchor='middle' font-size='62' fill='#C49B1F' font-family='serif' font-weight='600'>श्री</text></svg>"
  },
  {
    id: 'lotus',
    label: 'Lotus',
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><g fill='#E91E63'><ellipse cx='50' cy='42' rx='10' ry='22'/><ellipse cx='32' cy='50' rx='10' ry='20' transform='rotate(-30 32 50)'/><ellipse cx='68' cy='50' rx='10' ry='20' transform='rotate(30 68 50)'/><ellipse cx='22' cy='62' rx='9' ry='16' transform='rotate(-60 22 62)'/><ellipse cx='78' cy='62' rx='9' ry='16' transform='rotate(60 78 62)'/></g><circle cx='50' cy='58' r='5' fill='#FFC107'/></svg>"
  },
  {
    id: 'diya',
    label: 'Diya',
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path fill='#D97706' d='M22,58 Q50,80 78,58 L72,72 Q50,84 28,72 Z'/><path fill='#FFC107' d='M50,55 Q44,42 50,28 Q56,42 50,55 Z'/></svg>"
  },
  {
    id: 'khanda',
    label: 'Khanda',
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='22' fill='none' stroke='#1A3F6B' stroke-width='4'/><rect x='47' y='10' width='6' height='80' fill='#1A3F6B'/><path fill='none' stroke='#1A3F6B' stroke-width='3' d='M28,30 Q18,50 28,70'/><path fill='none' stroke='#1A3F6B' stroke-width='3' d='M72,30 Q82,50 72,70'/></svg>"
  },
  {
    id: 'ikonkar',
    label: 'Ik Onkar',
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text x='50' y='76' text-anchor='middle' font-size='60' fill='#1A3F6B' font-family='serif' font-weight='600'>ੴ</text></svg>"
  },
  {
    id: 'crescent',
    label: 'Crescent',
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path fill='#4CAF50' fill-rule='evenodd' d='M50,12 A38,38 0 1,1 50,88 A38,38 0 1,1 50,12 Z M60,22 A28,28 0 1,1 60,78 A28,28 0 1,1 60,22 Z'/><polygon fill='#4CAF50' points='70,38 73,46 81,46 75,52 77,60 70,55 63,60 65,52 59,46 67,46'/></svg>"
  },
  {
    id: 'cross',
    label: 'Cross',
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect x='42' y='10' width='16' height='80' fill='#E8634E'/><rect x='18' y='34' width='64' height='16' fill='#E8634E'/></svg>"
  },
  {
    id: 'star-of-david',
    label: 'Star of David',
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><g fill='none' stroke='#1976D2' stroke-width='5' stroke-linejoin='miter'><polygon points='50,12 86,75 14,75'/><polygon points='50,88 14,25 86,25'/></g></svg>"
  },
  {
    id: 'dharma',
    label: 'Dharma Wheel',
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='35' fill='none' stroke='#FBC02D' stroke-width='6'/><circle cx='50' cy='50' r='5' fill='#FBC02D'/><g stroke='#FBC02D' stroke-width='5'><line x1='50' y1='17' x2='50' y2='83'/><line x1='17' y1='50' x2='83' y2='50'/><line x1='26' y1='26' x2='74' y2='74'/><line x1='74' y1='26' x2='26' y2='74'/></g></svg>"
  }
];

const DEFAULT_ID = 'om';

/** Look up the SVG markup for a given icon id. Falls back to Om if the id is unknown or stale (e.g. from a pre-refactor saved state holding an emoji character). */
export const getIconSvg = (id: string | undefined | null): string => {
  const match = godIcons.find(g => g.id === id);
  return (match || godIcons.find(g => g.id === DEFAULT_ID) || godIcons[0]).svg;
};

/** Normalize a possibly-stale id (e.g. an emoji left over from the pre-refactor state) to a valid id. */
export const normalizeIconId = (id: string | undefined | null): string => {
  if (id && godIcons.some(g => g.id === id)) return id;
  return DEFAULT_ID;
};

```

## `frontend/src/data/templates.ts`
```ts
export const templates = [
  {
    id: 'elegant-red',
    name: 'Classic Noir',
    price: 11,
    description: 'Refined black double-line frame on crisp white — the timeless classic',
    category: 'Classic',
    colors: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#6B7280',
      background: '#FFFFFF'
    },
    preview: 'elegant-red-preview',
    borderStyle: 'double'
  },
  {
    id: 'modern-green',
    name: 'Classic Pine',
    price: 11,
    description: 'Deep pine-green single thick frame — clean and unornamented',
    category: 'Classic',
    colors: {
      primary: '#1F4F36',
      secondary: '#143D2B',
      accent: '#C4D6CD',
      background: '#FFFFFF'
    },
    preview: 'modern-green-preview',
    borderStyle: 'solid'
  },
  {
    id: 'golden-yellow',
    name: 'Classic Gold',
    price: 11,
    description: 'Refined gold frame with stepped 90-degree notch cuts at each corner',
    category: 'Classic',
    colors: {
      primary: '#C49B1F',
      secondary: '#9B7A19',
      accent: '#F4DDA0',
      background: '#FFFFFF'
    },
    preview: 'golden-yellow-preview',
    borderStyle: 'double'
  },
  {
    id: 'festive-trio',
    name: 'Classic Burgundy',
    price: 11,
    description: 'Burgundy broken/segmented frame — corner L-brackets and mid-edge segments with visible gaps',
    category: 'Classic',
    colors: {
      primary: '#6B1F36',
      secondary: '#4D1626',
      accent: '#C9A0A8',
      background: '#FFFFFF'
    },
    preview: 'festive-trio-preview',
    borderStyle: 'solid'
  },
  {
    id: 'royal-red',
    name: 'Classic Crimson',
    price: 11,
    description: 'Deep crimson fully-dashed frame — a single dashed rectangle around the page',
    category: 'Classic',
    colors: {
      primary: '#8B1A1A',
      secondary: '#6B1414',
      accent: '#FCA5A5',
      background: '#FFFFFF'
    },
    preview: 'royal-red-preview',
    borderStyle: 'double'
  },
  {
    id: 'nature-green',
    name: 'Elegant Forest',
    price: 21,
    description: 'Refined forest-green rounded-corner double frame on warm sandy-taupe background',
    category: 'Elegant',
    colors: {
      primary: '#2D5A3D',
      secondary: '#1F4530',
      accent: '#A8C9B0',
      background: '#E8DEC8'
    },
    preview: 'nature-green-preview',
    borderStyle: 'double'
  },
  {
    id: 'luxury-gold',
    name: 'Elegant Gold',
    price: 21,
    description: 'Gold frame with inward arrow notches at all four mid-edges on light buttercream',
    category: 'Elegant',
    colors: {
      primary: '#9B7A2C',
      secondary: '#7A601F',
      accent: '#E8C77A',
      background: '#F8EFD4'
    },
    preview: 'luxury-gold-preview',
    borderStyle: 'double'
  },
  {
    id: 'maroon-elegance',
    name: 'Elegant Maroon',
    price: 21,
    description: 'Maroon extended corner brackets (no perimeter) on light blush background',
    category: 'Elegant',
    colors: {
      primary: '#6B2737',
      secondary: '#4D1626',
      accent: '#D6B9A0',
      background: '#F4E0DC'
    },
    preview: 'maroon-elegance-preview',
    borderStyle: 'solid'
  },
  {
    id: 'pink-blossom',
    name: 'Elegant Rose',
    price: 21,
    description: 'Dusty rose scalloped top and bottom edges on light blush background',
    category: 'Elegant',
    colors: {
      primary: '#B14963',
      secondary: '#933349',
      accent: '#F2C8D2',
      background: '#FAE4E8'
    },
    preview: 'pink-blossom-preview',
    borderStyle: 'solid'
  },
  {
    id: 'emerald-classic',
    name: 'Elegant Emerald',
    price: 21,
    description: 'Sharp outer frame with rounded inner frame (mixed-corner) on light mint',
    category: 'Elegant',
    colors: {
      primary: '#1F6655',
      secondary: '#0F4D40',
      accent: '#A5D6CB',
      background: '#E0F0E8'
    },
    preview: 'emerald-classic-preview',
    borderStyle: 'solid'
  },
  {
    id: 'royal-blue',
    name: 'Elegant Azure',
    price: 21,
    description: 'Refined deep navy Venetian-stripe frame — five thin parallel lines on light powder blue',
    category: 'Elegant',
    colors: {
      primary: '#1E3A5C',
      secondary: '#0F2A47',
      accent: '#9DB5D2',
      background: '#E8EFF6'
    },
    preview: 'royal-blue-preview',
    borderStyle: 'solid'
  },
  {
    id: 'crimson-rose',
    name: 'Crimson Royal',
    price: 51,
    description: 'Deep crimson dual-tone background with a gold double border and gold-on-dark typography',
    category: 'Royal',
    colors: {
      primary: '#D4AF55',
      secondary: '#5B1230',
      accent: '#E8C77A',
      background: '#3A0B1E'
    },
    preview: 'crimson-rose-preview',
    borderStyle: 'double'
  },
  {
    id: 'peacock-green',
    name: 'Peacock Royal',
    price: 51,
    description: 'Deep teal-green dual-tone background with a gold double border and gold-on-dark typography',
    category: 'Royal',
    colors: {
      primary: '#D4AF55',
      secondary: '#0A3B36',
      accent: '#E8C77A',
      background: '#0A2E2A'
    },
    preview: 'peacock-green-preview',
    borderStyle: 'double'
  },
  {
    id: 'amber-classic',
    name: 'Burgundy Filigree',
    price: 51,
    description: 'Gold filigree scrollwork at corners and a flourishing top/bottom band on dark plum dual-tone — royal dark format',
    category: 'Royal',
    colors: {
      primary: '#D4AF55',
      secondary: '#3D1A40',
      accent: '#E8C77A',
      background: '#29132B'
    },
    preview: 'amber-classic-preview',
    borderStyle: 'double'
  },
  {
    id: 'royal-mandala',
    name: 'Pearl Strand',
    price: 51,
    description: 'Three concentric gold pearl-bead strands on dark charcoal dual-tone — royal dark format',
    category: 'Royal',
    colors: {
      primary: '#D4AF55',
      secondary: '#2E2E2E',
      accent: '#E8C77A',
      background: '#1C1C1C'
    },
    preview: 'royal-mandala-preview',
    borderStyle: 'dotted'
  },
  {
    id: 'sapphire-classic',
    name: 'Sapphire Classic',
    price: 51,
    description: 'Deep navy premium design with gold double border and gold-on-dark typography — a rich dark biodata, recreated from the Sapphire sample',
    category: 'Royal',
    colors: {
      primary: '#C9A14A',
      secondary: '#1E3A5F',
      accent: '#E8C77A',
      background: '#16243D'
    },
    preview: 'sapphire-classic-preview',
    borderStyle: 'double'
  }
];

const ORIGINAL_PRICE_BY_TIER: { [tier: number]: number } = {
  11: 51,
  21: 101,
  51: 251
};

export const getOriginalPrice = (price: number) => ORIGINAL_PRICE_BY_TIER[price] ?? price;

export const getTemplateById = (id: string) => {
  return templates.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: string) => {
  return templates.filter(template => template.category === category);
};

export const getTemplatesByPriceRange = (min: number, max: number) => {
  return templates.filter(template => template.price >= min && template.price <= max);
};

```

## `frontend/src/data/religionFields.ts`
```ts
// Generate height options from 3'5" to 7'8" with cm in brackets
const generateHeightOptions = () => {
  const heights = [];
  for (let totalInches = 41; totalInches <= 92; totalInches++) {
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    const cm = Math.round(totalInches * 2.54);
    heights.push(`${feet} ft ${inches} inch (${cm} cm)`);
  }
  return heights;
};

export const religionSpecificFields = {
  hindu: {
    name: 'Hindu',
    fields: [
      { name: 'caste', label: 'Caste', type: 'text', required: false },
      { name: 'subCaste', label: 'Sub-Caste', type: 'text', required: false },
      { name: 'gotra', label: 'Gotra', type: 'text', required: false },
      { name: 'rashi', label: 'Rashi (Moon Sign)', type: 'select', required: false, options: [
        'Aries (Mesh)', 'Taurus (Vrishabh)', 'Gemini (Mithun)', 'Cancer (Kark)',
        'Leo (Simha)', 'Virgo (Kanya)', 'Libra (Tula)', 'Scorpio (Vrishchik)',
        'Sagittarius (Dhanu)', 'Capricorn (Makar)', 'Aquarius (Kumbh)', 'Pisces (Meen)'
      ]},
      { name: 'nakshatra', label: 'Nakshatra (Birth Star)', type: 'text', required: false },
      { name: 'manglik', label: 'Manglik Status', type: 'select', required: false, options: [
        'Yes', 'No', 'Anshik (Partial)', 'Doesn\'t Matter'
      ]},
      { name: 'deity', label: 'Kul Devta/Devi', type: 'text', required: false }
    ]
  },
  muslim: {
    name: 'Muslim',
    fields: [
      { name: 'sect', label: 'Sect', type: 'select', required: false, options: [
        'Sunni', 'Shia', 'Ahmadiyya', 'Other'
      ]},
      { name: 'community', label: 'Community', type: 'text', required: false },
      { name: 'maslak', label: 'Maslak/School of Thought', type: 'select', required: false, options: [
        'Hanafi', 'Maliki', 'Shafi\'i', 'Hanbali', 'Ja\'fari', 'Other'
      ]},
      { name: 'namazPractice', label: 'Namaz Practice', type: 'select', required: false, options: [
        'Regular (5 times)', 'Often', 'Sometimes', 'On Special Occasions'
      ]},
      { name: 'hijab', label: 'Hijab/Purdah', type: 'select', required: false, options: [
        'Yes', 'No', 'Partially', 'Prefer not to say'
      ]},
      { name: 'arabicName', label: 'Arabic Name (if different)', type: 'text', required: false }
    ]
  },
  christian: {
    name: 'Christian',
    fields: [
      { name: 'denomination', label: 'Denomination', type: 'select', required: false, options: [
        'Catholic', 'Protestant', 'Orthodox', 'Anglican', 'Pentecostal',
        'Baptist', 'Methodist', 'Lutheran', 'Other'
      ]},
      { name: 'churchAffiliation', label: 'Church Affiliation', type: 'text', required: false },
      { name: 'baptized', label: 'Baptized', type: 'select', required: false, options: [
        'Yes', 'No', 'Planning to'
      ]},
      { name: 'sundayService', label: 'Church Attendance', type: 'select', required: false, options: [
        'Weekly', 'Monthly', 'Occasionally', 'On Special Occasions'
      ]},
      { name: 'communityService', label: 'Community Service', type: 'select', required: false, options: [
        'Active', 'Occasional', 'None'
      ]},
      { name: 'biblicalName', label: 'Biblical/Confirmation Name', type: 'text', required: false }
    ]
  },
  sikh: {
    name: 'Sikh',
    fields: [
      { name: 'caste', label: 'Caste/Community', type: 'select', required: false, options: [
        'Jat', 'Khatri', 'Arora', 'Ramgarhia', 'Saini', 'Lubana', 'Ahluwalia',
        'Caste No Bar', 'Other'
      ]},
      { name: 'amritdhari', label: 'Amritdhari Status', type: 'select', required: false, options: [
        'Yes (Amritdhari)', 'No (Keshdhari)', 'Sehajdhari', 'Mona'
      ]},
      { name: 'gurdwaraAffiliation', label: 'Gurdwara Affiliation', type: 'text', required: false },
      { name: 'languageProficiency', label: 'Punjabi Proficiency', type: 'select', required: false, options: [
        'Fluent', 'Conversational', 'Basic', 'Learning'
      ]},
      { name: 'kirtan', label: 'Kirtan/Seva Participation', type: 'select', required: false, options: [
        'Active', 'Occasional', 'None'
      ]},
      { name: 'turban', label: 'Turban (for males)', type: 'select', required: false, options: [
        'Yes', 'No', 'Sometimes', 'N/A'
      ]}
    ]
  }
};

export const commonFields = [
  { name: 'fullName', label: 'Full Name', type: 'text', required: true },
  { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
  { name: 'timeOfBirth', label: 'Time of Birth', type: 'time', required: false },
  { name: 'placeOfBirth', label: 'Place of Birth', type: 'text', required: false },
  { name: 'height', label: 'Height', type: 'select', required: false, options: generateHeightOptions() },
  { name: 'weight', label: 'Weight', type: 'text', required: false, placeholder: 'e.g., 65 kg' },
  { name: 'complexion', label: 'Complexion', type: 'select', required: false, options: [
    'Fair', 'Wheatish', 'Dusky', 'Dark'
  ]},
  { name: 'bloodGroup', label: 'Blood Group', type: 'select', required: false, options: [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Don\'t Know'
  ]},
  { name: 'maritalStatus', label: 'Marital Status', type: 'select', required: false, options: [
    'Never Married', 'Divorced', 'Widowed', 'Separated'
  ]},
  { name: 'education', label: 'Highest Education', type: 'text', required: false },
  { name: 'college', label: 'College/University', type: 'text', required: false },
  { name: 'occupation', label: 'Occupation', type: 'text', required: false },
  { name: 'company', label: 'Company Name', type: 'text', required: false },
  { name: 'annualIncome', label: 'Annual Income', type: 'text', required: false },
  { name: 'workLocation', label: 'Work Location', type: 'text', required: false }
];

export const familyFields = [
  { name: 'fatherName', label: "Father's Name", type: 'text', required: false },
  { name: 'fatherOccupation', label: "Father's Occupation", type: 'text', required: false },
  { name: 'motherName', label: "Mother's Name", type: 'text', required: false },
  { name: 'motherOccupation', label: "Mother's Occupation", type: 'text', required: false },
  { name: 'siblings', label: 'Number of Siblings', type: 'text', required: false },
  { name: 'siblingsMarried', label: 'Siblings Married', type: 'text', required: false },
  { name: 'familyType', label: 'Family Type', type: 'select', required: false, options: [
    'Nuclear', 'Joint', 'Extended'
  ]},
  { name: 'familyValues', label: 'Family Values', type: 'select', required: false, options: [
    'Traditional', 'Moderate', 'Liberal'
  ]},
  { name: 'familyIncome', label: 'Family Income', type: 'select', required: false, options: [
    'Lower Middle Class', 'Middle Class', 'Upper Middle Class', 'Rich', 'Affluent'
  ]},
  { name: 'nativePlace', label: 'Native Place', type: 'text', required: false },
  { name: 'currentAddress', label: 'Current Address', type: 'textarea', required: false }
];

export const contactFields = [
  { name: 'phone', label: 'Phone Number', type: 'tel', required: false },
  { name: 'email', label: 'Email Address', type: 'email', required: false },
  { name: 'whatsapp', label: 'Alternate Number', type: 'tel', required: false },
  { name: 'address', label: 'Contact Address', type: 'textarea', required: false }
];

export const preferencesFields = [
  { name: 'partnerAgeRange', label: 'Partner Age Range', type: 'text', required: false, placeholder: 'e.g., 25-30' },
  { name: 'partnerHeight', label: 'Partner Height Preference', type: 'text', required: false },
  { name: 'partnerEducation', label: 'Partner Education', type: 'text', required: false },
  { name: 'partnerOccupation', label: 'Partner Occupation', type: 'text', required: false },
  { name: 'partnerLocation', label: 'Partner Location', type: 'text', required: false },
  { name: 'otherPreferences', label: 'Other Preferences', type: 'textarea', required: false }
];

export const getReligionFields = (religion: string) => {
  return (religionSpecificFields as any)[religion] || { name: 'Unknown', fields: [] };
};

```

## `frontend/src/pages/Home.tsx`
```tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: '🔒',
      title: '100% Safe Payments',
      description: 'Secure checkout powered by Razorpay, trusted by millions across India'
    },
    {
      icon: '🛡️',
      title: 'Privacy First',
      description: 'Your data stays in your browser. We never upload your personal information'
    },
    {
      icon: '💸',
      title: 'All Templates @ ₹11',
      description: 'One-time payment, no subscription, instant access to your biodata'
    },
    {
      icon: '✍️',
      title: 'Easy to Create',
      description: 'Create your biodata in just 3 easy steps, no design skills needed'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Create and download your biodata in minutes, not hours'
    }
  ];

  const stats = [
    { number: '16', label: 'Premium Templates' },
    { number: '4', label: 'Religions Supported' },
    { number: '₹11', label: 'All Templates @ ₹11', tag: 'Limited Time Offer' },
    { number: '100%', label: 'Privacy Guaranteed' }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content fade-in">
            <h1 className="hero-title">
              Create Your Perfect
              <span className="text-gradient"> Wedding Biodata</span>
            </h1>
            <p className="hero-subtitle">
              Choose from beautiful templates, fill in your details, and download your
              professional marriage biodata in minutes
            </p>
            <div className="hero-buttons">
              <button
                className="btn btn-primary btn-large"
                onClick={() => navigate('/create')}
              >
                Get Started Now
              </button>
              <button
                className="btn btn-outline btn-large"
                onClick={() => navigate('/templates')}
              >
                View Templates
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card slide-in">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
                {stat.tag && <div className="stat-tag">{stat.tag}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="container">
          <h2 className="section-title">Why Choose Us?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card card fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Fill Details</h3>
              <p>Enter your personal, family, and contact information</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Choose Template</h3>
              <p>Pick from our collection of premium designs</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Download PDF</h3>
              <p>Pay and instantly download your biodata</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Create Your Biodata?</h2>
            <p className="cta-text">Join thousands who have created their perfect marriage biodata with us</p>
            <button className="btn btn-success btn-large" onClick={() => navigate('/create')}>
              Start Creating Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

```

## `frontend/src/pages/Templates.tsx`
```tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { templates, getOriginalPrice } from '../data/templates';
import '../components/TemplateCard.css';
import './Templates.css';

const generateBorderSVG = (color: string, templateId: string): string => {
  const encodedColor = encodeURIComponent(color);
  const svgPatterns: { [key: string]: string } = {
    'elegant-red': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='12' y='12' width='376' height='576' stroke-width='1.5'/><rect x='20' y='20' width='360' height='560' stroke-width='0.6'/></g></svg>`,
    'modern-green': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='14' y='14' width='372' height='572' stroke-width='2.5'/></g></svg>`,
    'golden-yellow': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter' stroke-linecap='square'><path stroke-width='1.5' d='M30,12 L370,12 M388,30 L388,570 M370,588 L30,588 M12,570 L12,30'/><path stroke-width='1.5' d='M30,12 L20,12 L20,22 L12,22 L12,30'/><path stroke-width='1.5' d='M370,12 L380,12 L380,22 L388,22 L388,30'/><path stroke-width='1.5' d='M388,570 L388,578 L380,578 L380,588 L370,588'/><path stroke-width='1.5' d='M12,570 L12,578 L20,578 L20,588 L30,588'/></g></svg>`,
    'festive-trio': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='2' stroke-linecap='square'><path d='M12,80 L12,12 L80,12'/><path d='M320,12 L388,12 L388,80'/><path d='M388,520 L388,588 L320,588'/><path d='M80,588 L12,588 L12,520'/><path d='M150,12 L250,12'/><path d='M150,588 L250,588'/><path d='M12,220 L12,380'/><path d='M388,220 L388,380'/></g></svg>`,
    'royal-red': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='14' y='14' width='372' height='572' stroke-width='1.5' stroke-dasharray='8 4'/></g></svg>`,
    'nature-green': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='14' y='14' width='372' height='572' rx='20' stroke-width='1.5'/><rect x='22' y='22' width='356' height='556' rx='14' stroke-width='0.6'/></g></svg>`,
    'luxury-gold': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><path stroke-width='1.5' d='M14,14 L185,14 L200,32 L215,14 L386,14 L386,285 L368,300 L386,315 L386,586 L215,586 L200,568 L185,586 L14,586 L14,315 L32,300 L14,285 Z'/></g></svg>`,
    'maroon-elegance': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linecap='square'><path stroke-width='2.5' d='M14,160 L14,14 L160,14'/><path stroke-width='2.5' d='M240,14 L386,14 L386,160'/><path stroke-width='2.5' d='M386,440 L386,586 L240,586'/><path stroke-width='2.5' d='M160,586 L14,586 L14,440'/><path stroke-width='0.8' d='M22,150 L22,22 L150,22'/><path stroke-width='0.8' d='M250,22 L378,22 L378,150'/><path stroke-width='0.8' d='M378,450 L378,578 L250,578'/><path stroke-width='0.8' d='M150,578 L22,578 L22,450'/></g></svg>`,
    'pink-blossom': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='1.5'><path d='M14,14 L14,586'/><path d='M386,14 L386,586'/><path d='M14,14 Q24,24 34,14 Q44,24 54,14 Q64,24 74,14 Q84,24 94,14 Q104,24 114,14 Q124,24 134,14 Q144,24 154,14 Q164,24 174,14 Q184,24 194,14 Q204,24 214,14 Q224,24 234,14 Q244,24 254,14 Q264,24 274,14 Q284,24 294,14 Q304,24 314,14 Q324,24 334,14 Q344,24 354,14 Q364,24 374,14 Q384,24 386,14'/><path d='M14,586 Q24,576 34,586 Q44,576 54,586 Q64,576 74,586 Q84,576 94,586 Q104,576 114,586 Q124,576 134,586 Q144,576 154,586 Q164,576 174,586 Q184,576 194,586 Q204,576 214,586 Q224,576 234,586 Q244,576 254,586 Q264,576 274,586 Q284,576 294,586 Q304,576 314,586 Q324,576 334,586 Q344,576 354,586 Q364,576 374,586 Q384,576 386,586'/></g></svg>`,
    'emerald-classic': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='14' y='14' width='372' height='572' stroke-width='1.5'/><rect x='26' y='26' width='348' height='548' rx='22' stroke-width='0.8'/></g></svg>`,
    'royal-blue': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='0.7'><rect x='12' y='12' width='376' height='576'/><rect x='16' y='16' width='368' height='568'/><rect x='20' y='20' width='360' height='560'/><rect x='24' y='24' width='352' height='552'/><rect x='28' y='28' width='344' height='544'/></g></svg>`,
    'crimson-rose': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linecap='round'><rect x='20' y='20' width='360' height='560' stroke-width='3' stroke-dasharray='0.5 17'/><rect x='33' y='33' width='334' height='534' stroke-width='0.8'/></g></svg>`,
    'peacock-green': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='16' y='16' width='368' height='568' stroke-width='2.5' stroke-dasharray='16 7'/></g><g fill='${encodedColor}'><path d='M16,5 L27,16 L16,27 L5,16 Z'/><path d='M384,5 L395,16 L384,27 L373,16 Z'/><path d='M16,573 L27,584 L16,595 L5,584 Z'/><path d='M384,573 L395,584 L384,595 L373,584 Z'/></g></svg>`,
    'amber-classic': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M28,18 Q28,8 18,8 Q8,8 8,18 Q8,28 18,28 Q24,28 24,22 Q24,17 19,17'/><path d='M28,18 Q45,12 60,18 Q75,24 90,18 Q100,14 110,18'/><path stroke-width='1.2' d='M110,18 Q116,10 124,15 Q124,21 118,20'/><path d='M124,18 Q138,18 152,18'/><path d='M18,28 Q12,45 18,60 Q24,75 18,90 Q14,100 18,110'/><path stroke-width='1.2' d='M18,110 Q10,116 15,124 Q21,124 20,118'/><path d='M18,124 Q18,138 18,152'/><path d='M372,18 Q372,8 382,8 Q392,8 392,18 Q392,28 382,28 Q376,28 376,22 Q376,17 381,17'/><path d='M372,18 Q355,12 340,18 Q325,24 310,18 Q300,14 290,18'/><path stroke-width='1.2' d='M290,18 Q284,10 276,15 Q276,21 282,20'/><path d='M276,18 Q262,18 248,18'/><path d='M382,28 Q388,45 382,60 Q376,75 382,90 Q386,100 382,110'/><path stroke-width='1.2' d='M382,110 Q390,116 385,124 Q379,124 380,118'/><path d='M382,124 Q382,138 382,152'/><path d='M28,582 Q28,592 18,592 Q8,592 8,582 Q8,572 18,572 Q24,572 24,578 Q24,583 19,583'/><path d='M28,582 Q45,588 60,582 Q75,576 90,582 Q100,586 110,582'/><path stroke-width='1.2' d='M110,582 Q116,590 124,585 Q124,579 118,580'/><path d='M124,582 Q138,582 152,582'/><path d='M18,572 Q12,555 18,540 Q24,525 18,510 Q14,500 18,490'/><path stroke-width='1.2' d='M18,490 Q10,484 15,476 Q21,476 20,482'/><path d='M18,476 Q18,462 18,448'/><path d='M372,582 Q372,592 382,592 Q392,592 392,582 Q392,572 382,572 Q376,572 376,578 Q376,583 381,583'/><path d='M372,582 Q355,588 340,582 Q325,576 310,582 Q300,586 290,582'/><path stroke-width='1.2' d='M290,582 Q284,590 276,585 Q276,579 282,580'/><path d='M276,582 Q262,582 248,582'/><path d='M382,572 Q388,555 382,540 Q376,525 382,510 Q386,500 382,490'/><path stroke-width='1.2' d='M382,490 Q390,484 385,476 Q379,476 380,482'/><path d='M382,476 Q382,462 382,448'/></g><g fill='${encodedColor}'><circle cx='180' cy='18' r='3'/><circle cx='200' cy='18' r='4'/><circle cx='220' cy='18' r='3'/><circle cx='180' cy='582' r='3'/><circle cx='200' cy='582' r='4'/><circle cx='220' cy='582' r='3'/><circle cx='18' cy='260' r='2.5'/><circle cx='18' cy='300' r='3'/><circle cx='18' cy='340' r='2.5'/><circle cx='382' cy='260' r='2.5'/><circle cx='382' cy='300' r='3'/><circle cx='382' cy='340' r='2.5'/></g></svg>`,
    'royal-mandala': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='8' y='8' width='384' height='584' stroke-width='1.2' stroke-dasharray='0.5 4' stroke-linecap='round'/><rect x='16' y='16' width='368' height='568' stroke-width='2.2' stroke-dasharray='0.5 9' stroke-linecap='round'/><rect x='24' y='24' width='352' height='552' stroke-width='0.6'/></g></svg>`,
    'sapphire-classic': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='15' y='15' width='370' height='570' stroke-width='2'/><rect x='26' y='26' width='348' height='548' stroke-width='0.8'/></g><g fill='${encodedColor}'><rect x='5' y='5' width='18' height='18'/><rect x='377' y='5' width='18' height='18'/><rect x='5' y='577' width='18' height='18'/><rect x='377' y='577' width='18' height='18'/></g></svg>`,
  };
  const defaultPattern = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g stroke='${encodedColor}' stroke-width='2.5' fill='none'><path d='M5,5 L60,5 M5,5 L5,60 M395,5 L340,5 M395,5 L395,60 M5,595 L60,595 M5,595 L5,540 M395,595 L340,595 M395,595 L395,540 M80,5 L320,5 M80,595 L320,595 M5,100 L5,500 M395,100 L395,500'/></g></svg>`;
  const svgPattern = templateId in svgPatterns ? svgPatterns[templateId] : defaultPattern;
  if (!svgPattern) return 'none';
  return `url("data:image/svg+xml,${svgPattern}")`;
};

const Templates: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');

  const categories = ['all', 'Classic', 'Elegant', 'Royal'];

  const filteredTemplates = templates.filter(
    (template) => filter === 'all' || template.category === filter
  );

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0; // 'default' keeps original array order
  });

  const handleSelect = (templateId: string) => {
    navigate('/create', { state: { templateId } });
  };

  return (
    <div className="templates-page">
      <div className="container">
        <div className="page-header fade-in">
          <h1 className="page-title">Premium Templates</h1>
          <p className="page-subtitle">
            Choose from our collection of beautifully designed biodata templates
          </p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Category:</label>
            <div className="filter-buttons">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`filter-btn ${filter === category ? 'active' : ''}`}
                  onClick={() => setFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="sort-group">
            <label>Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="default">Default Order</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Templates Grid — same card structure as CreateBiodataNew gallery */}
        <div className="templates-page-grid">
          {sortedTemplates.map((tmpl, index) => (
            <div
              key={tmpl.id}
              className="template-card"
              onClick={() => handleSelect(tmpl.id)}
            >
              <div
                className={`template-preview-box border-template-${tmpl.id}`}
                style={{
                  background: tmpl.colors.background.toUpperCase() === '#FFFFFF' ? 'white' : tmpl.colors.background,
                  position: 'relative',
                }}
              >
                <img
                  className="template-card-border-img"
                  src={generateBorderSVG(tmpl.colors.primary, tmpl.id).replace(/^url\("/, '').replace(/"\)$/, '')}
                  alt=""
                  aria-hidden="true"
                />
                <div className="template-number-badge" style={{ backgroundColor: tmpl.colors.primary }}>
                  #{index + 1}
                </div>
                <div className="template-preview-content-centered">
                  <h4 className="template-name-inside" style={{ color: tmpl.colors.primary }}>
                    {tmpl.name}
                  </h4>
                  <div className="template-price-container">
                    <div className="template-price-row">
                      <span className="template-price-current">₹11</span>
                      <span className="template-price-original">₹{getOriginalPrice(tmpl.price)}</span>
                    </div>
                    <span className="template-discount-badge">
                      {Math.round((1 - 11 / getOriginalPrice(tmpl.price)) * 100)}% OFF
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedTemplates.length === 0 && (
          <div className="no-results">
            <p>No templates found in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates;

```

## `frontend/src/pages/Preview.tsx`
```tsx
import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import axios from 'axios'; // Will be used when payment is enabled
import { getTemplateById, getOriginalPrice } from '../data/templates';
import { getIconSvg } from '../data/godIcons';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import './Preview.css';
import './biodata-preview-shared.css';

// declare global {
//   interface Window {
//     Razorpay: any;
//   }
// }

const Preview: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formData, religion, photo, templateId, customColor, selectedSymbol, showGaneshaIcon = true, showShreeGanesh = true, showBiodata = true, shreeGaneshText = '|| Shree Ganeshay Namah ||', biodataText = 'BIODATA', selectedGodIcon = 'om', photoShape = 'rectangle' } = location.state || {};

  // const [loading, setLoading] = useState(false); // Will be used when payment is enabled
  // const [paymentSuccess, setPaymentSuccess] = useState(false); // Will be used when payment is enabled
  // const [downloadReady, setDownloadReady] = useState(false); // Will be used when payment is enabled
  const template = getTemplateById(templateId);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!formData || !template) {
      navigate('/create');
    }

    // Razorpay script loading disabled - will be enabled when payment is added
    // const script = document.createElement('script');
    // script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    // script.async = true;
    // document.body.appendChild(script);
    // return () => { document.body.removeChild(script); };
  }, [formData, template, navigate]);

  // Renders the exact on-screen preview (border, colors, fonts, photo, layout) to a high-res
  // image and embeds it in the PDF, so the download always matches what the user saw.
  const generatePDF = async () => {
    if (!previewRef.current) return null;

    // Renders the exact on-screen preview (border, colors, fonts, photo, layout) to a high-res
    // image and embeds it in the PDF, so the download always matches what the user saw.
    // The border <img> needed explicit width/height on its SVG (added in generateBorderSVG)
    // for html2canvas to size and rasterize it correctly instead of falling back to a
    // browser-default 300x150 intrinsic size.
    // html2canvas also doesn't reliably honor CSS object-fit: cover on <img>, so the profile
    // photo is excluded from the capture and its cover-crop is redrawn manually afterward.
    const containerEl = previewRef.current;
    const photoContainerEl = containerEl.querySelector<HTMLElement>('.preview-photo-corner');
    const photoImgEl = photoContainerEl?.querySelector('img');

    const canvas = await html2canvas(containerEl, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
      ignoreElements: (el) => el.classList.contains('preview-photo-corner')
    });

    if (photoContainerEl && photoImgEl?.src) {
      const photoImg = new Image();
      await new Promise<void>((resolve, reject) => {
        photoImg.onload = () => resolve();
        photoImg.onerror = () => reject(new Error('profile photo failed to load'));
        photoImg.src = photoImgEl.src;
      });
      await photoImg.decode();

      // Map the photo container's on-screen box (relative to previewRef) onto canvas pixels.
      const containerRect = containerEl.getBoundingClientRect();
      const photoRect = photoContainerEl.getBoundingClientRect();
      const canvasScaleX = canvas.width / containerRect.width;
      const canvasScaleY = canvas.height / containerRect.height;
      const destX = (photoRect.left - containerRect.left) * canvasScaleX;
      const destY = (photoRect.top - containerRect.top) * canvasScaleY;
      const destW = photoRect.width * canvasScaleX;
      const destH = photoRect.height * canvasScaleY;

      // Reproduce object-fit: cover + object-position: top center by cropping the source image.
      const srcAspect = photoImg.naturalWidth / photoImg.naturalHeight;
      const destAspect = destW / destH;
      let srcX = 0, srcY = 0, srcW = photoImg.naturalWidth, srcH = photoImg.naturalHeight;
      if (srcAspect > destAspect) {
        srcW = photoImg.naturalHeight * destAspect;
        srcX = (photoImg.naturalWidth - srcW) / 2;
      } else {
        srcH = photoImg.naturalWidth / destAspect;
        srcY = 0; // top-aligned, matching object-position: top center
      }

      const ctx = canvas.getContext('2d');
      if (ctx) {
        const isCircle = photoContainerEl.classList.contains('photo-shape-circle');
        const borderRadius = isCircle ? Math.min(destW, destH) / 2 : 8 * canvasScaleX;
        const borderWidth = 3 * canvasScaleX;

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Clip to the frame shape (rounded rect or circle) before drawing, matching the live CSS.
        ctx.beginPath();
        if (isCircle) {
          ctx.ellipse(destX + destW / 2, destY + destH / 2, destW / 2, destH / 2, 0, 0, Math.PI * 2);
        } else {
          const r = borderRadius;
          ctx.moveTo(destX + r, destY);
          ctx.arcTo(destX + destW, destY, destX + destW, destY + destH, r);
          ctx.arcTo(destX + destW, destY + destH, destX, destY + destH, r);
          ctx.arcTo(destX, destY + destH, destX, destY, r);
          ctx.arcTo(destX, destY, destX + destW, destY, r);
        }
        ctx.clip();
        ctx.drawImage(photoImg, srcX, srcY, srcW, srcH, destX, destY, destW, destH);
        ctx.restore();

        // Border, drawn on top, matching the live CSS's currentColor frame.
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.strokeStyle = effectiveColor;
        ctx.lineWidth = borderWidth;
        ctx.beginPath();
        if (isCircle) {
          ctx.ellipse(destX + destW / 2, destY + destH / 2, destW / 2, destH / 2, 0, 0, Math.PI * 2);
        } else {
          const r = borderRadius;
          ctx.moveTo(destX + r, destY);
          ctx.arcTo(destX + destW, destY, destX + destW, destY + destH, r);
          ctx.arcTo(destX + destW, destY + destH, destX, destY + destH, r);
          ctx.arcTo(destX, destY + destH, destX, destY, r);
          ctx.arcTo(destX, destY, destX + destW, destY, r);
          ctx.closePath();
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    const imgData = canvas.toDataURL('image/png');

    // A4 in mm — the biodata artwork's real aspect ratio doesn't match A4's, so it's scaled to
    // fit entirely within the page (whichever dimension is the tighter constraint) and centered.
    // This never crops any content — content length varies per user, so a fixed crop amount
    // that's safe for one biodata can clip real text/border on another with more filled fields.
    const pageWidthMm = 210;
    const pageHeightMm = 297;
    const artworkAspect = canvas.width / canvas.height;
    const pageAspect = pageWidthMm / pageHeightMm;

    let imgWidthMm: number;
    let imgHeightMm: number;
    if (artworkAspect > pageAspect) {
      // Artwork is relatively wider than the page — width is the limiting dimension.
      imgWidthMm = pageWidthMm;
      imgHeightMm = imgWidthMm / artworkAspect;
    } else {
      // Artwork is relatively taller than the page — height is the limiting dimension.
      imgHeightMm = pageHeightMm;
      imgWidthMm = imgHeightMm * artworkAspect;
    }
    const xOffset = (pageWidthMm - imgWidthMm) / 2;
    const yOffset = (pageHeightMm - imgHeightMm) / 2;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    doc.addImage(imgData, 'PNG', xOffset, yOffset, imgWidthMm, imgHeightMm);

    return doc;
  };

  const handleDownloadPDF = async () => {
    const pdf = await generatePDF();
    if (pdf) {
      pdf.save(`biodata_${formData.fullName || 'document'}.pdf`);
    }
  };

  // Payment functionality - disabled for now, will be enabled later
  // const handlePayment = async () => { ... };

  // Get the effective color (custom color overrides template color)
  const effectiveColor = customColor || template?.colors.primary || '#DC2626';

  // Generate SVG border with custom color for preview only
  const generateBorderSVG = (color: string, templateId: string) => {
    const encodedColor = color;

    // Mini preview patterns — thin strokes hugging the viewBox edge so they don't overlap text
    // (matches CreateBiodataNew.tsx's mini=true patterns; the download preview box is sized like the mini preview)
    const svgPatterns: { [key: string]: string } = {
      'elegant-red': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='6' y='6' width='388' height='588' stroke-width='0.8'/><rect x='12' y='12' width='376' height='576' stroke-width='0.4'/></g></svg>`,
      'modern-green': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='6' y='6' width='388' height='588' stroke-width='1'/></g></svg>`,
      'golden-yellow': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter' stroke-linecap='square'><path stroke-width='0.8' d='M30,6 L370,6 M394,30 L394,570 M370,594 L30,594 M6,570 L6,30'/><path stroke-width='0.8' d='M30,6 L18,6 L18,18 L6,18 L6,30'/><path stroke-width='0.8' d='M370,6 L382,6 L382,18 L394,18 L394,30'/><path stroke-width='0.8' d='M394,570 L394,582 L382,582 L382,594 L370,594'/><path stroke-width='0.8' d='M6,570 L6,582 L18,582 L18,594 L30,594'/></g></svg>`,
      'festive-trio': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='1' stroke-linecap='square'><path d='M6,80 L6,6 L80,6'/><path d='M320,6 L394,6 L394,80'/><path d='M394,520 L394,594 L320,594'/><path d='M80,594 L6,594 L6,520'/><path d='M150,6 L250,6'/><path d='M150,594 L250,594'/><path d='M6,220 L6,380'/><path d='M394,220 L394,380'/></g></svg>`,
      'royal-red': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='6' y='6' width='388' height='588' stroke-width='0.8' stroke-dasharray='8 4'/></g></svg>`,
      'nature-green': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='6' y='6' width='388' height='588' rx='20' stroke-width='0.8'/><rect x='12' y='12' width='376' height='576' rx='14' stroke-width='0.4'/></g></svg>`,
      'luxury-gold': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><path stroke-width='0.8' d='M8,8 L185,8 L200,24 L215,8 L392,8 L392,285 L376,300 L392,315 L392,592 L215,592 L200,576 L185,592 L8,592 L8,315 L24,300 L8,285 Z'/></g></svg>`,
      'maroon-elegance': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linecap='square'><path stroke-width='1' d='M8,160 L8,8 L160,8'/><path stroke-width='1' d='M240,8 L392,8 L392,160'/><path stroke-width='1' d='M392,440 L392,592 L240,592'/><path stroke-width='1' d='M160,592 L8,592 L8,440'/><path stroke-width='0.4' d='M16,150 L16,16 L150,16'/><path stroke-width='0.4' d='M250,16 L384,16 L384,150'/><path stroke-width='0.4' d='M384,450 L384,584 L250,584'/><path stroke-width='0.4' d='M150,584 L16,584 L16,450'/></g></svg>`,
      'pink-blossom': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='0.8'><path d='M6,6 L6,594'/><path d='M394,6 L394,594'/><path d='M6,6 Q16,16 26,6 Q36,16 46,6 Q56,16 66,6 Q76,16 86,6 Q96,16 106,6 Q116,16 126,6 Q136,16 146,6 Q156,16 166,6 Q176,16 186,6 Q196,16 206,6 Q216,16 226,6 Q236,16 246,6 Q256,16 266,6 Q276,16 286,6 Q296,16 306,6 Q316,16 326,6 Q336,16 346,6 Q356,16 366,6 Q376,16 386,6 Q392,12 394,6'/><path d='M6,594 Q16,584 26,594 Q36,584 46,594 Q56,584 66,594 Q76,584 86,594 Q96,584 106,594 Q116,584 126,594 Q136,584 146,594 Q156,584 166,594 Q176,584 186,594 Q196,584 206,594 Q216,584 226,594 Q236,584 246,594 Q256,584 266,594 Q276,584 286,594 Q296,584 306,594 Q316,584 326,594 Q336,584 346,594 Q356,584 366,594 Q376,584 386,594 Q392,588 394,594'/></g></svg>`,
      'emerald-classic': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='6' y='6' width='388' height='588' stroke-width='0.8'/><rect x='14' y='14' width='372' height='572' rx='22' stroke-width='0.4'/></g></svg>`,
      'royal-blue': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='0.4'><rect x='4' y='4' width='392' height='592'/><rect x='7' y='7' width='386' height='586'/><rect x='10' y='10' width='380' height='580'/></g></svg>`,
      'amber-classic': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='0.8' stroke-linecap='round' stroke-linejoin='round'><path d='M28,10 Q28,4 18,4 Q8,4 8,14 Q8,22 18,22 Q22,22 22,18 Q22,14 18,14'/><path d='M28,10 Q45,6 60,10 Q75,14 90,10 Q100,7 110,10'/><path stroke-width='0.6' d='M110,10 Q116,4 122,8 Q122,13 118,12'/><path d='M122,10 Q138,10 152,10'/><path d='M10,28 Q6,45 10,60 Q14,75 10,90 Q7,100 10,110'/><path stroke-width='0.6' d='M10,110 Q4,116 8,122 Q13,122 12,118'/><path d='M10,122 Q10,138 10,152'/><path d='M372,10 Q372,4 382,4 Q392,4 392,14 Q392,22 382,22 Q378,22 378,18 Q378,14 382,14'/><path d='M372,10 Q355,6 340,10 Q325,14 310,10 Q300,7 290,10'/><path stroke-width='0.6' d='M290,10 Q284,4 278,8 Q278,13 282,12'/><path d='M278,10 Q262,10 248,10'/><path d='M390,28 Q394,45 390,60 Q386,75 390,90 Q393,100 390,110'/><path stroke-width='0.6' d='M390,110 Q396,116 392,122 Q387,122 388,118'/><path d='M390,122 Q390,138 390,152'/><path d='M28,590 Q28,596 18,596 Q8,596 8,586 Q8,578 18,578 Q22,578 22,582 Q22,586 18,586'/><path d='M28,590 Q45,594 60,590 Q75,586 90,590 Q100,593 110,590'/><path stroke-width='0.6' d='M110,590 Q116,596 122,592 Q122,587 118,588'/><path d='M122,590 Q138,590 152,590'/><path d='M10,572 Q6,555 10,540 Q14,525 10,510 Q7,500 10,490'/><path stroke-width='0.6' d='M10,490 Q4,484 8,478 Q13,478 12,482'/><path d='M10,478 Q10,462 10,448'/><path d='M372,590 Q372,596 382,596 Q392,596 392,586 Q392,578 382,578 Q378,578 378,582 Q378,586 382,586'/><path d='M372,590 Q355,594 340,590 Q325,586 310,590 Q300,593 290,590'/><path stroke-width='0.6' d='M290,590 Q284,596 278,592 Q278,587 282,588'/><path d='M278,590 Q262,590 248,590'/><path d='M390,572 Q394,555 390,540 Q386,525 390,510 Q393,500 390,490'/><path stroke-width='0.6' d='M390,490 Q396,484 392,478 Q387,478 388,482'/><path d='M390,478 Q390,462 390,448'/></g><g fill='${encodedColor}'><circle cx='180' cy='10' r='1.5'/><circle cx='200' cy='10' r='2'/><circle cx='220' cy='10' r='1.5'/><circle cx='180' cy='590' r='1.5'/><circle cx='200' cy='590' r='2'/><circle cx='220' cy='590' r='1.5'/><circle cx='10' cy='280' r='1.5'/><circle cx='10' cy='300' r='2'/><circle cx='10' cy='320' r='1.5'/><circle cx='390' cy='280' r='1.5'/><circle cx='390' cy='300' r='2'/><circle cx='390' cy='320' r='1.5'/></g></svg>`,
      'royal-mandala': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='4' y='4' width='392' height='592' stroke-width='0.6' stroke-dasharray='0.5 4' stroke-linecap='round'/><rect x='8' y='8' width='384' height='584' stroke-width='1' stroke-dasharray='0.5 9' stroke-linecap='round'/><rect x='14' y='14' width='372' height='572' stroke-width='0.4'/></g></svg>`,
      'sapphire-classic': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='8' y='8' width='384' height='584' stroke-width='0.8'/><rect x='14' y='14' width='372' height='572' stroke-width='0.4'/></g><g fill='${encodedColor}'><rect x='4' y='4' width='8' height='8'/><rect x='388' y='4' width='8' height='8'/><rect x='4' y='588' width='8' height='8'/><rect x='388' y='588' width='8' height='8'/></g></svg>`,
      'crimson-rose': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter' stroke-width='0.7'><line x1='42' y1='7' x2='358' y2='7'/><line x1='42' y1='593' x2='358' y2='593'/><line x1='7' y1='62' x2='7' y2='538'/><line x1='393' y1='62' x2='393' y2='538'/></g><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter' stroke-width='0.3'><line x1='42' y1='11' x2='358' y2='11'/><line x1='42' y1='589' x2='358' y2='589'/><line x1='11' y1='62' x2='11' y2='538'/><line x1='389' y1='62' x2='389' y2='538'/></g><g fill='${encodedColor}'><polygon points='7,7 30,7 7,30'/><polygon points='393,7 370,7 393,30'/><polygon points='7,593 30,593 7,570'/><polygon points='393,593 370,593 393,570'/><polygon points='7,7 30,7 18,18'/><polygon points='393,7 370,7 382,18'/><polygon points='7,593 30,593 18,582'/><polygon points='393,593 370,593 382,582'/><rect x='4' y='4' width='6' height='6'/><rect x='390' y='4' width='6' height='6'/><rect x='4' y='590' width='6' height='6'/><rect x='390' y='590' width='6' height='6'/><polygon points='200,5 203,11 200,17 197,11'/><polygon points='200,583 203,589 200,595 197,589'/><polygon points='5,298 11,295 17,298 11,301'/><polygon points='383,298 389,295 395,298 389,301'/><circle cx='110' cy='7' r='1.5'/><circle cx='290' cy='7' r='1.5'/><circle cx='110' cy='593' r='1.5'/><circle cx='290' cy='593' r='1.5'/><circle cx='7' cy='180' r='1.5'/><circle cx='7' cy='420' r='1.5'/><circle cx='393' cy='180' r='1.5'/><circle cx='393' cy='420' r='1.5'/></g></svg>`,
      'peacock-green': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='8' y='8' width='384' height='584' stroke-width='1' stroke-dasharray='16 7'/></g><g fill='${encodedColor}'><path d='M8,2 L14,8 L8,14 L2,8 Z'/><path d='M392,2 L398,8 L392,14 L386,8 Z'/><path d='M8,586 L14,592 L8,598 L2,592 Z'/><path d='M392,586 L398,592 L392,598 L386,592 Z'/></g></svg>`,
    };

    // Default pattern (thin, matching the mini-preview pattern set)
    const defaultPattern = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g stroke='${encodedColor}' stroke-width='1' fill='none'><path d='M5,5 L60,5 M5,5 L5,60 M395,5 L340,5 M395,5 L395,60 M5,595 L60,595 M5,595 L5,540 M395,595 L340,595 M395,595 L395,540 M80,5 L320,5 M80,595 L320,595 M5,100 L5,500 M395,100 L395,500'/></g></svg>`;

    // Use hasOwnProperty to check if template exists, to handle empty string patterns
    const svgPattern = templateId in svgPatterns ? svgPatterns[templateId] : defaultPattern;
    if (!svgPattern) {
      return 'none';
    }
    // Explicit width/height so any consumer (this <img>, or html2canvas capturing it) sizes
    // the SVG correctly, instead of a browser falling back to a 300x150 default intrinsic size.
    const sizedSvgPattern = svgPattern.replace('<svg ', "<svg width='400' height='600' ");
    return `url("data:image/svg+xml;base64,${btoa(sizedSvgPattern)}")`;
  };

  if (!formData || !template) {
    return null;
  }

  const handleBack = () => {
    navigate('/create', {
      state: {
        formData,
        religion,
        photo,
        templateId: template?.id,
        customColor,
        selectedSymbol
      }
    });
  };

  // Payment success screen - disabled for now, will be enabled when payment is added
  // if (paymentSuccess) { ... }

  return (
    <div className="preview-page">
      <div className="container">
        {/* Back Button */}
        <button className="btn btn-outline back-button" onClick={handleBack}>
          ← Back to Edit
        </button>

        <div className="page-header fade-in">
          <h1 className="page-title">Preview & Download Your Biodata</h1>
          <p className="page-subtitle">
            Review your information and download your biodata
          </p>
        </div>

        <div className="preview-layout">
          {/* Biodata Preview - identical structure to mini preview in CreateBiodataNew */}
          <div className="preview-scroll-wrapper">
          <div
            ref={previewRef}
            className={`biodata-preview-mini mehndi-border border-template-${template?.id || 'elegant-red'} ${!showShreeGanesh ? 'hide-shree-ganesh' : ''} ${!showBiodata ? 'hide-biodata' : ''} ${photo ? 'has-photo' : ''}`}
            style={{
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: template?.colors.background,
              ['--border-color' as any]: effectiveColor,
              ['--border-image' as any]: generateBorderSVG(effectiveColor, template?.id || 'elegant-red'),
              ['--shree-ganesh-text' as any]: `"${shreeGaneshText}"`,
              ['--biodata-text' as any]: `"${biodataText}"`,
            }}
          >
            <img
              className="preview-border-img"
              src={generateBorderSVG(effectiveColor, template?.id || 'elegant-red').replace(/^url\("/, '').replace(/"\)$/, '')}
              alt=""
              aria-hidden="true"
            />
            <div className="preview-inner-scroll">
            <div className="preview-mini-content-wrap">
{/* God Icon at top center */}
              {showGaneshaIcon && selectedGodIcon && (
                <div
                  className="ganesha-icon-header"
                  dangerouslySetInnerHTML={{ __html: getIconSvg(selectedGodIcon) }}
                />
              )}

              {/* Religious symbol as watermark - randomly placed at 4 locations */}
              {selectedSymbol && (
                <div className="symbol-watermark" style={{ color: effectiveColor }}>
                  <span>{selectedSymbol}</span>
                  <span>{selectedSymbol}</span>
                  <span>{selectedSymbol}</span>
                  <span>{selectedSymbol}</span>
                </div>
              )}

              {/* Photo in top right corner */}
              {photo && (
                <div className={`preview-photo-corner photo-shape-${photoShape}`} style={{ borderColor: effectiveColor }}>
                  <img src={URL.createObjectURL(photo)} alt="Profile" />
                </div>
              )}

              {/* Content Preview */}
              <div className="preview-mini-content">

                {/* If Shree Ganesh toggle is ON - show text with icons on both sides */}
                {showShreeGanesh && (
                  <div className="shree-ganesh-header">
                    {showGaneshaIcon && (
                      <span
                        className="header-icon-left"
                        dangerouslySetInnerHTML={{ __html: getIconSvg(selectedGodIcon) }}
                      />
                    )}
                    <span className="shree-ganesh-text">{shreeGaneshText}</span>
                    {showGaneshaIcon && (
                      <span
                        className="header-icon-right"
                        dangerouslySetInnerHTML={{ __html: getIconSvg(selectedGodIcon) }}
                      />
                    )}
                  </div>
                )}

                {/* If Shree Ganesh toggle is OFF but icon toggle is ON - show icon alone at center */}
                {!showShreeGanesh && showGaneshaIcon && (
                  <div className="icon-only-header">
                    <span
                      className="icon-center"
                      dangerouslySetInnerHTML={{ __html: getIconSvg(selectedGodIcon) }}
                    />
                  </div>
                )}

                {/* BIO DATA text below Shree Ganesh */}
                {showBiodata && (
                  <div className="biodata-header">
                    {biodataText}
                  </div>
                )}

                {/* Name at the top as title */}
                {formData.fullName && (
                  <h2 className="preview-name-title">
                    {formData.fullName}
                  </h2>
                )}

                {/* Personal Information */}
                {(formData.dateOfBirth || formData.timeOfBirth || formData.placeOfBirth || formData.height || formData.weight || formData.complexion || formData.bloodGroup || formData.maritalStatus || formData.education || formData.college || formData.occupation || formData.company || formData.annualIncome || formData.workLocation) && (
                  <div className="preview-section-label" style={{ color: effectiveColor }}>Personal Details</div>
                )}
                {formData.dateOfBirth && <div className="preview-field"><strong>Date of Birth:</strong> {formData.dateOfBirth}</div>}
                {formData.timeOfBirth && <div className="preview-field"><strong>Time of Birth:</strong> {formData.timeOfBirth}</div>}
                {formData.placeOfBirth && <div className="preview-field"><strong>Place of Birth:</strong> {formData.placeOfBirth}</div>}
                {formData.height && <div className="preview-field"><strong>Height:</strong> {formData.height}</div>}
                {formData.weight && <div className="preview-field"><strong>Weight:</strong> {formData.weight}</div>}
                {formData.complexion && <div className="preview-field"><strong>Complexion:</strong> {formData.complexion}</div>}
                {formData.bloodGroup && <div className="preview-field"><strong>Blood Group:</strong> {formData.bloodGroup}</div>}
                {formData.maritalStatus && <div className="preview-field"><strong>Marital Status:</strong> {formData.maritalStatus}</div>}

                {/* Education & Career */}
                {formData.education && <div className="preview-field"><strong>Education:</strong> {formData.education}</div>}
                {formData.college && <div className="preview-field"><strong>College/University:</strong> {formData.college}</div>}
                {formData.occupation && <div className="preview-field"><strong>Occupation:</strong> {formData.occupation}</div>}
                {formData.company && <div className="preview-field"><strong>Company:</strong> {formData.company}</div>}
                {formData.annualIncome && <div className="preview-field"><strong>Annual Income:</strong> {formData.annualIncome}</div>}
                {formData.workLocation && <div className="preview-field"><strong>Work Location:</strong> {formData.workLocation}</div>}

                {/* Religion Details */}
                {(formData.caste || formData.subCaste || formData.gotra || formData.rashi || formData.nakshatra || formData.manglik || formData.deity || formData.sect || formData.community || formData.maslak || formData.namazPractice || formData.hijab || formData.arabicName || formData.denomination || formData.churchAffiliation || formData.baptized || formData.sundayService || formData.jatha || formData.amritdhari || formData.keshdhari || formData.gurudwaraVisit) && (
                  <div className="preview-section-label" style={{ color: effectiveColor }}>Religion Details</div>
                )}
                {formData.caste && <div className="preview-field"><strong>Caste:</strong> {formData.caste}</div>}
                {formData.subCaste && <div className="preview-field"><strong>Sub-Caste:</strong> {formData.subCaste}</div>}
                {formData.gotra && <div className="preview-field"><strong>Gotra:</strong> {formData.gotra}</div>}
                {formData.rashi && <div className="preview-field"><strong>Rashi:</strong> {formData.rashi}</div>}
                {formData.nakshatra && <div className="preview-field"><strong>Nakshatra:</strong> {formData.nakshatra}</div>}
                {formData.manglik && <div className="preview-field"><strong>Manglik:</strong> {formData.manglik}</div>}
                {formData.deity && <div className="preview-field"><strong>Kul Devta/Devi:</strong> {formData.deity}</div>}
                {formData.sect && <div className="preview-field"><strong>Sect:</strong> {formData.sect}</div>}
                {formData.community && <div className="preview-field"><strong>Community:</strong> {formData.community}</div>}
                {formData.maslak && <div className="preview-field"><strong>Maslak:</strong> {formData.maslak}</div>}
                {formData.namazPractice && <div className="preview-field"><strong>Namaz Practice:</strong> {formData.namazPractice}</div>}
                {formData.hijab && <div className="preview-field"><strong>Hijab/Purdah:</strong> {formData.hijab}</div>}
                {formData.arabicName && <div className="preview-field"><strong>Arabic Name:</strong> {formData.arabicName}</div>}
                {formData.denomination && <div className="preview-field"><strong>Denomination:</strong> {formData.denomination}</div>}
                {formData.churchAffiliation && <div className="preview-field"><strong>Church:</strong> {formData.churchAffiliation}</div>}
                {formData.baptized && <div className="preview-field"><strong>Baptized:</strong> {formData.baptized}</div>}
                {formData.sundayService && <div className="preview-field"><strong>Church Attendance:</strong> {formData.sundayService}</div>}
                {formData.jatha && <div className="preview-field"><strong>Jatha:</strong> {formData.jatha}</div>}
                {formData.amritdhari && <div className="preview-field"><strong>Amritdhari:</strong> {formData.amritdhari}</div>}
                {formData.keshdhari && <div className="preview-field"><strong>Keshdhari:</strong> {formData.keshdhari}</div>}
                {formData.gurudwaraVisit && <div className="preview-field"><strong>Gurudwara Visit:</strong> {formData.gurudwaraVisit}</div>}

                {/* Family Details */}
                {(formData.fatherName || formData.fatherOccupation || formData.motherName || formData.motherOccupation || formData.siblings || formData.siblingsMarried || formData.familyType || formData.familyValues || formData.familyIncome || formData.nativePlace || formData.currentAddress) && (
                  <div className="preview-section-label" style={{ color: effectiveColor }}>Family Information</div>
                )}
                {formData.fatherName && <div className="preview-field"><strong>Father's Name:</strong> {formData.fatherName}</div>}
                {formData.fatherOccupation && <div className="preview-field"><strong>Father's Occupation:</strong> {formData.fatherOccupation}</div>}
                {formData.motherName && <div className="preview-field"><strong>Mother's Name:</strong> {formData.motherName}</div>}
                {formData.motherOccupation && <div className="preview-field"><strong>Mother's Occupation:</strong> {formData.motherOccupation}</div>}
                {formData.siblings && <div className="preview-field"><strong>Siblings:</strong> {formData.siblings}</div>}
                {formData.siblingsMarried && <div className="preview-field"><strong>Siblings Married:</strong> {formData.siblingsMarried}</div>}
                {formData.familyType && <div className="preview-field"><strong>Family Type:</strong> {formData.familyType}</div>}
                {formData.familyValues && <div className="preview-field"><strong>Family Values:</strong> {formData.familyValues}</div>}
                {formData.familyIncome && <div className="preview-field"><strong>Family Income:</strong> {formData.familyIncome}</div>}
                {formData.nativePlace && <div className="preview-field"><strong>Native Place:</strong> {formData.nativePlace}</div>}
                {formData.currentAddress && <div className="preview-field"><strong>Current Address:</strong> {formData.currentAddress}</div>}

                {/* Contact Information */}
                {(formData.phone || formData.email || formData.whatsapp || formData.address) && (
                  <div className="preview-section-label" style={{ color: effectiveColor }}>Contact Information</div>
                )}
                {formData.phone && <div className="preview-field"><strong>Phone:</strong> {formData.phone}</div>}
                {formData.email && <div className="preview-field"><strong>Email:</strong> {formData.email}</div>}
                {formData.whatsapp && <div className="preview-field"><strong>Alternate No:</strong> {formData.whatsapp}</div>}
                {formData.address && <div className="preview-field"><strong>Address:</strong> {formData.address}</div>}

                {/* Partner Preferences */}
                {(formData.partnerAgeRange || formData.partnerHeight || formData.partnerEducation || formData.partnerOccupation || formData.partnerLocation || formData.otherPreferences) && (
                  <div className="preview-section-label" style={{ color: effectiveColor }}>Partner Preferences</div>
                )}
                {formData.partnerAgeRange && <div className="preview-field"><strong>Partner Age Range:</strong> {formData.partnerAgeRange}</div>}
                {formData.partnerHeight && <div className="preview-field"><strong>Partner Height:</strong> {formData.partnerHeight}</div>}
                {formData.partnerEducation && <div className="preview-field"><strong>Partner Education:</strong> {formData.partnerEducation}</div>}
                {formData.partnerOccupation && <div className="preview-field"><strong>Partner Occupation:</strong> {formData.partnerOccupation}</div>}
                {formData.partnerLocation && <div className="preview-field"><strong>Partner Location:</strong> {formData.partnerLocation}</div>}
                {formData.otherPreferences && <div className="preview-field"><strong>Other Preferences:</strong> {formData.otherPreferences}</div>}

                {/* Empty state */}
                {Object.keys(formData).length === 0 && !photo && (
                  <div className="preview-empty">
                    <p>Start filling the form to see your biodata preview here</p>
                  </div>
                )}
              </div>
            </div> {/* preview-mini-content-wrap */}
            </div> {/* preview-inner-scroll */}
          </div> {/* biodata-preview-mini */}
          </div> {/* preview-scroll-wrapper */}

          {/* Order Summary Card */}
          <div className="payment-card card">
            <span className="payment-eyebrow">Order Summary</span>

            <div className="payment-template-row">
              <span className="payment-template-swatch" style={{ backgroundColor: effectiveColor }}></span>
              <span className="payment-template-name">{template.name}</span>
            </div>

            <div className="payment-details">
              <div className="payment-row total">
                <span>Template Price</span>
                <span>
                  <span className="payment-amount">₹11</span>
                  <span className="payment-amount-original">₹{getOriginalPrice(template.price)}</span>
                </span>
              </div>
              <div className="payment-offer-note">
                <span className="payment-offer-badge">
                  {Math.round((1 - 11 / getOriginalPrice(template.price)) * 100)}% OFF
                </span>
                <span className="payment-offer-label">Limited time offer</span>
              </div>
            </div>

            <button
              className="btn btn-success btn-full"
              onClick={handleDownloadPDF}
            >
              Pay & Download PDF
            </button>

            <div className="payment-info">
              <p>📄 High-quality PDF format</p>
              <p>🔒 100% Safe Payments</p>
              <p>⚡ Lightning Fast</p>
              <p>⬇️ Instant Download, No Waiting</p>
            </div>

            <button
              className="btn btn-outline btn-full"
              onClick={handleBack}
              style={{ marginTop: '12px' }}
            >
              ← Edit Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;

```

## `frontend/src/pages/CreateBiodataNew.tsx`
```tsx
﻿import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import {
  commonFields,
  familyFields,
  contactFields,
  preferencesFields,
  getReligionFields
} from '../data/religionFields';
import { templates, getTemplateById, getOriginalPrice } from '../data/templates';
import { godIcons, getIconSvg, normalizeIconId } from '../data/godIcons';
import html2canvas from 'html2canvas';
import '../components/TemplateCard.css';
import './CreateBiodataNew.css';

interface BiodataForm {
  [key: string]: string;
}

const STORAGE_KEY = 'shaadi_biodata_draft';

const loadDraft = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveDraft = (data: Record<string, any>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
};

const CreateBiodataNew: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation state takes priority (coming back from preview), then localStorage draft
  const savedState = location.state || {};
  const draft = Object.keys(savedState).length > 0 ? {} : loadDraft();

  const [religion, setReligion] = useState<string>(savedState.religion || draft.religion || '');
  const [showGaneshaIcon, setShowGaneshaIcon] = useState<boolean>(savedState.showGaneshaIcon ?? draft.showGaneshaIcon ?? true);
  const [showShreeGanesh, setShowShreeGanesh] = useState<boolean>(savedState.showShreeGanesh ?? draft.showShreeGanesh ?? true);
  const [showBiodata, setShowBiodata] = useState<boolean>(savedState.showBiodata ?? draft.showBiodata ?? true);
  const [shreeGaneshText, setShreeGaneshText] = useState<string>(savedState.shreeGaneshText || draft.shreeGaneshText || '|| Shree Ganesh ||');
  const [biodataText, setBiodataText] = useState<string>(savedState.biodataText || draft.biodataText || 'BIO DATA');
  const [editingShreeGanesh, setEditingShreeGanesh] = useState<boolean>(false);
  const [editingBiodata, setEditingBiodata] = useState<boolean>(false);
  const [selectedGodIcon, setSelectedGodIcon] = useState<string>(normalizeIconId(savedState.selectedGodIcon || draft.selectedGodIcon));
  const [showIconPicker, setShowIconPicker] = useState<boolean>(false);
  const [formData, setFormData] = useState<BiodataForm>(savedState.formData || draft.formData || {});
  const [photo, setPhoto] = useState<File | null>(savedState.photo || null);
  const [photoShape, setPhotoShape] = useState<'rectangle' | 'circle'>(savedState.photoShape || draft.photoShape || 'rectangle');
  const [selectedTemplate, setSelectedTemplate] = useState<string>(savedState.templateId || draft.selectedTemplate || 'elegant-red');
  const [selectedSymbol, setSelectedSymbol] = useState<string>(savedState.selectedSymbol || draft.selectedSymbol || '');
  const [customColor, setCustomColor] = useState<string>(savedState.customColor || draft.customColor || '');
  const [showColorModal, setShowColorModal] = useState<boolean>(false);
  const [isPreviewSticky, setIsPreviewSticky] = useState<boolean>(true);
  const [previewTopPosition, setPreviewTopPosition] = useState<number>(0);
  const [customLabels, setCustomLabels] = useState<Record<string, string>>(savedState.customLabels || draft.customLabels || {});
  const [editingLabelField, setEditingLabelField] = useState<string | null>(null);

  // Photo cropper states
  const [showCropper, setShowCropper] = useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);
  const formatsRef = useRef<HTMLDivElement>(null);
  const photoSectionRef = useRef<HTMLDivElement>(null);
  const previewSectionRef = useRef<HTMLDivElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const religions = ['hindu', 'muslim', 'christian', 'sikh'];

  // Religious symbols mapping
  const religiousSymbols: any = {
    hindu: ['🕉️', '🪔', '🌺', '🙏'],
    muslim: ['☪️', '🕌', '📿', '☪'],
    christian: ['✝️', '⛪', '🙏', '✨'],
    sikh: ['☬', '🗡️', '🙏', '✨']
  };

  // Auto-save draft to localStorage on every state change
  useEffect(() => {
    saveDraft({
      religion, showGaneshaIcon, showShreeGanesh, showBiodata,
      shreeGaneshText, biodataText, selectedGodIcon,
      formData, photoShape, selectedTemplate, selectedSymbol,
      customColor, customLabels,
    });
  }, [religion, showGaneshaIcon, showShreeGanesh, showBiodata,
      shreeGaneshText, biodataText, selectedGodIcon,
      formData, photoShape, selectedTemplate, selectedSymbol,
      customColor, customLabels]);

  // Disabled complex scroll logic - using pure CSS sticky instead
  useEffect(() => {
    // No scroll listener needed
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string);
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          resolve(url);
        }
      }, 'image/jpeg');
    });
  };

  const handleCropSave = async () => {
    try {
      if (imageSrc && croppedAreaPixels) {
        const croppedImageUrl = await getCroppedImg(imageSrc, croppedAreaPixels);
        setCroppedImage(croppedImageUrl);

        // Convert to File object
        const response = await fetch(croppedImageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'cropped-photo.jpg', { type: 'image/jpeg' });
        setPhoto(file);

        setShowCropper(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleReligionChange = (rel: string) => {
    setReligion(rel);
    // Set default symbol for the religion
    setSelectedSymbol(religiousSymbols[rel]?.[0] || '');
    // Pre-fill religion field in formData
    setFormData(prev => ({ ...prev, religion: getReligionFields(rel).name }));
  };

  const handleClearForm = () => {
    if (window.confirm('Are you sure you want to clear all fields?')) {
      setReligion('');
      setFormData({});
      setPhoto(null);
      setSelectedTemplate('elegant-red');
      setSelectedSymbol('');
      setShowGaneshaIcon(true);
      setShowShreeGanesh(true);
      setShowBiodata(true);
      setShreeGaneshText('|| Shree Ganesh ||');
      setBiodataText('BIO DATA');
      setSelectedGodIcon('🐘');
      setShowIconPicker(false);
    }
  };

  // Download preview as image - available for future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDownloadPreview = async () => {
    if (!previewRef.current) return;

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `biodata-preview-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading preview:', error);
      alert('Failed to download preview. Please try again.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName?.trim()) {
      alert('Please enter Full Name');
      return;
    }

    if (!formData.dateOfBirth) {
      alert('Please enter Date of Birth');
      return;
    }

    if (!selectedTemplate) {
      alert('Please select a template');
      return;
    }

    // Navigate to download page
    navigate('/download', {
      state: {
        formData,
        religion,
        photo,
        templateId: selectedTemplate,
        customColor,
        selectedSymbol,
        showGaneshaIcon,
        showShreeGanesh,
        showBiodata,
        shreeGaneshText,
        biodataText,
        selectedGodIcon,
        photoShape
      }
    });
  };

  const renderField = (field: any) => {
    const commonProps = {
      name: field.name,
      value: formData[field.name] || '',
      onChange: handleInputChange,
      required: field.required,
      placeholder: field.placeholder || ''
    };

    if (field.type === 'select') {
      return (
        <select {...commonProps} className="form-input">
          <option value="">Select {field.label}</option>
          {field.options?.map((option: string) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          {...commonProps}
          className="form-input"
          rows={3}
        />
      );
    }

    return (
      <input
        {...commonProps}
        type={field.type}
        className="form-input"
      />
    );
  };

  const religionFields = religion ? getReligionFields(religion).fields : [];
  const template = getTemplateById(selectedTemplate);

  // Get the effective color (custom color overrides template color)
  const effectiveColor = customColor || template?.colors.primary || '#DC2626';

  // Color palette options for the header-color customization popup
  const colorOptions = [
    { name: 'Red', value: '#DC2626' },
    { name: 'Maroon', value: '#991B1B' },
    { name: 'Green', value: '#16A34A' },
    { name: 'Emerald', value: '#047857' },
    { name: 'Blue', value: '#1E40AF' },
    { name: 'Purple', value: '#7C3AED' },
    { name: 'Pink', value: '#DB2777' },
    { name: 'Orange', value: '#EA580C' },
    { name: 'Yellow', value: '#EAB308' },
    { name: 'Gold', value: '#D97706' },
    { name: 'Teal', value: '#0D9488' },
    { name: 'Brown', value: '#78350F' }
  ];

  // Generate SVG border with custom color for preview only
  const generateBorderSVG = (color: string, templateId: string, mini = false) => {
    const encodedColor = color; // use raw color directly inside SVG, then base64 the whole thing

    // Mini preview patterns — thin strokes hugging the viewBox edge so they don't overlap text
    const miniPatterns: { [key: string]: string } = {
      'elegant-red': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='6' y='6' width='388' height='588' stroke-width='0.8'/><rect x='12' y='12' width='376' height='576' stroke-width='0.4'/></g></svg>`,
      'modern-green': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='6' y='6' width='388' height='588' stroke-width='1'/></g></svg>`,
      'golden-yellow': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter' stroke-linecap='square'><path stroke-width='0.8' d='M30,6 L370,6 M394,30 L394,570 M370,594 L30,594 M6,570 L6,30'/><path stroke-width='0.8' d='M30,6 L18,6 L18,18 L6,18 L6,30'/><path stroke-width='0.8' d='M370,6 L382,6 L382,18 L394,18 L394,30'/><path stroke-width='0.8' d='M394,570 L394,582 L382,582 L382,594 L370,594'/><path stroke-width='0.8' d='M6,570 L6,582 L18,582 L18,594 L30,594'/></g></svg>`,
      'festive-trio': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='1' stroke-linecap='square'><path d='M6,80 L6,6 L80,6'/><path d='M320,6 L394,6 L394,80'/><path d='M394,520 L394,594 L320,594'/><path d='M80,594 L6,594 L6,520'/><path d='M150,6 L250,6'/><path d='M150,594 L250,594'/><path d='M6,220 L6,380'/><path d='M394,220 L394,380'/></g></svg>`,
      'royal-red': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='6' y='6' width='388' height='588' stroke-width='0.8' stroke-dasharray='8 4'/></g></svg>`,
      'nature-green': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='6' y='6' width='388' height='588' rx='20' stroke-width='0.8'/><rect x='12' y='12' width='376' height='576' rx='14' stroke-width='0.4'/></g></svg>`,
      'luxury-gold': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><path stroke-width='0.8' d='M8,8 L185,8 L200,24 L215,8 L392,8 L392,285 L376,300 L392,315 L392,592 L215,592 L200,576 L185,592 L8,592 L8,315 L24,300 L8,285 Z'/></g></svg>`,
      'maroon-elegance': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linecap='square'><path stroke-width='1' d='M8,160 L8,8 L160,8'/><path stroke-width='1' d='M240,8 L392,8 L392,160'/><path stroke-width='1' d='M392,440 L392,592 L240,592'/><path stroke-width='1' d='M160,592 L8,592 L8,440'/><path stroke-width='0.4' d='M16,150 L16,16 L150,16'/><path stroke-width='0.4' d='M250,16 L384,16 L384,150'/><path stroke-width='0.4' d='M384,450 L384,584 L250,584'/><path stroke-width='0.4' d='M150,584 L16,584 L16,450'/></g></svg>`,
      'pink-blossom': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='0.8'><path d='M6,6 L6,594'/><path d='M394,6 L394,594'/><path d='M6,6 Q16,16 26,6 Q36,16 46,6 Q56,16 66,6 Q76,16 86,6 Q96,16 106,6 Q116,16 126,6 Q136,16 146,6 Q156,16 166,6 Q176,16 186,6 Q196,16 206,6 Q216,16 226,6 Q236,16 246,6 Q256,16 266,6 Q276,16 286,6 Q296,16 306,6 Q316,16 326,6 Q336,16 346,6 Q356,16 366,6 Q376,16 386,6 Q392,12 394,6'/><path d='M6,594 Q16,584 26,594 Q36,584 46,594 Q56,584 66,594 Q76,584 86,594 Q96,584 106,594 Q116,584 126,594 Q136,584 146,594 Q156,584 166,594 Q176,584 186,594 Q196,584 206,594 Q216,584 226,594 Q236,584 246,594 Q256,584 266,594 Q276,584 286,594 Q296,584 306,594 Q316,584 326,594 Q336,584 346,594 Q356,584 366,594 Q376,584 386,594 Q392,588 394,594'/></g></svg>`,
      'emerald-classic': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='6' y='6' width='388' height='588' stroke-width='0.8'/><rect x='14' y='14' width='372' height='572' rx='22' stroke-width='0.4'/></g></svg>`,
      'royal-blue': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='0.4'><rect x='4' y='4' width='392' height='592'/><rect x='7' y='7' width='386' height='586'/><rect x='10' y='10' width='380' height='580'/></g></svg>`,
      'amber-classic': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='0.8' stroke-linecap='round' stroke-linejoin='round'><path d='M28,10 Q28,4 18,4 Q8,4 8,14 Q8,22 18,22 Q22,22 22,18 Q22,14 18,14'/><path d='M28,10 Q45,6 60,10 Q75,14 90,10 Q100,7 110,10'/><path stroke-width='0.6' d='M110,10 Q116,4 122,8 Q122,13 118,12'/><path d='M122,10 Q138,10 152,10'/><path d='M10,28 Q6,45 10,60 Q14,75 10,90 Q7,100 10,110'/><path stroke-width='0.6' d='M10,110 Q4,116 8,122 Q13,122 12,118'/><path d='M10,122 Q10,138 10,152'/><path d='M372,10 Q372,4 382,4 Q392,4 392,14 Q392,22 382,22 Q378,22 378,18 Q378,14 382,14'/><path d='M372,10 Q355,6 340,10 Q325,14 310,10 Q300,7 290,10'/><path stroke-width='0.6' d='M290,10 Q284,4 278,8 Q278,13 282,12'/><path d='M278,10 Q262,10 248,10'/><path d='M390,28 Q394,45 390,60 Q386,75 390,90 Q393,100 390,110'/><path stroke-width='0.6' d='M390,110 Q396,116 392,122 Q387,122 388,118'/><path d='M390,122 Q390,138 390,152'/><path d='M28,590 Q28,596 18,596 Q8,596 8,586 Q8,578 18,578 Q22,578 22,582 Q22,586 18,586'/><path d='M28,590 Q45,594 60,590 Q75,586 90,590 Q100,593 110,590'/><path stroke-width='0.6' d='M110,590 Q116,596 122,592 Q122,587 118,588'/><path d='M122,590 Q138,590 152,590'/><path d='M10,572 Q6,555 10,540 Q14,525 10,510 Q7,500 10,490'/><path stroke-width='0.6' d='M10,490 Q4,484 8,478 Q13,478 12,482'/><path d='M10,478 Q10,462 10,448'/><path d='M372,590 Q372,596 382,596 Q392,596 392,586 Q392,578 382,578 Q378,578 378,582 Q378,586 382,586'/><path d='M372,590 Q355,594 340,590 Q325,586 310,590 Q300,593 290,590'/><path stroke-width='0.6' d='M290,590 Q284,596 278,592 Q278,587 282,588'/><path d='M278,590 Q262,590 248,590'/><path d='M390,572 Q394,555 390,540 Q386,525 390,510 Q393,500 390,490'/><path stroke-width='0.6' d='M390,490 Q396,484 392,478 Q387,478 388,482'/><path d='M390,478 Q390,462 390,448'/></g><g fill='${encodedColor}'><circle cx='180' cy='10' r='1.5'/><circle cx='200' cy='10' r='2'/><circle cx='220' cy='10' r='1.5'/><circle cx='180' cy='590' r='1.5'/><circle cx='200' cy='590' r='2'/><circle cx='220' cy='590' r='1.5'/><circle cx='10' cy='280' r='1.5'/><circle cx='10' cy='300' r='2'/><circle cx='10' cy='320' r='1.5'/><circle cx='390' cy='280' r='1.5'/><circle cx='390' cy='300' r='2'/><circle cx='390' cy='320' r='1.5'/></g></svg>`,
      'royal-mandala': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='4' y='4' width='392' height='592' stroke-width='0.6' stroke-dasharray='0.5 4' stroke-linecap='round'/><rect x='8' y='8' width='384' height='584' stroke-width='1' stroke-dasharray='0.5 9' stroke-linecap='round'/><rect x='14' y='14' width='372' height='572' stroke-width='0.4'/></g></svg>`,
      'sapphire-classic': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='8' y='8' width='384' height='584' stroke-width='0.8'/><rect x='14' y='14' width='372' height='572' stroke-width='0.4'/></g><g fill='${encodedColor}'><rect x='4' y='4' width='8' height='8'/><rect x='388' y='4' width='8' height='8'/><rect x='4' y='588' width='8' height='8'/><rect x='388' y='588' width='8' height='8'/></g></svg>`,
      'crimson-rose': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter' stroke-width='0.7'><line x1='42' y1='7' x2='358' y2='7'/><line x1='42' y1='593' x2='358' y2='593'/><line x1='7' y1='62' x2='7' y2='538'/><line x1='393' y1='62' x2='393' y2='538'/></g><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter' stroke-width='0.3'><line x1='42' y1='11' x2='358' y2='11'/><line x1='42' y1='589' x2='358' y2='589'/><line x1='11' y1='62' x2='11' y2='538'/><line x1='389' y1='62' x2='389' y2='538'/></g><g fill='${encodedColor}'><polygon points='7,7 30,7 7,30'/><polygon points='393,7 370,7 393,30'/><polygon points='7,593 30,593 7,570'/><polygon points='393,593 370,593 393,570'/><polygon points='7,7 30,7 18,18'/><polygon points='393,7 370,7 382,18'/><polygon points='7,593 30,593 18,582'/><polygon points='393,593 370,593 382,582'/><rect x='4' y='4' width='6' height='6'/><rect x='390' y='4' width='6' height='6'/><rect x='4' y='590' width='6' height='6'/><rect x='390' y='590' width='6' height='6'/><polygon points='200,5 203,11 200,17 197,11'/><polygon points='200,583 203,589 200,595 197,589'/><polygon points='5,298 11,295 17,298 11,301'/><polygon points='383,298 389,295 395,298 389,301'/><circle cx='110' cy='7' r='1.5'/><circle cx='290' cy='7' r='1.5'/><circle cx='110' cy='593' r='1.5'/><circle cx='290' cy='593' r='1.5'/><circle cx='7' cy='180' r='1.5'/><circle cx='7' cy='420' r='1.5'/><circle cx='393' cy='180' r='1.5'/><circle cx='393' cy='420' r='1.5'/></g></svg>`,
      'peacock-green': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='8' y='8' width='384' height='584' stroke-width='1' stroke-dasharray='16 7'/></g><g fill='${encodedColor}'><path d='M8,2 L14,8 L8,14 L2,8 Z'/><path d='M392,2 L398,8 L392,14 L386,8 Z'/><path d='M8,586 L14,592 L8,598 L2,592 Z'/><path d='M392,586 L398,592 L392,598 L386,592 Z'/></g></svg>`,
    };

    // Gallery patterns — original thick strokes for the template selection section
    const galleryPatterns: { [key: string]: string } = {
      'elegant-red': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='12' y='12' width='376' height='576' stroke-width='1.5'/><rect x='20' y='20' width='360' height='560' stroke-width='0.6'/></g></svg>`,
      'modern-green': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='14' y='14' width='372' height='572' stroke-width='2.5'/></g></svg>`,
      'golden-yellow': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter' stroke-linecap='square'><path stroke-width='1.5' d='M30,12 L370,12 M388,30 L388,570 M370,588 L30,588 M12,570 L12,30'/><path stroke-width='1.5' d='M30,12 L20,12 L20,22 L12,22 L12,30'/><path stroke-width='1.5' d='M370,12 L380,12 L380,22 L388,22 L388,30'/><path stroke-width='1.5' d='M388,570 L388,578 L380,578 L380,588 L370,588'/><path stroke-width='1.5' d='M12,570 L12,578 L20,578 L20,588 L30,588'/></g></svg>`,
      'festive-trio': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='2' stroke-linecap='square'><path d='M12,80 L12,12 L80,12'/><path d='M320,12 L388,12 L388,80'/><path d='M388,520 L388,588 L320,588'/><path d='M80,588 L12,588 L12,520'/><path d='M150,12 L250,12'/><path d='M150,588 L250,588'/><path d='M12,220 L12,380'/><path d='M388,220 L388,380'/></g></svg>`,
      'royal-red': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='14' y='14' width='372' height='572' stroke-width='1.5' stroke-dasharray='8 4'/></g></svg>`,
      'nature-green': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='14' y='14' width='372' height='572' rx='20' stroke-width='1.5'/><rect x='22' y='22' width='356' height='556' rx='14' stroke-width='0.6'/></g></svg>`,
      'luxury-gold': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><path stroke-width='1.5' d='M14,14 L185,14 L200,32 L215,14 L386,14 L386,285 L368,300 L386,315 L386,586 L215,586 L200,568 L185,586 L14,586 L14,315 L32,300 L14,285 Z'/></g></svg>`,
      'maroon-elegance': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linecap='square'><path stroke-width='2.5' d='M14,160 L14,14 L160,14'/><path stroke-width='2.5' d='M240,14 L386,14 L386,160'/><path stroke-width='2.5' d='M386,440 L386,586 L240,586'/><path stroke-width='2.5' d='M160,586 L14,586 L14,440'/><path stroke-width='0.8' d='M22,150 L22,22 L150,22'/><path stroke-width='0.8' d='M250,22 L378,22 L378,150'/><path stroke-width='0.8' d='M378,450 L378,578 L250,578'/><path stroke-width='0.8' d='M150,578 L22,578 L22,450'/></g></svg>`,
      'pink-blossom': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='1.5'><path d='M14,14 L14,586'/><path d='M386,14 L386,586'/><path d='M14,14 Q24,24 34,14 Q44,24 54,14 Q64,24 74,14 Q84,24 94,14 Q104,24 114,14 Q124,24 134,14 Q144,24 154,14 Q164,24 174,14 Q184,24 194,14 Q204,24 214,14 Q224,24 234,14 Q244,24 254,14 Q264,24 274,14 Q284,24 294,14 Q304,24 314,14 Q324,24 334,14 Q344,24 354,14 Q364,24 374,14 Q384,24 386,14'/><path d='M14,586 Q24,576 34,586 Q44,576 54,586 Q64,576 74,586 Q84,576 94,586 Q104,576 114,586 Q124,576 134,586 Q144,576 154,586 Q164,576 174,586 Q184,576 194,586 Q204,576 214,586 Q224,576 234,586 Q244,576 254,586 Q264,576 274,586 Q284,576 294,586 Q304,576 314,586 Q324,576 334,586 Q344,576 354,586 Q364,576 374,586 Q384,576 386,586'/></g></svg>`,
      'emerald-classic': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='14' y='14' width='372' height='572' stroke-width='1.5'/><rect x='26' y='26' width='348' height='548' rx='22' stroke-width='0.8'/></g></svg>`,
      'royal-blue': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='0.5'><rect x='4' y='4' width='392' height='592'/><rect x='7' y='7' width='386' height='586'/><rect x='10' y='10' width='380' height='580'/></g></svg>`,
      'amber-classic': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M28,18 Q28,8 18,8 Q8,8 8,18 Q8,28 18,28 Q24,28 24,22 Q24,17 19,17'/><path d='M28,18 Q45,12 60,18 Q75,24 90,18 Q100,14 110,18'/><path stroke-width='1.2' d='M110,18 Q116,10 124,15 Q124,21 118,20'/><path d='M124,18 Q138,18 152,18'/><path d='M18,28 Q12,45 18,60 Q24,75 18,90 Q14,100 18,110'/><path stroke-width='1.2' d='M18,110 Q10,116 15,124 Q21,124 20,118'/><path d='M18,124 Q18,138 18,152'/><path d='M372,18 Q372,8 382,8 Q392,8 392,18 Q392,28 382,28 Q376,28 376,22 Q376,17 381,17'/><path d='M372,18 Q355,12 340,18 Q325,24 310,18 Q300,14 290,18'/><path stroke-width='1.2' d='M290,18 Q284,10 276,15 Q276,21 282,20'/><path d='M276,18 Q262,18 248,18'/><path d='M382,28 Q388,45 382,60 Q376,75 382,90 Q386,100 382,110'/><path stroke-width='1.2' d='M382,110 Q390,116 385,124 Q379,124 380,118'/><path d='M382,124 Q382,138 382,152'/><path d='M28,582 Q28,592 18,592 Q8,592 8,582 Q8,572 18,572 Q24,572 24,578 Q24,583 19,583'/><path d='M28,582 Q45,588 60,582 Q75,576 90,582 Q100,586 110,582'/><path stroke-width='1.2' d='M110,582 Q116,590 124,585 Q124,579 118,580'/><path d='M124,582 Q138,582 152,582'/><path d='M18,572 Q12,555 18,540 Q24,525 18,510 Q14,500 18,490'/><path stroke-width='1.2' d='M18,490 Q10,484 15,476 Q21,476 20,482'/><path d='M18,476 Q18,462 18,448'/><path d='M372,582 Q372,592 382,592 Q392,592 392,582 Q392,572 382,572 Q376,572 376,578 Q376,583 381,583'/><path d='M372,582 Q355,588 340,582 Q325,576 310,582 Q300,586 290,582'/><path stroke-width='1.2' d='M290,582 Q284,590 276,585 Q276,579 282,580'/><path d='M276,582 Q262,582 248,582'/><path d='M382,572 Q388,555 382,540 Q376,525 382,510 Q386,500 382,490'/><path stroke-width='1.2' d='M382,490 Q390,116 385,476 Q379,476 380,482'/><path d='M382,476 Q382,462 382,448'/></g><g fill='${encodedColor}'><circle cx='180' cy='18' r='3'/><circle cx='200' cy='18' r='4'/><circle cx='220' cy='18' r='3'/><circle cx='180' cy='582' r='3'/><circle cx='200' cy='582' r='4'/><circle cx='220' cy='582' r='3'/><circle cx='18' cy='260' r='2.5'/><circle cx='18' cy='300' r='3'/><circle cx='18' cy='340' r='2.5'/><circle cx='382' cy='260' r='2.5'/><circle cx='382' cy='300' r='3'/><circle cx='382' cy='340' r='2.5'/></g></svg>`,
      'royal-mandala': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='8' y='8' width='384' height='584' stroke-width='1.2' stroke-dasharray='0.5 4' stroke-linecap='round'/><rect x='16' y='16' width='368' height='568' stroke-width='2.2' stroke-dasharray='0.5 9' stroke-linecap='round'/><rect x='24' y='24' width='352' height='552' stroke-width='0.6'/></g></svg>`,
      'sapphire-classic': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='15' y='15' width='370' height='570' stroke-width='2'/><rect x='26' y='26' width='348' height='548' stroke-width='0.8'/></g><g fill='${encodedColor}'><rect x='5' y='5' width='18' height='18'/><rect x='377' y='5' width='18' height='18'/><rect x='5' y='577' width='18' height='18'/><rect x='377' y='577' width='18' height='18'/></g></svg>`,
      'crimson-rose': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter' stroke-width='1.2'><line x1='48' y1='10' x2='352' y2='10'/><line x1='48' y1='590' x2='352' y2='590'/><line x1='10' y1='72' x2='10' y2='528'/><line x1='390' y1='72' x2='390' y2='528'/></g><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter' stroke-width='0.5'><line x1='48' y1='14' x2='352' y2='14'/><line x1='48' y1='586' x2='352' y2='586'/><line x1='14' y1='72' x2='14' y2='528'/><line x1='386' y1='72' x2='386' y2='528'/></g><g fill='${encodedColor}'><polygon points='10,10 38,10 10,38'/><polygon points='390,10 362,10 390,38'/><polygon points='10,590 38,590 10,562'/><polygon points='390,590 362,590 390,562'/><polygon points='10,10 38,10 24,24'/><polygon points='390,10 362,10 376,24'/><polygon points='10,590 38,590 24,576'/><polygon points='390,590 362,590 376,576'/><rect x='6' y='6' width='8' height='8'/><rect x='386' y='6' width='8' height='8'/><rect x='6' y='586' width='8' height='8'/><rect x='386' y='586' width='8' height='8'/><polygon points='200,6 204,14 200,22 196,14'/><polygon points='200,578 204,586 200,594 196,586'/><polygon points='6,297 14,293 22,297 14,301'/><polygon points='378,297 386,293 394,297 386,301'/><line x1='196' y1='10' x2='204' y2='10' stroke='${encodedColor}' stroke-width='1.5'/><line x1='196' y1='590' x2='204' y2='590' stroke='${encodedColor}' stroke-width='1.5'/><line x1='10' y1='296' x2='10' y2='304' stroke='${encodedColor}' stroke-width='1.5'/><line x1='390' y1='296' x2='390' y2='304' stroke='${encodedColor}' stroke-width='1.5'/><circle cx='110' cy='10' r='2.5'/><circle cx='290' cy='10' r='2.5'/><circle cx='110' cy='590' r='2.5'/><circle cx='290' cy='590' r='2.5'/><circle cx='10' cy='180' r='2.5'/><circle cx='10' cy='420' r='2.5'/><circle cx='390' cy='180' r='2.5'/><circle cx='390' cy='420' r='2.5'/></g></svg>`,
      'peacock-green': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='16' y='16' width='368' height='568' stroke-width='2.5' stroke-dasharray='16 7'/></g><g fill='${encodedColor}'><path d='M16,5 L27,16 L16,27 L5,16 Z'/><path d='M384,5 L395,16 L384,27 L373,16 Z'/><path d='M16,573 L27,584 L16,595 L5,584 Z'/><path d='M384,573 L395,584 L384,595 L373,584 Z'/></g></svg>`,
    };

    const svgPatterns = mini ? miniPatterns : galleryPatterns;

    // Default pattern
    const defaultPattern = mini
      ? `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g stroke='${encodedColor}' stroke-width='1' fill='none'><path d='M5,5 L60,5 M5,5 L5,60 M395,5 L340,5 M395,5 L395,60 M5,595 L60,595 M5,595 L5,540 M395,595 L340,595 M395,595 L395,540 M80,5 L320,5 M80,595 L320,595 M5,100 L5,500 M395,100 L395,500'/></g></svg>`
      : `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g stroke='${encodedColor}' stroke-width='2.5' fill='none'><path d='M5,5 L60,5 M5,5 L5,60 M395,5 L340,5 M395,5 L395,60 M5,595 L60,595 M5,595 L5,540 M395,595 L340,595 M395,595 L395,540 M80,5 L320,5 M80,595 L320,595 M5,100 L5,500 M395,100 L395,500'/></g></svg>`;

    // Use hasOwnProperty to check if template exists, to handle empty string patterns
    const svgPattern = templateId in svgPatterns ? svgPatterns[templateId] : defaultPattern;
    if (!svgPattern) {
      return 'none';
    }
    return `url("data:image/svg+xml;base64,${btoa(svgPattern)}")`;
  };

  return (
    <div className="create-biodata-new-page">
      <div className="create-container">

        {/* Left Side - Form */}
        <div className="form-section">
          <div className="form-header">
            <h1 className="form-title">Create Your Biodata</h1>
            <p className="form-subtitle">Fill in your details and see live preview on the right</p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Header Customization */}
            <div className="form-section-card">
              <div className="section-header-with-action">
                <h2 className="section-heading">
                  <span className="section-icon">✨</span>
                  Customize Header
                </h2>
                <button type="button" className="btn-clear" onClick={handleClearForm}>
                  🗑️ Clear Form
                </button>
              </div>
              <div className="header-toggles">
                <div className="toggle-item">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={showGaneshaIcon}
                      onChange={(e) => setShowGaneshaIcon(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <div className="toggle-content">
                    <button
                      type="button"
                      className="change-icon-btn-styled"
                      onClick={() => setShowIconPicker(!showIconPicker)}
                    >
                      <span className="pencil-icon">✏️</span>
                      <span className="change-text">Change</span>
                    </button>
                    <span
                      className="toggle-icon-large"
                      dangerouslySetInnerHTML={{ __html: getIconSvg(selectedGodIcon) }}
                    />
                  </div>
                  {showIconPicker && (
                    <div className="icon-picker-dropdown">
                      <button
                        type="button"
                        className="icon-picker-close"
                        onClick={() => setShowIconPicker(false)}
                        title="Close"
                        aria-label="Close icon picker"
                      >
                        ✕
                      </button>
                      <div className="icon-picker-grid">
                        {godIcons.map((icon) => (
                          <button
                            key={icon.id}
                            type="button"
                            className={`icon-option ${selectedGodIcon === icon.id ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedGodIcon(icon.id);
                              setShowIconPicker(false);
                            }}
                            title={icon.label}
                            dangerouslySetInnerHTML={{ __html: icon.svg }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="toggle-item">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={showShreeGanesh}
                      onChange={(e) => setShowShreeGanesh(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <div className="toggle-content">
                    <button
                      type="button"
                      className="edit-icon-btn"
                      onClick={() => setEditingShreeGanesh(!editingShreeGanesh)}
                    >
                      ✏️
                    </button>
                    {editingShreeGanesh ? (
                      <input
                        type="text"
                        className="toggle-text-input"
                        value={shreeGaneshText}
                        onChange={(e) => setShreeGaneshText(e.target.value)}
                        onBlur={() => setEditingShreeGanesh(false)}
                        placeholder="|| Shree Ganesh ||"
                        autoFocus
                      />
                    ) : (
                      <span className="toggle-text">{shreeGaneshText}</span>
                    )}
                  </div>
                </div>
                <div className="toggle-item">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={showBiodata}
                      onChange={(e) => setShowBiodata(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <div className="toggle-content">
                    <button
                      type="button"
                      className="edit-icon-btn"
                      onClick={() => setEditingBiodata(!editingBiodata)}
                    >
                      ✏️
                    </button>
                    {editingBiodata ? (
                      <input
                        type="text"
                        className="toggle-text-input-bold"
                        value={biodataText}
                        onChange={(e) => setBiodataText(e.target.value)}
                        onBlur={() => setEditingBiodata(false)}
                        placeholder="BIO DATA"
                        autoFocus
                      />
                    ) : (
                      <span className="toggle-text-bold">{biodataText}</span>
                    )}
                  </div>
                </div>
                <div className="header-color-row">
                  <span className="header-color-label">🎨 Choose Color</span>
                  <button
                    type="button"
                    className="color-customize-btn"
                    onClick={() => setShowColorModal(true)}
                    title="Choose color"
                  >
                    <span className="color-customize-swatch" style={{ backgroundColor: effectiveColor }}></span>
                    <span>Customize</span>
                  </button>
                  {customColor && (
                    <button
                      type="button"
                      className="color-reset-inline-btn"
                      onClick={() => setCustomColor('')}
                      title="Reset to template default color"
                    >
                      Reset to Default
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="form-section-card">
              <h2 className="section-heading">
                <span className="section-icon">👤</span>
                Personal Details
              </h2>
              <div className="form-grid">
                {commonFields.map((field) => (
                  <div key={field.name} className="form-group">
                    <label className="form-label">
                      {field.label}
                      {field.required && <span className="required">*</span>}
                    </label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>

            {/* Religion-Specific Details */}
            {religion && religionFields.length > 0 && (
              <div className="form-section-card">
                <h2 className="section-heading">
                  <span className="section-icon">📿</span>
                  Religion Details
                </h2>
                <div className="form-grid">
                  {religionFields.map((field) => (
                    <div key={field.name} className="form-group">
                      <label className="form-label">
                        {field.label}
                        {field.required && <span className="required">*</span>}
                      </label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Family Details */}
            <div className="form-section-card">
              <h2 className="section-heading">
                <span className="section-icon">👨‍👩‍👧‍👦</span>
                Family Information
              </h2>
              <div className="form-grid">
                {familyFields.map((field) => (
                  <div key={field.name} className="form-group">
                    <label className="form-label">
                      {field.label}
                      {field.required && <span className="required">*</span>}
                    </label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="form-section-card">
              <h2 className="section-heading">
                <span className="section-icon">📞</span>
                Contact Information
              </h2>
              <div className="form-grid">
                {contactFields.map((field) => (
                  <div key={field.name} className="form-group">
                    <label className="form-label">
                      {field.label}
                      {field.required && <span className="required">*</span>}
                    </label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>

            {/* Partner Preferences */}
            <div className="form-section-card">
              <h2 className="section-heading">
                <span className="section-icon">💑</span>
                Partner Preferences
              </h2>
              <div className="form-grid">
                {preferencesFields.map((field) => (
                  <div key={field.name} className="form-group">
                    <label className="form-label">
                      {field.label}
                      {field.required && <span className="required">*</span>}
                    </label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>

            {/* Photo Upload */}
            <div className="form-section-card" ref={photoSectionRef}>
              <h2 className="section-heading">
                <span className="section-icon">📷</span>
                Upload Photo
              </h2>
              <div className="photo-upload-compact">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                  className="photo-input"
                  id="photo-upload"
                />
                {photo ? (
                  <>
                    <div className="photo-shape-row">
                      <label className={`photo-shape-card ${photoShape === 'rectangle' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="photoShape"
                          checked={photoShape === 'rectangle'}
                          onChange={() => setPhotoShape('rectangle')}
                          className="photo-shape-radio"
                        />
                        <div className="photo-preview-shape rectangle">
                          <img src={croppedImage || URL.createObjectURL(photo)} alt="Rectangle preview" />
                        </div>
                        <span className="photo-shape-label-text">Rectangle</span>
                      </label>
                      <label className={`photo-shape-card ${photoShape === 'circle' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="photoShape"
                          checked={photoShape === 'circle'}
                          onChange={() => setPhotoShape('circle')}
                          className="photo-shape-radio"
                        />
                        <div className="photo-preview-shape circle">
                          <img src={croppedImage || URL.createObjectURL(photo)} alt="Circle preview" />
                        </div>
                        <span className="photo-shape-label-text">Circle</span>
                      </label>
                    </div>
                    <div className="photo-actions-row">
                      <label htmlFor="photo-upload" className="photo-change-button">
                        📷 Change Photo
                      </label>
                      <button
                        type="button"
                        className="photo-clear-button"
                        onClick={() => {
                          setPhoto(null);
                          setCroppedImage(null);
                        }}
                      >
                        🗑️ Clear Photo
                      </button>
                    </div>
                  </>
                ) : (
                  <label htmlFor="photo-upload" className="photo-upload-label">
                    <div className="photo-placeholder-small">
                      <span className="photo-icon">📷</span>
                      <span>Click to upload photo</span>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button ref={submitButtonRef} type="submit" className="btn btn-success btn-large btn-submit">
              <span className="btn-submit-text">Preview &amp; Download</span>
            </button>
          </form>
        </div>

        {/* Right Side - Live Preview */}
        <div className="preview-section" ref={previewSectionRef}>
          <div
            className={`preview-sticky ${!isPreviewSticky ? 'preview-scrollable' : ''}`}
            style={!isPreviewSticky ? { top: `${previewTopPosition}px` } : {}}
          >
            <h3 className="preview-title-main">Bio data PDF Preview</h3>

            {/* Symbol Picker (color picker moved to Customize Header section) */}
            {religion && religiousSymbols[religion] && (
              <div className="pickers-container">
                <div className="symbol-picker-section">
                  <label className="symbol-picker-label">
                    ✨ Select Symbol:
                  </label>
                  <div className="symbol-options-grid-2x2">
                    {religiousSymbols[religion].map((symbol: string, index: number) => (
                      <button
                        key={index}
                        type="button"
                        className={`symbol-option-btn ${selectedSymbol === symbol ? 'selected' : ''}`}
                        onClick={() => setSelectedSymbol(symbol)}
                        title={`Symbol ${index + 1}`}
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                  <div className="symbol-clear-btn-container">
                    {selectedSymbol ? (
                      <button
                        onClick={() => setSelectedSymbol('')}
                        className="symbol-clear-btn"
                        title="Clear symbol"
                      >
                        Clear
                      </button>
                    ) : (
                      <div className="symbol-clear-btn-placeholder"></div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="preview-scroll-wrapper">
            <div
              ref={previewRef}
              className={`mini-biodata-preview-mini mini-mehndi-border border-template-${template?.id || 'elegant-red'} ${!showShreeGanesh ? 'mini-hide-shree-ganesh' : ''} ${!showBiodata ? 'mini-hide-biodata' : ''} ${photo ? 'mini-has-photo' : ''}`}
              style={{
                position: 'relative',
                backgroundColor: template?.colors.background,
                ['--border-color' as any]: effectiveColor,
                ['--border-image' as any]: generateBorderSVG(effectiveColor, template?.id || 'elegant-red', true),
                ['--shree-ganesh-text' as any]: `"${shreeGaneshText}"`,
                ['--biodata-text' as any]: `"${biodataText}"`
              }}
            >
              <img
                className="mini-preview-border-img"
                src={generateBorderSVG(effectiveColor, template?.id || 'elegant-red', true).replace(/^url\("/, '').replace(/"\)$/, '')}
                alt=""
                aria-hidden="true"
              />
              <div className="mini-preview-inner-scroll">

              {/* God Icon at top center */}
              {showGaneshaIcon && selectedGodIcon && (
                <div
                  className="mini-ganesha-icon-header"
                  dangerouslySetInnerHTML={{ __html: getIconSvg(selectedGodIcon) }}
                />
              )}

              {/* Religious symbol as watermark - randomly placed at 4 locations */}
              {selectedSymbol && (
                <div className="mini-symbol-watermark" style={{ color: effectiveColor }}>
                  <span>{selectedSymbol}</span>
                  <span>{selectedSymbol}</span>
                  <span>{selectedSymbol}</span>
                  <span>{selectedSymbol}</span>
                </div>
              )}

              {/* Photo in top right corner */}
              {photo && (
                <div className={`mini-preview-photo-corner photo-shape-${photoShape}`} style={{ borderColor: effectiveColor }}>
                  <img src={croppedImage || URL.createObjectURL(photo)} alt="Profile" />
                </div>
              )}

              {/* Content Preview */}
              <div className="mini-preview-mini-content">

                {/* If Shree Ganesh toggle is ON - show text with icons on both sides */}
                {showShreeGanesh && (
                  <div className="mini-shree-ganesh-header">
                    {showGaneshaIcon && (
                      <span
                        className="mini-header-icon-left"
                        dangerouslySetInnerHTML={{ __html: getIconSvg(selectedGodIcon) }}
                      />
                    )}
                    <span className="mini-shree-ganesh-text">{shreeGaneshText}</span>
                    {showGaneshaIcon && (
                      <span
                        className="mini-header-icon-right"
                        dangerouslySetInnerHTML={{ __html: getIconSvg(selectedGodIcon) }}
                      />
                    )}
                  </div>
                )}

                {/* If Shree Ganesh toggle is OFF but icon toggle is ON - show icon alone at center */}
                {!showShreeGanesh && showGaneshaIcon && (
                  <div className="mini-icon-only-header">
                    <span
                      className="mini-icon-center"
                      dangerouslySetInnerHTML={{ __html: getIconSvg(selectedGodIcon) }}
                    />
                  </div>
                )}

                {/* BIO DATA text below Shree Ganesh */}
                {showBiodata && (
                  <div className="mini-biodata-header">
                    {biodataText}
                  </div>
                )}

                {/* Name at the top as title */}
                {formData.fullName && (
                  <h2 className="mini-preview-name-title">
                    {formData.fullName}
                  </h2>
                )}

                {/* Personal Details */}
                {(formData.dateOfBirth || formData.timeOfBirth || formData.placeOfBirth || formData.height || formData.weight || formData.complexion || formData.bloodGroup || formData.maritalStatus || formData.education || formData.college || formData.occupation || formData.company || formData.annualIncome || formData.workLocation) && (
                  <div className="preview-section-label" style={{ color: effectiveColor }}>Personal Details</div>
                )}
                {formData.dateOfBirth && <div className="mini-preview-field"><strong>Date of Birth:</strong> {formData.dateOfBirth}</div>}
                {formData.timeOfBirth && <div className="mini-preview-field"><strong>Time of Birth:</strong> {formData.timeOfBirth}</div>}
                {formData.placeOfBirth && <div className="mini-preview-field"><strong>Place of Birth:</strong> {formData.placeOfBirth}</div>}
                {formData.height && <div className="mini-preview-field"><strong>Height:</strong> {formData.height}</div>}
                {formData.weight && <div className="mini-preview-field"><strong>Weight:</strong> {formData.weight}</div>}
                {formData.complexion && <div className="mini-preview-field"><strong>Complexion:</strong> {formData.complexion}</div>}
                {formData.bloodGroup && <div className="mini-preview-field"><strong>Blood Group:</strong> {formData.bloodGroup}</div>}
                {formData.maritalStatus && <div className="mini-preview-field"><strong>Marital Status:</strong> {formData.maritalStatus}</div>}

                {/* Education & Career */}
                {formData.education && <div className="mini-preview-field"><strong>Education:</strong> {formData.education}</div>}
                {formData.college && <div className="mini-preview-field"><strong>College/University:</strong> {formData.college}</div>}
                {formData.occupation && <div className="mini-preview-field"><strong>Occupation:</strong> {formData.occupation}</div>}
                {formData.company && <div className="mini-preview-field"><strong>Company:</strong> {formData.company}</div>}
                {formData.annualIncome && <div className="mini-preview-field"><strong>Annual Income:</strong> {formData.annualIncome}</div>}
                {formData.workLocation && <div className="mini-preview-field"><strong>Work Location:</strong> {formData.workLocation}</div>}

                {/* Religion Details */}
                {(formData.caste || formData.subCaste || formData.gotra || formData.rashi || formData.nakshatra || formData.manglik || formData.deity || formData.sect || formData.community || formData.maslak || formData.namazPractice || formData.hijab || formData.arabicName || formData.denomination || formData.churchAffiliation || formData.baptized || formData.sundayService || formData.jatha || formData.amritdhari || formData.keshdhari || formData.gurudwaraVisit) && (
                  <div className="preview-section-label" style={{ color: effectiveColor }}>Religion Details</div>
                )}
                {formData.caste && <div className="mini-preview-field"><strong>Caste:</strong> {formData.caste}</div>}
                {formData.subCaste && <div className="mini-preview-field"><strong>Sub-Caste:</strong> {formData.subCaste}</div>}
                {formData.gotra && <div className="mini-preview-field"><strong>Gotra:</strong> {formData.gotra}</div>}
                {formData.rashi && <div className="mini-preview-field"><strong>Rashi:</strong> {formData.rashi}</div>}
                {formData.nakshatra && <div className="mini-preview-field"><strong>Nakshatra:</strong> {formData.nakshatra}</div>}
                {formData.manglik && <div className="mini-preview-field"><strong>Manglik:</strong> {formData.manglik}</div>}
                {formData.deity && <div className="mini-preview-field"><strong>Kul Devta/Devi:</strong> {formData.deity}</div>}
                {formData.sect && <div className="mini-preview-field"><strong>Sect:</strong> {formData.sect}</div>}
                {formData.community && <div className="mini-preview-field"><strong>Community:</strong> {formData.community}</div>}
                {formData.maslak && <div className="mini-preview-field"><strong>Maslak:</strong> {formData.maslak}</div>}
                {formData.namazPractice && <div className="mini-preview-field"><strong>Namaz Practice:</strong> {formData.namazPractice}</div>}
                {formData.hijab && <div className="mini-preview-field"><strong>Hijab/Purdah:</strong> {formData.hijab}</div>}
                {formData.arabicName && <div className="mini-preview-field"><strong>Arabic Name:</strong> {formData.arabicName}</div>}
                {formData.denomination && <div className="mini-preview-field"><strong>Denomination:</strong> {formData.denomination}</div>}
                {formData.churchAffiliation && <div className="mini-preview-field"><strong>Church:</strong> {formData.churchAffiliation}</div>}
                {formData.baptized && <div className="mini-preview-field"><strong>Baptized:</strong> {formData.baptized}</div>}
                {formData.sundayService && <div className="mini-preview-field"><strong>Church Attendance:</strong> {formData.sundayService}</div>}
                {formData.jatha && <div className="mini-preview-field"><strong>Jatha:</strong> {formData.jatha}</div>}
                {formData.amritdhari && <div className="mini-preview-field"><strong>Amritdhari:</strong> {formData.amritdhari}</div>}
                {formData.keshdhari && <div className="mini-preview-field"><strong>Keshdhari:</strong> {formData.keshdhari}</div>}
                {formData.gurudwaraVisit && <div className="mini-preview-field"><strong>Gurudwara Visit:</strong> {formData.gurudwaraVisit}</div>}

                {/* Family Information */}
                {(formData.fatherName || formData.fatherOccupation || formData.motherName || formData.motherOccupation || formData.siblings || formData.siblingsMarried || formData.familyType || formData.familyValues || formData.familyIncome || formData.nativePlace || formData.currentAddress) && (
                  <div className="preview-section-label" style={{ color: effectiveColor }}>Family Information</div>
                )}
                {formData.fatherName && <div className="mini-preview-field"><strong>Father's Name:</strong> {formData.fatherName}</div>}
                {formData.fatherOccupation && <div className="mini-preview-field"><strong>Father's Occupation:</strong> {formData.fatherOccupation}</div>}
                {formData.motherName && <div className="mini-preview-field"><strong>Mother's Name:</strong> {formData.motherName}</div>}
                {formData.motherOccupation && <div className="mini-preview-field"><strong>Mother's Occupation:</strong> {formData.motherOccupation}</div>}
                {formData.siblings && <div className="mini-preview-field"><strong>Siblings:</strong> {formData.siblings}</div>}
                {formData.siblingsMarried && <div className="mini-preview-field"><strong>Siblings Married:</strong> {formData.siblingsMarried}</div>}
                {formData.familyType && <div className="mini-preview-field"><strong>Family Type:</strong> {formData.familyType}</div>}
                {formData.familyValues && <div className="mini-preview-field"><strong>Family Values:</strong> {formData.familyValues}</div>}
                {formData.familyIncome && <div className="mini-preview-field"><strong>Family Income:</strong> {formData.familyIncome}</div>}
                {formData.nativePlace && <div className="mini-preview-field"><strong>Native Place:</strong> {formData.nativePlace}</div>}
                {formData.currentAddress && <div className="mini-preview-field"><strong>Current Address:</strong> {formData.currentAddress}</div>}

                {/* Contact Information */}
                {(formData.phone || formData.email || formData.whatsapp || formData.address) && (
                  <div className="preview-section-label" style={{ color: effectiveColor }}>Contact Information</div>
                )}
                {formData.phone && <div className="mini-preview-field"><strong>Phone:</strong> {formData.phone}</div>}
                {formData.email && <div className="mini-preview-field"><strong>Email:</strong> {formData.email}</div>}
                {formData.whatsapp && <div className="mini-preview-field"><strong>Alternate No:</strong> {formData.whatsapp}</div>}
                {formData.address && <div className="mini-preview-field"><strong>Address:</strong> {formData.address}</div>}

                {/* Partner Preferences */}
                {(formData.partnerAgeRange || formData.partnerHeight || formData.partnerEducation || formData.partnerOccupation || formData.partnerLocation || formData.otherPreferences) && (
                  <div className="preview-section-label" style={{ color: effectiveColor }}>Partner Preferences</div>
                )}
                {formData.partnerAgeRange && <div className="mini-preview-field"><strong>Partner Age Range:</strong> {formData.partnerAgeRange}</div>}
                {formData.partnerHeight && <div className="mini-preview-field"><strong>Partner Height:</strong> {formData.partnerHeight}</div>}
                {formData.partnerEducation && <div className="mini-preview-field"><strong>Partner Education:</strong> {formData.partnerEducation}</div>}
                {formData.partnerOccupation && <div className="mini-preview-field"><strong>Partner Occupation:</strong> {formData.partnerOccupation}</div>}
                {formData.partnerLocation && <div className="mini-preview-field"><strong>Partner Location:</strong> {formData.partnerLocation}</div>}
                {formData.otherPreferences && <div className="mini-preview-field"><strong>Other Preferences:</strong> {formData.otherPreferences}</div>}

                {/* Empty state */}
                {Object.keys(formData).length === 0 && !photo && (
                  <div className="mini-preview-empty">
                    <p>Start filling the form to see your biodata preview here</p>
                  </div>
                )}
              </div>
              </div>{/* end mini-preview-inner-scroll */}
            </div>{/* end mini-biodata-preview-mini */}
            </div>{/* end preview-scroll-wrapper */}

            {/* Action Buttons - Outside the preview box */}
            <div className="preview-actions">
              <div className="preview-buttons-row">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all form data?')) {
                      localStorage.removeItem(STORAGE_KEY);
                      window.location.reload();
                    }
                  }}
                  className="btn btn-outline clear-form-btn"
                >
                  Clear Form
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btn btn-success preview-pay-btn"
                >
                  Preview and Download
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Template Selection - Full Width */}
      <div className="templates-full-width-section" ref={formatsRef}>
        <div className="templates-container">
          <h2 className="section-heading">
            <span className="section-icon">🎨</span>
            Biodata Formats
          </h2>
          <div className="template-grid-large">
            {templates.map((tmpl, index) => (
              <div
                key={tmpl.id}
                className={`template-card ${selectedTemplate === tmpl.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedTemplate(tmpl.id);
                  setCustomColor(''); // Reset custom color to use template's default color
                }}
              >
                <div
                  className={`template-preview-box border-template-${tmpl.id}`}
                  style={{
                    background: tmpl.colors.background.toUpperCase() === '#FFFFFF' ? 'white' : tmpl.colors.background,
                    position: 'relative',
                  }}
                >
                  <img
                    className="template-card-border-img"
                    src={generateBorderSVG(tmpl.colors.primary, tmpl.id).replace(/^url\("/, '').replace(/"\)$/, '')}
                    alt=""
                    aria-hidden="true"
                  />
                  <div className="template-number-badge" style={{ backgroundColor: tmpl.colors.primary }}>
                    #{index + 1}
                  </div>
                  <div className="template-preview-content-centered">
                    <h4 className="template-name-inside" style={{ color: tmpl.colors.primary }}>
                      {tmpl.name}
                    </h4>
                    <div className="template-price-container">
                      <div className="template-price-row">
                        <span className="template-price-current">₹11</span>
                        <span className="template-price-original">₹{getOriginalPrice(tmpl.price)}</span>
                      </div>
                      <span className="template-discount-badge">
                        {Math.round((1 - 11 / getOriginalPrice(tmpl.price)) * 100)}% OFF
                      </span>
                    </div>
                  </div>
                </div>
                {selectedTemplate === tmpl.id && (
                  <div className="selected-check-large">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Header Color Picker Modal */}
      {showColorModal && (
        <div className="color-modal-overlay" onClick={() => setShowColorModal(false)}>
          <div className="color-modal" onClick={(e) => e.stopPropagation()}>
            <div className="color-modal-header">
              <h3>🎨 Select Color</h3>
              <button onClick={() => setShowColorModal(false)} className="color-modal-close" title="Close">✕</button>
            </div>
            <div className="color-modal-grid">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  className={`color-modal-swatch ${effectiveColor === color.value ? 'selected' : ''}`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => { setCustomColor(color.value); setShowColorModal(false); }}
                  title={color.name}
                >
                  {effectiveColor === color.value && '✓'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Photo Cropper Modal */}
      {showCropper && imageSrc && (
        <div className="crop-modal-overlay">
          <div className="crop-modal">
            <div className="crop-modal-header">
              <h3>Crop Your Photo</h3>
              <button onClick={handleCropCancel} className="crop-close-btn">✕</button>
            </div>
            <div className="crop-container">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={3 / 4}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="crop-controls">
              <label className="zoom-label">
                <span>Zoom:</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="zoom-slider"
                />
              </label>
            </div>
            <div className="crop-modal-footer">
              <button onClick={handleCropCancel} className="btn btn-outline">
                Cancel
              </button>
              <button onClick={handleCropSave} className="btn btn-success">
                Crop & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateBiodataNew;

```

## `frontend/src/pages/LegalPage.tsx`
```tsx
import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { legalContent } from '../data/legalContent';
import './LegalPage.css';

const LegalPage: React.FC = () => {
  const { pathname } = useLocation();
  const slug = pathname.replace('/', '');
  const content = legalContent[slug];

  if (!content) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="legal-page">
      <div className="legal-doc">
        <header className="legal-header">
          <h1 className="legal-title">{content.title}</h1>
          <p className="legal-updated">Last updated: {content.updated}</p>
          {content.intro && <p className="legal-intro">{content.intro}</p>}
        </header>

        {content.sections.map((section) => (
          <section key={section.heading} className="legal-section">
            <h2>{section.heading}</h2>
            {section.paragraphs?.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
            {section.bullets && (
              <ul className="legal-bullets">
                {section.bullets.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

export default LegalPage;

```

## `frontend/src/data/legalContent.ts`
```ts
export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalPageContent {
  title: string;
  updated: string;
  intro?: string;
  sections: LegalSection[];
}

export const legalContent: Record<string, LegalPageContent> = {
  terms: {
    title: 'Terms of Service',
    updated: 'August 2026',
    intro:
      'Welcome to BiodataForShaadi. By browsing or using this website, you agree to comply with and be bound by the following terms and conditions of use, which together with our Privacy Policy govern BiodataForShaadi\'s relationship with you.',
    sections: [
      {
        heading: '1. Definitions',
        paragraphs: [
          '"We", "us", and "our" refer to BiodataForShaadi. "You" and "your" refer to any visitor or user of this website, whether browsing for free or making a purchase. "Services" means the biodata creation, template, and download services offered on this website.',
        ],
      },
      {
        heading: '2. User Agreement',
        paragraphs: [
          'These terms apply to all visitors and users of the site, whether or not you make a purchase. You agree to use the Services solely for your own personal or internal purposes, and not for any unlawful purpose.',
          'You must be 18 or older to make a purchase on this website.',
        ],
      },
      {
        heading: '3. Your Content',
        paragraphs: [
          'The details you enter to build your biodata (name, family information, photos, etc.) are processed in your browser and used only to generate your document. You are responsible for the accuracy of the information you provide.',
          'In line with the Information Technology (Intermediary Guidelines) Rules, 2021, you agree not to upload or submit content that is defamatory, obscene, infringes another person\'s rights, impersonates any person, or is intended to mislead or harass for financial or other gain.',
        ],
      },
      {
        heading: '4. Amendment to This Agreement',
        paragraphs: [
          'We may revise these terms at any time, with or without notice, by updating this page. Changes take effect immediately on posting, and your continued use of the website after changes are posted constitutes acceptance of the revised terms.',
        ],
      },
      {
        heading: '5. Payments and Refunds',
        paragraphs: [
          'Templates are offered as a one-time purchase per download, processed securely through Razorpay. Because a biodata is a digital good delivered instantly, no refund is available once it has been generated or downloaded, except in the limited circumstances set out in our Refund Policy.',
        ],
      },
      {
        heading: '6. Disclaimer',
        paragraphs: [
          'The information and templates on this website are provided for general use only. While we try to keep everything accurate and up to date, we make no representations or warranties of any kind about the completeness, accuracy, or suitability of the Services, and you use them at your own risk.',
        ],
      },
      {
        heading: '7. Intellectual Property Rights',
        paragraphs: [
          'Unless otherwise stated, BiodataForShaadi owns the intellectual property rights for all template designs, graphics, and other material on this website. These works are protected under Indian copyright law and international treaty provisions.',
          'You may not do any of the following without our prior written consent:',
        ],
        bullets: [
          'Republish, sell, rent, or sub-license material from this website',
          'Reproduce, duplicate, or copy template designs or site content',
          'Scrape, extract, or systematically download data from this website',
          'Redistribute content from this website, including onto another website',
        ],
      },
      {
        heading: '8. Limitation of Liability',
        paragraphs: [
          'BiodataForShaadi is not liable for any indirect, incidental, or consequential loss arising from your use of the Services, including loss of data, loss of income, or any damages resulting from downtime or technical issues.',
        ],
      },
      {
        heading: '9. Governing Law',
        paragraphs: [
          'These terms are governed by the laws of India, and any disputes relating to them are subject to the exclusive jurisdiction of the courts of India.',
        ],
      },
      {
        heading: '10. Contact Us',
        paragraphs: [
          'If you have any questions about these Terms of Service, or wish to report a violation, please contact us at support@biodataforshaadi.com.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    updated: 'August 2026',
    intro:
      'This Privacy Policy explains what information BiodataForShaadi collects, how it is used, and the choices you have — we aim to collect the minimum necessary to provide the service.',
    sections: [
      {
        heading: '1. Browser-Based Privacy',
        paragraphs: [
          'Your biodata is generated entirely in your browser. Personal details you enter into the form — name, family details, photos, and so on — are not uploaded to or stored on our servers while you are editing.',
        ],
      },
      {
        heading: '2. What We Collect',
        paragraphs: [
          'To process an order, we collect your name and contact details, used solely for payment tracking and transaction verification.',
          'Payment details (card, UPI, netbanking, etc.) are collected and processed directly by Razorpay, our payment partner — we never see or store this information.',
        ],
        bullets: [
          'Name and mobile number / email — for order and payment verification',
          'Payment information — collected and processed by Razorpay directly',
          'Basic technical data (browser type, pages visited) — for analytics',
        ],
      },
      {
        heading: '3. Retention of Biodata Files',
        paragraphs: [
          'A copy of a paid, downloaded biodata may be retained on our servers for a short period, up to 24 hours, solely to help resolve download issues. After this period, it is permanently deleted.',
        ],
      },
      {
        heading: '4. How We Use Your Information',
        paragraphs: [
          'We use your information only to generate your biodata, process payment, and provide customer support. We do not sell your data, use it for marketing, or share it with third parties beyond what is required to process your payment.',
        ],
      },
      {
        heading: '5. Cookies',
        paragraphs: [
          'We use minimal cookies and local storage to remember your in-progress biodata and template choice, plus basic analytics cookies to help improve the site. You can disable cookies at any time in your browser settings.',
        ],
      },
      {
        heading: '6. Your Rights',
        paragraphs: [
          'You may decline to provide requested information, though this may prevent you from completing your order. You can request that we delete any retained copy of your biodata by writing to us.',
        ],
      },
      {
        heading: '7. Contact Us',
        paragraphs: [
          'For privacy questions, or to report a concern or breach, contact support@biodataforshaadi.com.',
        ],
      },
    ],
  },
  refund: {
    title: 'Refund Policy',
    updated: 'August 2026',
    intro:
      'BiodataForShaadi delivers a digital product. Due to the nature of digital goods, all sales are generally final once a biodata has been generated or downloaded — the exceptions below explain when a refund can still be requested.',
    sections: [
      {
        heading: '1. When a Refund Applies',
        paragraphs: ['We will review refund requests for:'],
        bullets: [
          'A verified technical failure that prevented your biodata from being generated',
          'A duplicate payment charge for the same order',
          'Payment deducted but no download delivered, after multiple attempts',
          'The wrong product delivered due to a system error, reported within 24 hours',
        ],
      },
      {
        heading: '2. When a Refund Does Not Apply',
        paragraphs: ['Refunds do not apply to:'],
        bullets: [
          'Biodatas that have already been generated or downloaded',
          'Low-quality photos that you uploaded',
          'Information you entered incorrectly',
          'Change-of-mind requests',
          'Device or browser compatibility issues',
          'Design change requests made after delivery',
        ],
      },
      {
        heading: '3. How to Request a Refund',
        paragraphs: [
          'Email support@biodataforshaadi.com within 24 hours of your purchase, referencing your order ID, with your transaction details and a description of the issue (screenshots help). Requests made after 24 hours will not be considered.',
        ],
      },
      {
        heading: '4. Processing Time',
        paragraphs: [
          'Eligible requests are typically reviewed within 3-5 business days. Once a refund is approved, it takes a further 4-5 business days to reflect in your original payment method.',
        ],
      },
      {
        heading: '5. Alternatives to a Refund',
        paragraphs: [
          'Before requesting a refund, we\'re happy to help with download assistance, technical troubleshooting, or an alternative delivery method — many issues can be resolved without a refund.',
        ],
      },
    ],
  },
  shipping: {
    title: 'Shipping and Delivery Policy',
    updated: 'August 2026',
    intro:
      'BiodataForShaadi is a fully digital service. This policy explains how your biodata is delivered, since no physical shipping is involved.',
    sections: [
      {
        heading: '1. Digital Delivery Only',
        paragraphs: [
          'All marriage biodata templates available for purchase on BiodataForShaadi are digital products, delivered via digital download only. No physical items are shipped, and no shipping address or delivery charges apply.',
        ],
      },
      {
        heading: '2. Delivery Time',
        paragraphs: [
          'There is no waiting period — once your payment is confirmed by Razorpay, your biodata PDF is available for instant download in your browser.',
        ],
      },
      {
        heading: '3. Keeping Your File Safe',
        paragraphs: [
          'Once downloaded, you are responsible for saving and backing up your file, for example to your device or a cloud storage service.',
        ],
      },
      {
        heading: '4. If Your Download Doesn\'t Start',
        paragraphs: [
          'If you don\'t receive your download after a successful payment, contact support@biodataforshaadi.com with your transaction details, and we will help resolve the issue or resend your file.',
        ],
      },
    ],
  },
  contact: {
    title: 'Contact Us',
    updated: 'August 2026',
    intro:
      'Have a question about templates, pricing, or your order? Need help with a download or payment issue? We\'re happy to help.',
    sections: [
      {
        heading: 'Support Email',
        paragraphs: ['support@biodataforshaadi.com'],
      },
      {
        heading: 'Response Time',
        paragraphs: ['We typically respond within 24 hours on business days.'],
      },
      {
        heading: 'Before You Write In',
        paragraphs: [
          'For refund-related queries, please review our Refund Policy first so you know what\'s eligible. For payment or download issues, include your order/payment reference and a screenshot if possible — it helps us resolve things faster.',
        ],
      },
    ],
  },
};

```
