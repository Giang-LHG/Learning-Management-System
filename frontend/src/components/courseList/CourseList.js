import React, { useState, useEffect } from 'react';
import {
  FiArrowRight
} from 'react-icons/fi';
import './CourseList.css';
import { useNavigate } from 'react-router-dom';

function CourseList() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHotSubjects = async () => {
      try {
        const res = await fetch('/api/parent/subjects/subjects-overview');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const result = await res.json();
        const data = result.data?.hotSubjects || [];

        const processed = data.map(item => ({
          ...item,
          badge: 'Hot',
          numberCourse: item.enrollCount,  // số lượt đăng ký
          image: '' // hoặc gán ảnh nếu có
        }));

        setSubjects(processed);
      } catch (error) {
        console.error('Failed to fetch hot subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotSubjects();
  }, []);

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

  const getBadgeStyle = (badge) => {
    switch (badge) {
      case 'Bestseller':
        return { background: '#ef4444' };
      case 'New':
        return { background: '#3b82f6' };
      case 'Hot':
        return { background: '#f97316' };
      default:
        return { background: '#4F46E5' };
    }
  };
console.log(subjects);
  return (
    <section className="courses">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Hot Subjects</h2>
          <p className="section-subtitle">
            Explore the subjects with the most enrollments recently
          </p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="course-grid">
            {subjects.map((subject) => (
              <div key={subject._id} className="course-card">
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
                    <span className="course-badge" style={getBadgeStyle(subject.badge)}>
                      {subject.badge}
                    </span>
                  )}
                </div>

                <div className="course-content">
                  <h3>{subject.name}</h3>
                  <button
                    className="btn-enroll"
                    onClick={() => navigate(`/student/courses?subjectId=${subject._id}`)}
                  >
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
