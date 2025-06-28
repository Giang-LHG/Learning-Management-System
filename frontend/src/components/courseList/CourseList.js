import React, { useState, useEffect } from 'react';
import { 
  FiClock, 
  FiBook, 
  FiShoppingCart, 
  FiBarChart2,
  FiArrowRight
} from 'react-icons/fi';
import './CourseList.css';
import { useNavigate } from 'react-router-dom';
function CourseList() {
  const [subjects, setSubjects] = useState([]);
const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => {
   const dummySubjects = [
        { 
          _id: "60b000000000000000000001", 
          code: "CS101", 
          name: "Lập trình căn bản", 
          description: "Khóa học nhập môn lập trình cơ bản (Ngôn ngữ Python).",
   badge: "Hot",
          prerequisites: [],
          numberCourse:6,
            image: "",
        },
        { 
          _id: "60b000000000000000000002", 
          code: "CS102", 
          name: "Cấu trúc dữ liệu", 
             badge: "Hot",
          description: "Khóa học về cấu trúc dữ liệu, yêu cầu phải hoàn thành Lập trình căn bản trước.",
          prerequisites: ["60b000000000000000000001"],
           numberCourse:6,
                image: "",
        },
        { 
          _id: "68462da3733701e65633bec0", 
          code: "CS103", 
          name: "Lập trình căn bản", 
             badge: "Hot",
          description: "Khóa học nhập môn lập trình cơ bản (Ngôn ngữ Python).",
          prerequisites: [],
           numberCourse:6,
           
                image: "",
     
        }
      ];
      setSubjects(dummySubjects);
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
            {subjects.map((subject) => (
              <div 
                key={subject._id} 
                className="course-card"
              >
                <div className="course-image-container">
                  <div 
                    className="course-image"
                    style={getGradientStyle(subject.image)}
                  >
                    <div className="course-acronym">
                      {subject.code.split(' ').map(word => word[0]).join('')}
                    </div>
                  </div>
                  
                  {subject.badge && (
                    <span 
                      className="course-badge"
                      style={getBadgeStyle(subject.badge)}
                    >
                      {subject.badge}
                    </span>
                  )}
                  
                 
                </div>
                
                <div className="course-content">
                  <h3>{subject.name}</h3>
                  
                  
                  
                  <div className="course-details">
                    
                    <div className="course-lessons">
                      <FiBook className="detail-icon" />
                      <span>{subject.numberCourse} Courses</span>
                    </div>
                  </div>
                  
                
                  
                  <button className="btn-enroll"   onClick={() => navigate(`/student/courses?subjectId=${subject._id}`)}>
                 
                    Enroll Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="view-all-container">
          <button className="btn-view-all" onClick={() => navigate('/student/subjects')}>
            View All Subjects
            <FiArrowRight className="view-all-icon" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default CourseList;