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
    },
    {
      icon: '🖼️',
      title: 'Additional Photo Feature',
      description: 'Include additional photos alongside your profile picture, all in one biodata'
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
