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
