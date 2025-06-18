import React, { useState, useEffect } from 'react';
import { 
  FiClock, 
  FiBook, 
  FiShoppingCart, 
  FiBarChart2,
  FiArrowRight
} from 'react-icons/fi';
import './CourseList.css';

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch with delay
    setTimeout(() => {
      const dummyCourses = [
        { 
          id: 1, 
          title: "Web Development Bootcamp", 
          instructor: "John Doe", 
          rating: 4.8,
          badge: "Bestseller",
          price: 89.99,
          discountedPrice: 59.99,
          duration: "32 hours",
          lessons: 245,
          category: "Development",
          image: "web-dev"
        },
        { 
          id: 2, 
          title: "Data Science Mastery", 
          instructor: "Jane Smith", 
          rating: 4.7,
          badge: "New",
          price: 99.99,
          discountedPrice: 79.99,
          duration: "45 hours",
          lessons: 320,
          category: "Data Science",
          image: "data-science"
        },
        { 
          id: 3, 
          title: "Digital Marketing Strategy", 
          instructor: "Alex Johnson", 
          rating: 4.5,
          price: 79.99,
          discountedPrice: 49.99,
          duration: "28 hours",
          lessons: 180,
          category: "Marketing",
          image: "digital-marketing"
        },
        { 
          id: 4, 
          title: "UI/UX Design Fundamentals", 
          instructor: "Emily Chen", 
          rating: 4.9,
          badge: "Hot",
          price: 89.99,
          discountedPrice: 69.99,
          duration: "36 hours",
          lessons: 210,
          category: "Design",
          image: "ui-ux"
        }
      ];
      setCourses(dummyCourses);
      setLoading(false);
    }, 800);
  }, []);

  // Function to get gradient style based on course type
  const getGradientStyle = (imageType) => {
    switch (imageType) {
      case 'web-dev':
        return { background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' };
      case 'data-science':
        return { background: 'linear-gradient(135deg, #3B82F6, #10B981)' };
      case 'digital-marketing':
        return { background: 'linear-gradient(135deg, #10B981, #047857)' };
      case 'ui-ux':
        return { background: 'linear-gradient(135deg, #EC4899, #8B5CF6)' };
      default:
        return { background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' };
    }
  };

  // Function to get badge class based on type
  const getBadgeStyle = (badge) => {
    switch (badge) {
      case "Bestseller":
        return { background: '#ef4444' };
      case "New":
        return { background: '#3b82f6' };
      case "Hot":
        return { background: '#f97316' };
      default:
        return { background: '#4F46E5' };
    }
  };

  return (
    <section className="courses">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Popular Courses</h2>
          <p className="section-subtitle">
            Discover our top-rated courses chosen by thousands of learners to advance their careers
          </p>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="course-grid">
            {courses.map((course) => (
              <div 
                key={course.id} 
                className="course-card"
              >
                <div className="course-image-container">
                  <div 
                    className="course-image"
                    style={getGradientStyle(course.image)}
                  >
                    <div className="course-acronym">
                      {course.title.split(' ').map(word => word[0]).join('')}
                    </div>
                  </div>
                  
                  {course.badge && (
                    <span 
                      className="course-badge"
                      style={getBadgeStyle(course.badge)}
                    >
                      {course.badge}
                    </span>
                  )}
                  
                  <div className="course-category">
                    {course.category}
                  </div>
                </div>
                
                <div className="course-content">
                  <h3>{course.title}</h3>
                  
                  <div className="course-meta">
                    <div className="course-instructor">
                      <FiBarChart2 className="instructor-icon" />
                      <span>{course.instructor}</span>
                    </div>
                    <div className="course-rating">
                      <span className="rating-star">★</span>
                      <span>{course.rating}</span>
                    </div>
                  </div>
                  
                  <div className="course-details">
                    <div className="course-duration">
                      <FiClock className="detail-icon" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="course-lessons">
                      <FiBook className="detail-icon" />
                      <span>{course.lessons} Lessons</span>
                    </div>
                  </div>
                  
                  <div className="course-pricing">
                    {course.discountedPrice ? (
                      <>
                        <div className="discounted-price">${course.discountedPrice}</div>
                        <div className="original-price">${course.price}</div>
                      </>
                    ) : (
                      <div className="course-price">${course.price}</div>
                    )}
                  </div>
                  
                  <button className="btn-enroll">
                    <FiShoppingCart className="enroll-icon" />
                    Enroll Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="view-all-container">
          <button className="btn-view-all">
            View All Courses
            <FiArrowRight className="view-all-icon" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default CourseList;