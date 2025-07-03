import React from 'react';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';
import './Testimonials.css'; 

function Testimonials() {
  const testimonials = [
    { 
      name: "Sarah K.", 
      role: "Computer Science Student", 
      quote: "This LMS completely transformed my learning experience! The interactive courses and progress tracking helped me master complex topics in half the time I expected.",
      avatar: "SK",
      rating: 5
    },
    { 
      name: "Prof. David L.", 
      role: "Senior Instructor", 
      quote: "As an educator with 15+ years of experience, I can confidently say this platform sets a new standard. The tools for instructors make creating and managing courses a breeze.",
      avatar: "DL",
      rating: 5
    },
    { 
      name: "Michael T.", 
      role: "Data Analyst", 
      quote: "The Data Science courses helped me switch careers in just 6 months. The practical projects were exactly what employers were looking for. Best investment I've made in my professional development!",
      avatar: "MT",
      rating: 5
    }
  ];

  return (
    <section className="testimonials">
      <div className="container">
        <div className="section-header">
          <div className="section-subtitle">TRUSTED BY THOUSANDS</div>
          <h2 className="section-title">What Our Learners Say</h2>
          <p className="section-description">
            Don't just take our word for it. Hear from our community of students, 
            professionals, and instructors who have transformed their careers with our platform.
          </p>
        </div>
        
        <div className="testimonial-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-content">
                <FaQuoteLeft className="quote-icon" />
                <p className="testimonial-text">{testimonial.quote}</p>
                
                <div className="testimonial-rating">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < testimonial.rating ? "star filled" : "star"} />
                  ))}
                </div>
              </div>
              
              <div className="testimonial-author">
                <div className="avatar">{testimonial.avatar}</div>
                <div className="author-info">
                  <h4 className="author-name">{testimonial.name}</h4>
                  <p className="author-role">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="testimonial-footer">
          <p>Join our community of <strong>50,000+</strong> satisfied learners today</p>
          <button className="btn-primary">Start Learning Now</button>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;