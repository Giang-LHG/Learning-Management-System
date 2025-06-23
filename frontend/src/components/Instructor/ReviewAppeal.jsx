import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Form, Button, Spinner, Row, Col, Alert, Badge, ListGroup } from 'react-bootstrap';
import { FiArrowLeft, FiSend, FiUser, FiMessageCircle, FiFileText, FiStar, FiZap, FiHeart } from 'react-icons/fi';

export default function ReviewAppeal() {
  const { submissionId, appealId } = useParams();
  const navigate = useNavigate();
  const INSTRUCTOR_ID = "60a000000000000000000003";
  
  const [submission, setSubmission] = useState(null);
  const [currentAppeal, setCurrentAppeal] = useState(null);
  const [newScore, setNewScore] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchSubmissionDetail = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/instructor/submissions/${submissionId}`);
      if (res.data.success) {
        const subData = res.data.data;
        setSubmission(subData);
        setNewScore(subData.grade?.score ?? '');
        const appeal = subData.appeals.find(a => a.appealId.toString() === appealId);
        setCurrentAppeal(appeal);
      }
    } catch (err) {
      console.error("Error fetching submission:", err);
      setError("Không thể tải dữ liệu bài nộp.");
    } finally {
      setIsLoading(false);
    }
  }, [submissionId, appealId]);

  useEffect(() => {
    fetchSubmissionDetail();
  }, [fetchSubmissionDetail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!commentText.trim()) {
      setError("Vui lòng nhập phản hồi của bạn.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        newScore: newScore === '' ? null : Number(newScore),
        commentText,
        instructorId: INSTRUCTOR_ID,
      };

      await axios.put(`/api/instructor/appeals/submissions/${submissionId}/appeals/${appealId}/resolve`, payload);
      alert("🎉 Đã xử lý khiếu nại thành công!");
      navigate('/instructor/appeals');
    } catch (err) {
      console.error("Error resolving appeal:", err);
      setError(err.response?.data?.message || "Xử lý khiếu nại thất bại.");
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
          <h4 className="text-white">Đang tải chi tiết khiếu nại...</h4>
        </div>
      </div>
    );
  }

  if (!submission || !currentAppeal) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
        <Container className="py-5">
          <Alert variant="danger" className="border-0 shadow-lg">
            {error || "Không tìm thấy khiếu nại."}
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
      {/* Animated Background */}
      <div className="position-absolute w-100 h-100" style={{ overflow: 'hidden', zIndex: 0 }}>
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="position-absolute"
            style={{
              width: `${Math.random() * 6 + 3}px`,
              height: `${Math.random() * 6 + 3}px`,
              background: 'rgba(255,255,255,0.7)',
              borderRadius: '50%',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `twinkle ${Math.random() * 4 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`
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
                onClick={() => navigate('/instructor/appeals')}
                className="me-4 px-4 py-2 border-2"
                style={{ 
                  borderRadius: '25px', 
                  backdropFilter: 'blur(10px)',
                  animation: 'slideInLeft 0.6s ease-out'
                }}
              >
                <FiArrowLeft className="me-2" />
                🔙 Quay lại danh sách
              </Button>
              <div style={{ animation: 'fadeInRight 0.8s ease-out' }}>
                <h1 className="text-white fw-bold mb-1 display-5">
                  <FiZap className="me-3" />
                  🔍 Xem Xét Khiếu Nại
                </h1>
                <p className="text-white-50 mb-0 fs-5">Xem xét và phản hồi khiếu nại điểm số từ học viên</p>
              </div>
            </div>

            {/* Appeal Details Card */}
            <Card 
              className="border-0 shadow-lg mb-4" 
              style={{ 
                borderRadius: '25px', 
                animation: 'slideInUp 0.8s ease-out' 
              }}
            >
              <Card.Header 
                className="text-white py-4"
                style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}
              >
                <h4 className="mb-0 fw-bold">
                  <FiFileText className="me-3" />
                  📋 Chi Tiết Khiếu Nại
                </h4>
              </Card.Header>
              <Card.Body className="p-5">
                <Row>
                  <Col md={4}>
                    <div className="text-center mb-4">
                      <div 
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                        style={{ width: '80px', height: '80px', fontSize: '32px' }}
                      >
                        👤
                      </div>
                      <strong className="text-primary fs-4">Học viên:</strong>
                      <div className="mt-2">
                        <Badge bg="primary" className="fs-5 px-4 py-2">
                          {submission.studentId.profile.fullName}
                        </Badge>
                      </div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center mb-4">
                      <div 
                        className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                        style={{ width: '80px', height: '80px', fontSize: '32px' }}
                      >
                        📚
                      </div>
                      <strong className="text-success fs-4">Bài tập:</strong>
                      <div className="mt-2">
                        <Badge bg="success" className="fs-5 px-4 py-2">
                          {submission.assignmentId.title}
                        </Badge>
                      </div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center mb-4">
                      <div 
                        className="rounded-circle bg-warning text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                        style={{ width: '80px', height: '80px', fontSize: '32px' }}
                      >
                        ⭐
                      </div>
                      <strong className="text-warning fs-4">Điểm gốc:</strong>
                      <div className="mt-2">
                        <Badge 
                          bg={submission.grade.score >= 70 ? 'success' : submission.grade.score >= 50 ? 'warning' : 'danger'}
                          className="fs-5 px-4 py-2"
                        >
                          {submission.grade.score} điểm
                        </Badge>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Conversation History */}
            <Card 
              className="border-0 shadow-lg mb-4" 
              style={{ 
                borderRadius: '25px', 
                animation: 'slideInLeft 0.8s ease-out' 
              }}
            >
              <Card.Header 
                className="text-white py-4"
                style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}
              >
                <h4 className="mb-0 fw-bold">
                  <FiMessageCircle className="me-3" />
                  💬 Lịch Sử Cuộc Trò Chuyện
                </h4>
              </Card.Header>
              <Card.Body className="p-0">
                <ListGroup variant="flush">
                  {currentAppeal.comments.map((comment, index) => {
                    const isInstructor = comment.by.toString() === INSTRUCTOR_ID;
                    return (
                      <ListGroup.Item 
                        key={index} 
                        className="py-4 px-4"
                        style={{ 
                          animation: `fadeInUp 0.6s ease-out ${index * 0.2}s both`
                        }}
                      >
                        <div className="d-flex align-items-start">
                          <div 
                            className={`rounded-circle text-white d-flex align-items-center justify-content-center me-4 ${
                              isInstructor ? 'bg-primary' : 'bg-info'
                            }`}
                            style={{ 
                              width: '50px', 
                              height: '50px', 
                              fontSize: '20px',
                              flexShrink: 0
                            }}
                          >
                            {isInstructor ? '👨‍🏫' : '👨‍🎓'}
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <strong className={`fs-5 ${isInstructor ? 'text-primary' : 'text-info'}`}>
                                {isInstructor ? '🎓 Bạn (Giảng viên)' : `👨‍🎓 ${submission.studentId.profile.fullName}`}
                              </strong>
                              <small className="text-muted">
                                📅 {new Date(comment.at).toLocaleString('vi-VN')}
                              </small>
                            </div>
                            <div 
                              className={`p-4 rounded-3 ${
                                isInstructor 
                                  ? 'text-white' 
                                  : 'bg-light'
                              }`}
                              style={{ 
                                background: isInstructor 
                                  ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' 
                                  : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                fontSize: '1.1rem',
                                lineHeight: '1.6'
                              }}
                            >
                              {comment.text}
                            </div>
                          </div>
                        </div>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              </Card.Body>
            </Card>

            {/* Response Form */}
            <Card 
              className="border-0 shadow-lg" 
              style={{ 
                borderRadius: '25px', 
                animation: 'slideInRight 0.8s ease-out' 
              }}
            >
              <Card.Header 
                className="text-white py-4"
                style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}
              >
                <h4 className="mb-0 fw-bold">
                  <FiHeart className="me-3" />
                  💝 Phản Hồi Của Bạn
                </h4>
              </Card.Header>
              <Card.Body className="p-5">
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <div className="mb-4">
                        <Form.Label className="fw-bold fs-5 mb-3">
                          <FiStar className="me-2 text-warning" />
                          🎯 Điểm số mới (tùy chọn)
                        </Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          max="100"
                          value={newScore}
                          onChange={(e) => setNewScore(e.target.value)}
                          placeholder="Để trống nếu giữ nguyên điểm cũ"
                          className="form-control-lg border-0 shadow-sm"
                          style={{ 
                            borderRadius: '15px',
                            background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)'
                          }}
                        />
                        <Form.Text className="text-muted fs-6 mt-2">
                          💡 Điểm hiện tại: <strong>{submission.grade.score}</strong>
                        </Form.Text>
                      </div>
                    </Col>
                  </Row>

                  <div className="mb-5">
                    <Form.Label className="fw-bold fs-5 mb-3">
                      <FiMessageCircle className="me-2 text-info" />
                      💬 Thêm bình luận
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Giải thích quyết định của bạn và đưa ra phản hồi tích cực cho học viên..."
                      required
                      className="border-0 shadow-sm"
                      style={{ 
                        borderRadius: '15px',
                        background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                        resize: 'none',
                        fontSize: '1.1rem'
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
                        fontSize: '1.3rem',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-3" />
                          🔄 Đang xử lý...
                        </>
                      ) : (
                        <>
                          <FiSend className="me-3" />
                          🚀 Gửi & Giải Quyết Khiếu Nại
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
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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
