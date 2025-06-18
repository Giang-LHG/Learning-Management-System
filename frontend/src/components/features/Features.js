import React from 'react';
import { FiBook, FiTrendingUp, FiUsers, FiSmartphone, FiAward, FiClock } from 'react-icons/fi';
import './Features.css'; // Assuming you have a CSS file for styles

function Features() {
  const features = [
    { 
      icon: <FiBook />, 
      title: "Interactive Courses", 
      desc: "Engaging lessons with quizzes, assignments, and practical projects to enhance your learning experience." 
    },
    { 
      icon: <FiTrendingUp />, 
      title: "Progress Tracking", 
      desc: "Monitor your learning journey with detailed analytics and personalized insights to achieve your goals." 
    },
    { 
      icon: <FiUsers />, 
      title: "Collaboration", 
      desc: "Connect with instructors and peers through discussion forums, group projects, and live sessions." 
    },
    { 
      icon: <FiSmartphone />, 
      title: "Mobile Learning", 
      desc: "Access your courses anytime, anywhere with our fully responsive platform on any device." 
    },
    { 
      icon: <FiAward />, 
      title: "Certification", 
      desc: "Earn recognized certificates upon course completion to showcase your skills and achievements." 
    },
    { 
      icon: <FiClock />, 
      title: "Self-Paced Learning", 
      desc: "Learn at your own convenience with flexible schedules and lifetime access to course materials." 
    }
  ];

  return (
    <section className="features">
      <div className="container">
        <div className="feature-section-header">
          <h2 className="feature-section-title">Why Choose Our LMS?</h2>
          <p className="feature-section-subtitle">
            Discover the powerful features that make our learning platform the preferred choice 
            for thousands of students and professionals worldwide.
          </p>
        </div>
        
        <div className="feature-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;