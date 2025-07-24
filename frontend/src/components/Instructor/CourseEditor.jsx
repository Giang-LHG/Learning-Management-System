import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Card, Button, Spinner, Row, Col, ListGroup, Form, Alert, Badge
} from 'react-bootstrap';
import { FiTrash2, FiEye, FiEyeOff, FiEdit, FiBook, FiLayers, FiShield, FiZap } from 'react-icons/fi';
import DeleteCourseModal from './DeleteCourseModal';

export default function CourseEditor() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState('');
const token = localStorage.getItem('token');
  const fetchCourse = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/student/courses/${courseId}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
      if (res.data.success) setCourse(res.data.data);
    } catch (err) {
      console.error("Error fetching course:", err);
      setError("Không thể tải chi tiết khóa học.");
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const handleDeleteCourse = async () => {
    try {
      await axios.delete(`/api/instructor/courses/${courseId}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
      alert("🎉 Khóa học đã được xóa thành công!");
      setShowDeleteModal(false);
      navigate('/instructor/dashboard');
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("❌ Xóa khóa học thất bại.");
    }
  };

  const handleToggleVisibility = async (materialType, materialId, currentVisibility) => {
    try {
      const res = await axios.put(
        `/api/instructor/courses/${courseId}/materials/toggle-visibility`,
        { materialType, materialId, isVisible: !currentVisibility , 
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
      if (res.data.success) {
        setCourse(res.data.data);
      }
    } catch (err) {
      console.error("Error toggling visibility:", err);
      alert("❌ Update fail.");
    }
  };

  if (isLoading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    }}>
      <div className="text-center">
        <div className="spinner-border text-light mb-3" style={{ width: '4rem', height: '4rem' }}></div>
        <h4 className="text-white">Load course...</h4>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      <Container className="py-5">
        <Alert variant="danger" className="border-0 shadow-lg">
          <FiShield className="me-2" />
          <strong>Error:</strong> {error}
        </Alert>
      </Container>
    </div>
  );

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      minHeight: '100vh', 
      position: 'relative' 
    }}>
      {/* Floating Background Elements */}
      <div className="position-absolute w-100 h-100" style={{ overflow: 'hidden', zIndex: 0 }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="position-absolute rounded-circle"
            style={{
              width: `${Math.random() * 120 + 80}px`,
              height: `${Math.random() * 120 + 80}px`,
              background: 'rgba(255,255,255,0.1)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 4 + 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <Container className="py-5 position-relative" style={{ zIndex: 1 }}>
        <Row>
          <Col lg={8} className="mx-auto">
            {/* Animated Header */}
            <div 
              className="text-center mb-5"
              style={{ animation: 'fadeInDown 1s ease-out' }}
            >
              <div 
                className="d-inline-block p-4 rounded-circle mb-3"
                style={{ 
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <FiZap size={48} className="text-white" />
              </div>
              <h1 className="text-white fw-bold mb-2 display-5">
               Edit
              </h1>
              <p className="text-white-50 fs-5">Manage your course</p>
            </div>

            {/* Danger Zone Card */}
            <Card 
              className="border-0 shadow-lg mb-4" 
              style={{ 
                borderRadius: '20px', 
                overflow: 'hidden',
                animation: 'slideInLeft 0.8s ease-out'
              }}
            >
              <Card.Header 
                className="text-white py-4"
                style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)' }}
              >
                
              </Card.Header>
              <Card.Body className="text-center p-4">
                <p className="text-muted mb-3 fs-5">
                  🚨 Delete course !
                </p>
                <Button
                  variant="outline-danger"
                  onClick={() => setShowDeleteModal(true)}
                  className="px-5 py-2 fw-bold"
                  style={{ 
                    borderRadius: '25px',
                    borderWidth: '2px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#dc3545';
                  }}
                >
                  <FiTrash2 className="me-2" />
                  🗑️ Delete course
                </Button>
              </Card.Body>
            </Card>

            {/* Course Content Card */}
            <Card 
              className="border-0 shadow-lg" 
              style={{ 
                borderRadius: '20px', 
                overflow: 'hidden',
                animation: 'slideInRight 0.8s ease-out'
              }}
            >
              <Card.Header 
                className="text-white py-4"
                style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}
              >
                <h5 className="mb-0 fw-bold">
                  <FiBook className="me-2" />
                  📚 Course Detail
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                {course?.modules.map((module, moduleIndex) => (
                  <div key={module.moduleId} className="border-bottom">
                    {/* Module Header */}
                    <div 
                      className="p-4 d-flex justify-content-between align-items-center"
                      style={{ 
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'}
                      onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}
                    >
                      <div className="d-flex align-items-center">
                        <div 
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                          style={{ width: '40px', height: '40px' }}
                        >
                          <FiLayers />
                        </div>
                        <div>
                          <strong className="text-dark fs-5">
                            📖 Module {moduleIndex + 1}: {module.title}
                          </strong>
                          <div className="mt-1">
                            <Badge 
                              bg={module.isVisible ? 'success' : 'secondary'} 
                              className="fs-6"
                            >
                              {module.isVisible ? '👁️ Hiển thị' : '🙈 Ẩn'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant={module.isVisible ? 'outline-warning' : 'outline-success'}
                        size="sm"
                        onClick={() => handleToggleVisibility('module', module.moduleId, module.isVisible)}
                        className="px-3 py-2"
                        style={{ borderRadius: '15px' }}
                      >
                        {module.isVisible ? <FiEyeOff /> : <FiEye />}
                      </Button>
                    </div>

                    {/* Lessons List */}
                    <ListGroup variant="flush">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <ListGroup.Item 
                          key={lesson.lessonId}
                          className="d-flex justify-content-between align-items-center py-3 px-4"
                          style={{ transition: 'all 0.3s ease' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                        >
                          <div className="d-flex align-items-center">
                            <Badge bg="primary" pill className="me-3">
                              {lessonIndex + 1}
                            </Badge>
                            <span className="fw-medium fs-6">📄 {lesson.title}</span>
                            <Badge 
                              bg={lesson.isVisible ? 'success' : 'secondary'} 
                              className="ms-3"
                            >
                              {lesson.isVisible ? '👁️ Show' : '🙈 Hidden'}
                            </Badge>
                          </div>
                          <Button
                            variant={lesson.isVisible ? 'outline-warning' : 'outline-success'}
                            size="sm"
                            onClick={() => handleToggleVisibility('lesson', lesson.lessonId, lesson.isVisible)}
                            style={{ borderRadius: '15px' }}
                          >
                            {lesson.isVisible ? <FiEyeOff /> : <FiEye />}
                          </Button>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <DeleteCourseModal
          show={showDeleteModal}
          handleClose={() => setShowDeleteModal(false)}
          handleDelete={handleDeleteCourse}
          courseTitle={course?.title || ''}
        />
      </Container>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
