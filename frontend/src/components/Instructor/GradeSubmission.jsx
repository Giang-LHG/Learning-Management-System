import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Form, Button, Spinner, Alert, Row, Col, Badge } from 'react-bootstrap';
import { FiUser, FiFileText, FiSave, FiArrowLeft, FiCalendar, FiBookOpen, FiStar, FiZap } from 'react-icons/fi';

export default function GradeSubmission() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchSubmission = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/instructor/submissions/${submissionId}`);
      if (res.data.success) {
        const sub = res.data.data;
        setSubmission(sub);
        setScore(sub.grade?.score || '');
        setFeedback(sub.grade?.feedback || '');
      }
    } catch (err) {
      console.error("Error fetching submission:", err);
      setError("Không thể tải dữ liệu bài nộp.");
    } finally {
      setIsLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    fetchSubmission();
  }, [fetchSubmission]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        score: score === '' ? null : Number(score),
        feedback: feedback.trim()
      };
      
      await axios.put(`/api/instructor/submissions/${submissionId}/grade`, payload);
      alert('🎉 Chấm điểm thành công rồi nè!');
      navigate(-1);
    } catch (err) {
      console.error("Error grading submission:", err);
      setError(err.response?.data?.message || 'Chấm điểm thất bại rồi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
      }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" style={{ width: '4rem', height: '4rem' }}></div>
          <h4 className="text-white">Đang tải bài nộp...</h4>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
        <Container className="py-5">
          <Alert variant="danger" className="border-0 shadow-lg">
            Không tìm thấy bài nộp.
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      minHeight: '100vh', 
      position: 'relative' 
    }}>
      {/* Floating Background */}
      <div className="position-absolute w-100 h-100" style={{ overflow: 'hidden', zIndex: 0 }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="position-absolute rounded-circle"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              background: 'rgba(255,255,255,0.1)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 4 + 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <Container className="py-5 position-relative" style={{ zIndex: 1 }}>
        <Row>
          <Col lg={10} className="mx-auto">
            {/* Header */}
            <div className="d-flex align-items-center mb-5">
              <Button
                variant="outline-light"
                onClick={() => navigate(-1)}
                className="me-4 px-4 py-2 border-2"
                style={{ 
                  borderRadius: '25px', 
                  backdropFilter: 'blur(10px)',
                  animation: 'slideInLeft 0.6s ease-out'
                }}
              >
                <FiArrowLeft className="me-2" />
                🔙 Quay lại
              </Button>
              <div style={{ animation: 'fadeInRight 0.8s ease-out' }}>
                <h1 className="text-white fw-bold mb-1 display-5">
                  <FiZap className="me-3" />
                  ⭐ Chấm Điểm
                </h1>
                <p className="text-white-50 mb-0 fs-5">Đánh giá và phản hồi bài làm của học viên</p>
              </div>
            </div>

            {/* Student Info Card */}
            <Card 
              className="border-0 shadow-lg mb-4" 
              style={{ 
                borderRadius: '20px', 
                animation: 'slideInUp 0.8s ease-out' 
              }}
            >
              <Card.Header 
                className="text-white py-4"
                style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}
              >
                <h4 className="mb-0 fw-bold">
                  <FiUser className="me-3" />
                  📋 Thông Tin Bài Nộp
                </h4>
              </Card.Header>
              <Card.Body className="p-4">
                <Row>
                  <Col md={6}>
                    <div className="text-center mb-3">
                      <div 
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-2"
                        style={{ width: '60px', height: '60px', fontSize: '24px' }}
                      >
                        👤
                      </div>
                      <strong className="text-primary fs-5">Học viên:</strong>
                      <div className="mt-2">
                        <Badge bg="primary" className="fs-6 px-3 py-2">
                          {submission.studentId.profile.fullName}
                        </Badge>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="text-center mb-3">
                      <div 
                        className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mx-auto mb-2"
                        style={{ width: '60px', height: '60px', fontSize: '24px' }}
                      >
                        📝
                      </div>
                      <strong className="text-success fs-5">Bài tập:</strong>
                      <div className="mt-2">
                        <Badge bg="success" className="fs-6 px-3 py-2">
                          {submission.assignmentId.title}
                        </Badge>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="text-center mb-3">
                      <div 
                        className="rounded-circle bg-warning text-white d-flex align-items-center justify-content-center mx-auto mb-2"
                        style={{ width: '60px', height: '60px', fontSize: '24px' }}
                      >
                        📅
                      </div>
                      <strong className="text-warning fs-5">Học kỳ:</strong>
                      <div className="mt-2">
                        <Badge bg="warning" text="dark" className="fs-6 px-3 py-2">
                          {submission.term || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="text-center mb-3">
                      <div 
                        className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center mx-auto mb-2"
                        style={{ width: '60px', height: '60px', fontSize: '24px' }}
                      >
                        ⏰
                      </div>
                      <strong className="text-info fs-5">Nộp lúc:</strong>
                      <div className="mt-2 text-muted fs-6">
                        {new Date(submission.submittedAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Submission Content */}
            <Card 
              className="border-0 shadow-lg mb-4" 
              style={{ 
                borderRadius: '20px', 
                animation: 'slideInLeft 0.8s ease-out' 
              }}
            >
              <Card.Header 
                className="text-white py-4"
                style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}
              >
                <h4 className="mb-0 fw-bold">
                  <FiBookOpen className="me-3" />
                  📖 Bài Làm Của Học Viên
                </h4>
              </Card.Header>
              <Card.Body className="p-4">
                <div 
                  className="p-4 rounded-3"
                  style={{ 
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
                    border: '2px solid #dee2e6' 
                  }}
                >
                  {submission.assignmentId.type === 'quiz' ? (
                    <div>
                      {submission.assignmentId.questions?.map((q, idx) => {
                        const studentAnswer = submission.answers?.find(a => a.questionId === q._id);
                        return (
                          <div key={q._id} className="mb-4 p-3 bg-white rounded-3 shadow-sm">
                            <h6 className="text-primary fw-bold mb-3">
                              ❓ Câu {idx + 1}: {q.text}
                            </h6>
                            <div className="mt-2">
                              <strong>Câu trả lời của học viên:</strong>
                              <Badge bg="secondary" className="ms-2 fs-6">
                                {studentAnswer?.selectedOption || 'Chưa trả lời'}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-dark fs-5 lh-lg">
                      {submission.content || "Không có nội dung."}
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>

            {/* Grading Form */}
            <Card 
              className="border-0 shadow-lg" 
              style={{ 
                borderRadius: '20px', 
                animation: 'slideInRight 0.8s ease-out' 
              }}
            >
              <Card.Header 
                className="text-white py-4"
                style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}
              >
                <h4 className="mb-0 fw-bold">
                  <FiStar className="me-3" />
                  ⭐ Chấm Điểm & Phản Hồi
                </h4>
              </Card.Header>
              <Card.Body className="p-5">
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <div className="mb-4">
                        <Form.Label className="fw-bold fs-5 mb-3">
                          🎯 Điểm số (0-100)
                        </Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          max="100"
                          value={score}
                          onChange={(e) => setScore(e.target.value)}
                          placeholder="Nhập điểm số..."
                          className="form-control-lg border-0 shadow-sm"
                          style={{ 
                            borderRadius: '15px',
                            background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)'
                          }}
                        />
                      </div>
                    </Col>
                  </Row>

                  <div className="mb-5">
                    <Form.Label className="fw-bold fs-5 mb-3">
                      💭 Phản hồi chi tiết
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Viết phản hồi chi tiết và khuyến khích cho học viên..."
                      className="border-0 shadow-sm"
                      style={{ 
                        borderRadius: '15px',
                        background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                        resize: 'none'
                      }}
                    />
                  </div>

                  {error && (
                    <Alert 
                      variant="danger" 
                      className="border-0 shadow-sm mb-4"
                      style={{ borderRadius: '15px' }}
                    >
                      <strong>❌ Lỗi:</strong> {error}
                    </Alert>
                  )}

                  <div className="text-center">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-lg px-5 py-3 border-0 shadow-lg fw-bold"
                      style={{
                        background: isSubmitting 
                          ? 'linear-gradient(135deg, #bdbdbd 0%, #9e9e9e 100%)'
                          : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                        borderRadius: '25px',
                        fontSize: '1.2rem',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-3" />
                          🔄 Đang lưu điểm...
                        </>
                      ) : (
                        <>
                          <FiSave className="me-3" />
                          🚀 Lưu Điểm & Phản Hồi
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
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
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
        @keyframes fadeInRight {
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
