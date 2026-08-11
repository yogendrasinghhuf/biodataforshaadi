# ShaadiiBiodata - Wedding Biodata Creator

A modern, full-featured wedding biodata creation platform with multi-religion support, premium templates, and integrated payment gateway.

## Features

- **Multi-Religion Support**: Customized form fields for Hindu, Muslim, Christian, and Sikh communities
- **Premium Templates**: 7 beautifully designed templates priced from ₹9 to ₹99
- **Color Scheme**: Festive red, green, and yellow theme throughout the website
- **Browser-Based PDF Generation**: User privacy is maintained as all processing happens in the browser
- **Razorpay Integration**: Secure payment processing with support for UPI, cards, net banking, and wallets
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI/UX**: Clean, intuitive interface with smooth animations

## Tech Stack

### Frontend
- React with TypeScript
- React Router for navigation
- jsPDF for PDF generation
- Axios for API calls
- CSS3 with custom properties (CSS variables)

### Backend
- Node.js with Express
- Razorpay SDK for payment processing
- CORS enabled for cross-origin requests

## Project Structure

```
shaadibiodata/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable components (Header, Footer)
│   │   ├── pages/           # Page components (Home, Templates, CreateBiodata, Preview)
│   │   ├── data/            # Data files (templates, religion fields)
│   │   ├── App.tsx          # Main app component with routing
│   │   └── index.css        # Global styles with color scheme
│   └── package.json
│
├── server/                   # Node.js backend
│   ├── index.js             # Express server with Razorpay integration
│   ├── .env.example         # Environment variables template
│   └── package.json
│
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Razorpay account (for payment processing)

### 1. Clone or Setup Project

The project is already set up in your current directory.

### 2. Install Dependencies

#### Backend Setup
```bash
cd server
npm install
```

#### Frontend Setup
```bash
cd frontend
npm install
```

### 3. Configure Razorpay

1. Sign up for a Razorpay account at https://razorpay.com
2. Get your API keys from the Razorpay Dashboard: https://dashboard.razorpay.com/app/keys
3. Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

4. Edit the `.env` file and add your Razorpay credentials:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
PORT=5000
```

5. Update the frontend Razorpay key in `frontend/src/pages/Preview.tsx`:
   - Find line with `key: 'YOUR_RAZORPAY_KEY_ID'`
   - Replace with your actual Razorpay Key ID

### 4. Run the Application

#### Start the Backend Server
```bash
cd server
npm start
```

The backend server will run on http://localhost:5000

#### Start the Frontend Development Server
```bash
cd frontend
npm start
```

The frontend will run on http://localhost:3000

## Usage Guide

### Creating a Biodata

1. **Home Page**: Click "Get Started Now" or "Create Biodata" from the navigation
2. **Select Religion**: Choose from Hindu, Muslim, Christian, or Sikh
3. **Fill Personal Information**: Enter your personal details
4. **Religion-Specific Details**: Complete community-specific fields
5. **Family Details**: Add family information
6. **Contact Information**: Provide contact details
7. **Partner Preferences**: Specify partner preferences (optional)
8. **Upload Photo**: Add a professional photograph
9. **Choose Template**: Select from 7 premium templates
10. **Preview & Pay**: Review your biodata and make payment
11. **Download**: Instantly download your PDF biodata after successful payment

### Templates & Pricing

| Template | Category | Price |
|----------|----------|-------|
| Elegant Red | Traditional | ₹9 |
| Modern Green | Modern | ₹19 |
| Golden Yellow | Premium | ₹29 |
| Festive Trio | Festive | ₹39 |
| Royal Red | Premium | ₹49 |
| Nature Green | Modern | ₹69 |
| Luxury Gold | Luxury | ₹99 |

## Configuration

### Color Scheme

The website uses a red, green, and yellow color theme defined in CSS variables. To customize:

Edit `frontend/src/index.css`:

```css
:root {
  --primary-red: #DC2626;
  --primary-green: #16A34A;
  --primary-yellow: #EAB308;
  /* ... other colors */
}
```

### Adding More Templates

To add new templates, edit `frontend/src/data/templates.ts`:

```typescript
{
  id: 'new-template',
  name: 'New Template Name',
  price: 49,
  description: 'Template description',
  category: 'Premium',
  colors: {
    primary: '#DC2626',
    secondary: '#991B1B',
    accent: '#FCA5A5',
    background: '#FFFFFF'
  }
}
```

### Adding More Religion-Specific Fields

Edit `frontend/src/data/religionFields.ts` to add or modify fields for each religion.

## Payment Testing

Razorpay provides test mode for development:

1. Use test API keys from your Razorpay dashboard
2. Test card details:
   - Card Number: 4111 1111 1111 1111
   - CVV: Any 3 digits
   - Expiry: Any future date

## Deployment

### Frontend Deployment (Vercel/Netlify)

```bash
cd frontend
npm run build
```

Deploy the `build` folder to your hosting service.

### Backend Deployment (Heroku/Railway/Render)

1. Ensure environment variables are set in your hosting platform
2. Deploy the `server` directory
3. Update the API endpoint in `frontend/src/pages/Preview.tsx`

## Security Notes

- Never commit `.env` file to version control
- Always use HTTPS in production
- Validate all payment callbacks on the server
- Implement rate limiting for API endpoints
- Use environment variables for all sensitive data

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Privacy & Data

- All biodata generation happens in the browser
- No personal data is stored on servers
- Payment information is handled securely by Razorpay
- Photos are processed client-side only

## Support

For issues or questions:
- Check the Razorpay documentation: https://razorpay.com/docs/
- Review React documentation: https://reactjs.org/docs/
- Check browser console for errors

## Future Enhancements

- User accounts for saving drafts
- More template designs
- Multi-language support
- Email delivery of biodata
- QR code integration
- Social media sharing
- Template customization options

## License

This project is for educational and commercial use.

## Credits

- Built with React and Node.js
- Payments powered by Razorpay
- Icons from Unicode emoji

---

Made with ❤️ for finding perfect matches
