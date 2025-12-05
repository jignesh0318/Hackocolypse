import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>🛡️ SafeZone AI</h3>
            <p>Making every journey safer with AI-powered insights.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/dashboard">Dashboard</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>📧 support@safezone.ai</p>
            <p>📞 +1 (555) 123-4567</p>
            <div className="social-links">
              <a href="#" className="social-icon">🐦</a>
              <a href="#" className="social-icon">📘</a>
              <a href="#" className="social-icon">📸</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 SafeZone AI. All rights reserved.</p>
          <p>Built with ❤️ for safer communities</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;