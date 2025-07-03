import React from 'react';
import { FiArrowRight, FiPlay } from 'react-icons/fi';
import './HeroSection.css'; // Assuming you have a CSS file for styles

function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-background">
        <div className="hero-gradient"></div>
        <div className="hero-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              animationDuration: `${Math.random() * 5 + 5}s`
            }}></div>
          ))}
        </div>
      </div>
      
      <div className="hero-content">
        <div className="hero-badge">
          <span>TRENDING NOW</span>
        </div>
        <h1 className="hero-title">
          <span className="hero-highlight">Learn</span> Without Limits
        </h1>
        <p className="hero-subtitle">
          Access thousands of expert-led courses anytime, anywhere on any device.
        </p>
        
        <div className="hero-buttons">
          <button className="btn-primary">
            Browse Courses <FiArrowRight className="btn-icon" />
          </button>
          <button className="btn-secondary">
            <FiPlay className="btn-icon" /> Watch Demo
          </button>
        </div>
        
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-value">50K+</span>
            <span className="stat-label">Active Learners</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">4.9/5</span>
            <span className="stat-label">Avg. Rating</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">98%</span>
            <span className="stat-label">Completion Rate</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;