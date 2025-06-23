import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Form, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { FiSave, FiFileText, FiCalendar, FiEdit3, FiZap, FiStar } from 'react-icons/fi';

export default function AssignmentCreate() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'essay',
    dueDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload = { ...formData, courseId };
      const res = await axios.post('/api/instructor/assignments', payload);
      
      if(res.data.success) {
        alert('🎉 Tạo bài tập thành công rồi nè!');
        navigate(`/instructor/course/${courseId}/edit`);
      }
    } catch (err) {
      console.error("Error creating assignment:", err);
      setError(err.response?.data?.message || 'Ôi không! Tạo bài tập thất bại rồi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Animated Background */}
      <div className="position-absolute w-100 h-100" style={{ overflow: 'hidden', zIndex: 0 }}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="position-absolute"
            style={{
              width: `${Math.random() * 6 + 4}px`,
              height: `${Math.random() * 6 + 4}px`,
              background: 'rgba(255,255,255,0.6)',
              borderRadius: '50%',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <Container className="py-5 position-relative" style={{ zIndex: 1 }}>
        <Row className="justify-content-center">
          <Col lg={8}>
            {/* Animated Header */}
            <div 
              className="text-center mb-5"
              style={{ animation: 'bounceInDown 1s ease-out' }}
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
              <h1 className="text-white fw-bold mb-3 display-5">
                Tạo Bài Tập
              </h1>
              <p className="text-white fs-5 opacity-75">
                🚀 Thiết kế bài tập hấp dẫn cho học viên của bạn
              </p>
            </div>

            {/* Main Form Card */}
            <Card 
              className="border-0 shadow-lg"
              style={{
                borderRadius: '25px',
                overflow: 'hidden',
                animation: 'slideInUp 0.8s ease-out',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)'
              }}
            >
              <Card.Header 
                className="text-white py-4"
                style={{ 
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  borderBottom: 'none'
                }}
              >
                <h4 className="mb-0 fw-bold text-center">
                  <FiFileText className="me-3" />
                  📝 Chi Tiết Bài Tập
                </h4>
              </Card.Header>
              
              <Card.Body className="p-5">
                <Form onSubmit={handleSubmit}>
                  {/* Title Input */}
                  <div className="mb-4">
                    <Form.Label className="fw-bold text-dark fs-5 mb-3">
                      <FiStar className="me-2 text-warning" />
                      🎯 Tiêu Đề Bài Tập
                    </Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Nhập tiêu đề bài tập siêu hay ho..."
                        required
                        className="form-control-lg border-0 shadow-sm"
                        style={{ 
                          borderRadius: '15px',
                          paddingLeft: '20px',
                          background: 'linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%)',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => e.target.style.transform = 'scale(1.02)'}
                        onBlur={(e) => e.target.style.transform = 'scale(1)'}
                      />
                    </div>
                  </div>

                  <Row>
                    <Col md={6}>
                      <div className="mb-4">
                        <Form.Label className="fw-bold text-dark fs-5 mb-3">
                          📚 Loại Bài Tập
                        </Form.Label>
                        <Form.Select
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                          className="form-select-lg border-0 shadow-sm"
                          style={{ 
                            borderRadius: '15px',
                            background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)'
                          }}
                        >
                          <option value="essay">📝 Bài Luận Sáng Tạo</option>
                          <option value="quiz">❓ Quiz Thú Vị (thêm câu hỏi sau)</option>
                        </Form.Select>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-4">
                        <Form.Label className="fw-bold text-dark fs-5 mb-3">
                          <FiCalendar className="me-2 text-info" />
                          ⏰ Hạn Nộp Bài
                        </Form.Label>
                        <Form.Control
                          type="datetime-local"
                          name="dueDate"
                          value={formData.dueDate}
                          onChange={handleChange}
                          required
                          className="form-control-lg border-0 shadow-sm"
                          style={{ 
                            borderRadius: '15px',
                            background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)'
                          }}
                        />
                      </div>
                    </Col>
                  </Row>

                  {/* Description */}
                  <div className="mb-5">
                    <Form.Label className="fw-bold text-dark fs-5 mb-3">
                      💭 Mô Tả Chi Tiết
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Viết hướng dẫn chi tiết và thú vị cho bài tập này..."
                      className="border-0 shadow-sm"
                      style={{ 
                        borderRadius: '15px',
                        background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)',
                        resize: 'none'
                      }}
                    />
                  </div>

                  {error && (
                    <Alert 
                      variant="danger" 
                      className="border-0 shadow-sm mb-4"
                      style={{ 
                        borderRadius: '15px',
                        animation: 'shake 0.5s ease-in-out'
                      }}
                    >
                      <strong>😱 Ôi không!</strong> {error}
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <div className="text-center">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-lg px-5 py-3 border-0 shadow-lg fw-bold"
                      style={{
                        background: isSubmitting 
                          ? 'linear-gradient(135deg, #bdbdbd 0%, #9e9e9e 100%)'
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '25px',
                        fontSize: '1.2rem',
                        transition: 'all 0.3s ease',
                        transform: isSubmitting ? 'scale(0.95)' : 'scale(1)'
                      }}
                      onMouseEnter={(e) => !isSubmitting && (e.target.style.transform = 'scale(1.05)')}
                      onMouseLeave={(e) => !isSubmitting && (e.target.style.transform = 'scale(1)')}
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-3" />
                          🔄 Đang tạo bài tập...
                        </>
                      ) : (
                        <>
                          <FiSave className="me-3" />
                          🚀 Tạo Bài Tập Ngay!
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        @keyframes bounceInDown {
          0% {
            opacity: 0;
            transform: translateY(-100px);
          }
          60% {
            opacity: 1;
            transform: translateY(25px);
          }
          100% {
            transform: translateY(0);
          }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
