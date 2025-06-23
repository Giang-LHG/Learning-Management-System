import React from 'react';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiYoutube } from 'react-icons/fi';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-text">EduLMS</span>
              <span className="logo-dot">.</span>
            </div>
            <p className="footer-description">
              Transforming education through innovative learning solutions.
              Access thousands of courses anytime, anywhere.
            </p>
            <div className="footer-social">
              <a href="https://facebook.com" aria-label="Facebook">
                <FiFacebook className="social-icon" />
              </a>
              <a href="https://twitter.com" aria-label="Twitter">
                <FiTwitter className="social-icon" />
              </a>
              <a href="https://instagram.com" aria-label="Instagram">
                <FiInstagram className="social-icon" />
              </a>
              <a href="https://linkedin.com" aria-label="LinkedIn">
                <FiLinkedin className="social-icon" />
              </a>
              <a href="https://youtube.com" aria-label="YouTube">
                <FiYoutube className="social-icon" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links-group">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="/">Home</a></li>
              <li><a href="/courses">Courses</a></li>
              <li><a href="/instructors">Instructors</a></li>
              <li><a href="/pricing">Pricing</a></li>
              <li><a href="/blog">Blog</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="footer-links-group">
            <h4 className="footer-heading">Resources</h4>
            <ul className="footer-links">
              <li><a href="/help-center">Help Center</a></li>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/tutorials">Tutorials</a></li>
              <li><a href="/downloads">Download Apps</a></li>
              <li><a href="/partners">Partners</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-links-group">
            <h4 className="footer-heading">Legal</h4>
            <ul className="footer-links">
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Service</a></li>
              <li><a href="/cookies">Cookie Policy</a></li>
              <li><a href="/security">Security</a></li>
              <li><a href="/sitemap">Sitemap</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-contact">
            <h4 className="footer-heading">Contact Us</h4>
            <ul className="footer-contact-info">
              <li>
                <FiMail className="contact-icon" />
                <span>support@edulms.com</span>
              </li>
              <li>
                <FiPhone className="contact-icon" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li>
                <FiMapPin className="contact-icon" />
                <span>123 Education St, Learning City, ED 54321</span>
              </li>
            </ul>

            <div className="footer-newsletter">
              <h4 className="footer-heading">Newsletter</h4>
              <p>Subscribe to get the latest updates</p>
              <div className="newsletter-form">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="newsletter-input"
                />
                <button className="newsletter-button">
                  <FiMail />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            © 2024 EduLMS. All rights reserved.
          </p>
          <div className="payment-methods">
            <span className="payment-icon">💳</span>
            <span className="payment-icon">🅿️</span>
            <span className="payment-icon">💰</span>
            <span className="payment-icon">💲</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;