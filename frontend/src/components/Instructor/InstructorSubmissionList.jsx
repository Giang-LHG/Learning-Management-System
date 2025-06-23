import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Table, Button, Spinner, Badge, Alert, ProgressBar } from 'react-bootstrap';
import { FiEye, FiUsers, FiFileText, FiClock, FiArrowLeft, FiZap, FiTarget, FiTrendingUp } from 'react-icons/fi';

export default function InstructorSubmissionList() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/instructor/assignments/${assignmentId}/submissions`);
      if (res.data.success) {
        setSubmissions(res.data.data.submissions);
        setAssignment(res.data.data.assignment);
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError("Không thể tải dữ liệu bài nộp.");
    } finally {
      setIsLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGradeClick = (submissionId) => {
    navigate(`/instructor/grade/${submissionId}`);
  };

  const getStatusBadge = (submission) => {
    if (submission.grade?.score != null) {
      const score = submission.grade.score;
      if (score >= 80) return <Badge bg="success" className="fs-6">🌟 Xuất sắc</Badge>;
      if (score >= 70) return <Badge bg="info" className="fs-6">👍 Tốt</Badge>;
      if (score >= 60) return <Badge bg="warning" className="fs-6">⚡ Khá</Badge>;
      return <Badge bg="danger" className="fs-6">💪 Cần cải thiện</Badge>;
    }
    return <Badge bg="secondary" className="fs-6">⏳ Chờ chấm</Badge>;
  };

  // Calculate statistics
  const gradedCount = submissions.filter(s => s.grade?.score != null).length;
  const pendingCount = submissions.length - gradedCount;
  const averageScore = gradedCount > 0 
    ? Math.round(submissions.filter(s => s.grade?.score != null).reduce((sum, s) => sum + s.grade.score, 0) / gradedCount)
    : 0;
  const completionRate = submissions.length > 0 ? Math.round((gradedCount / submissions.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
      }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" style={{ width: '4rem', height: '4rem' }}></div>
          <h4 className="text-white">Đang tải danh sách bài nộp...</h4>
        </div>
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
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="position-absolute rounded-circle"
            style={{
              width: `${Math.random() * 60 + 30}px`,
              height: `${Math.random() * 60 + 30}px`,
              background: 'rgba(255,255,255,0.1)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 5 + 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <Container className="py-5 position-relative" style={{ zIndex: 1 }}>
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
              📋 Danh Sách Bài Nộp
            </h1>
            <p className="text-white-50 mb-0 fs-5">
              📚 {assignment?.title || 'Đang tải...'}
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <Card 
              className="border-0 shadow-lg h-100"
              style={{ 
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                borderRadius: '20px',
                animation: 'slideInUp 0.6s ease-out 0.1s both'
              }}
            >
              <Card.Body className="text-white text-center p-4">
                <FiUsers size={40} className="mb-3" />
                <h3 className="fw-bold mb-1">{submissions.length}</h3>
                <p className="mb-0 opacity-75">📝 Tổng bài nộp</p>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-3">
            <Card 
              className="border-0 shadow-lg h-100"
              style={{ 
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                borderRadius: '20px',
                animation: 'slideInUp 0.6s ease-out 0.2s both'
              }}
            >
              <Card.Body className="text-white text-center p-4">
                <FiTarget size={40} className="mb-3" />
                <h3 className="fw-bold mb-1">{gradedCount}</h3>
                <p className="mb-0 opacity-75">✅ Đã chấm</p>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-3">
            <Card 
              className="border-0 shadow-lg h-100"
              style={{ 
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                borderRadius: '20px',
                animation: 'slideInUp 0.6s ease-out 0.3s both'
              }}
            >
              <Card.Body className="text-white text-center p-4">
                <FiClock size={40} className="mb-3" />
                <h3 className="fw-bold mb-1">{pendingCount}</h3>
                <p className="mb-0 opacity-75">⏳ Chờ chấm</p>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-3">
            <Card 
              className="border-0 shadow-lg h-100"
              style={{ 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: '20px',
                animation: 'slideInUp 0.6s ease-out 0.4s both'
              }}
            >
              <Card.Body className="text-white text-center p-4">
                <FiTrendingUp size={40} className="mb-3" />
                <h3 className="fw-bold mb-1">{averageScore}</h3>
                <p className="mb-0 opacity-75">⭐ Điểm TB</p>
              </Card.Body>
            </Card>
          </div>
        </div>

        {/* Progress Bar */}
        <Card 
          className="border-0 shadow-lg mb-4"
          style={{ 
            borderRadius: '20px',
            animation: 'slideInUp 0.8s ease-out'
          }}
        >
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0 fw-bold text-primary">📊 Tiến Độ Chấm Bài</h5>
              <Badge bg="primary" className="fs-6">{completionRate}%</Badge>
            </div>
            <ProgressBar 
              now={completionRate} 
              style={{ height: '12px', borderRadius: '10px' }}
              variant="primary"
            />
            <small className="text-muted mt-2 d-block">
              {gradedCount} / {submissions.length} bài đã được chấm điểm
            </small>
          </Card.Body>
        </Card>

        {/* Submissions Table */}
        <Card 
          className="border-0 shadow-lg" 
          style={{ 
            borderRadius: '25px', 
            overflow: 'hidden',
            animation: 'slideInUp 1s ease-out'
          }}
        >
          <Card.Header 
            className="text-white d-flex justify-content-between align-items-center py-4"
            style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}
          >
            <h4 className="mb-0 fw-bold">
              <FiFileText className="me-3" />
              📚 Danh Sách Bài Nộp
            </h4>
            <Badge bg="light" text="dark" className="fs-5 px-3 py-2">
              {submissions.length} bài nộp
            </Badge>
          </Card.Header>
          
          <Card.Body className="p-0">
            {error && (
              <Alert variant="danger" className="m-4 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                <strong>❌ Lỗi:</strong> {error}
              </Alert>
            )}

            {!error && submissions.length === 0 ? (
              <div className="text-center py-5">
                <div 
                  className="d-inline-block p-4 rounded-circle mb-4"
                  style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}
                >
                  <FiFileText size={64} className="text-primary" />
                </div>
                <h4 className="text-muted mb-3">📭 Chưa có bài nộp nào</h4>
                <p className="text-muted fs-5">
                  Chưa có học viên nào nộp bài cho bài tập này.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                    <tr>
                      <th className="border-0 py-4 fw-bold">#</th>
                      <th className="border-0 py-4 fw-bold">👤 Tên học viên</th>
                      <th className="border-0 py-4 fw-bold">
                        <FiClock className="me-2 text-info" />
                        ⏰ Thời gian nộp
                      </th>
                      <th className="border-0 py-4 fw-bold">📊 Trạng thái</th>
                      <th className="border-0 py-4 fw-bold">🎯 Điểm số</th>
                      <th className="border-0 py-4 fw-bold text-center">🔧 Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub, index) => (
                      <tr 
                        key={sub._id}
                        style={{ 
                          transition: 'all 0.3s ease',
                          animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                          e.currentTarget.style.transform = 'scale(1.01)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <td className="py-4">
                          <div 
                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                            style={{ width: '35px', height: '35px' }}
                          >
                            {index + 1}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="d-flex align-items-center">
                            <div 
                              className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center me-3"
                              style={{ width: '35px', height: '35px', fontSize: '14px' }}
                            >
                              {(sub.studentId?.profile?.fullName || 'N/A').charAt(0).toUpperCase()}
                            </div>
                            <strong className="fs-5">{sub.studentId?.profile?.fullName || 'N/A'}</strong>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="text-muted">
                            <small>
                              📅 {new Date(sub.submittedAt).toLocaleDateString('vi-VN')}
                              <br />
                              ⏰ {new Date(sub.submittedAt).toLocaleTimeString('vi-VN')}
                            </small>
                          </div>
                        </td>
                        <td className="py-4">
                          {getStatusBadge(sub)}
                        </td>
                        <td className="py-4">
                          {sub.grade?.score != null ? (
                            <Badge 
                              bg={sub.grade.score >= 70 ? 'success' : sub.grade.score >= 50 ? 'warning' : 'danger'}
                              className="fs-5 px-3 py-2"
                              style={{ borderRadius: '15px' }}
                            >
                              {sub.grade.score} điểm
                            </Badge>
                          ) : (
                            <span className="text-muted">Chưa chấm</span>
                          )}
                        </td>
                        <td className="py-4 text-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleGradeClick(sub._id)}
                            className="px-4 py-2 fw-bold"
                            style={{ 
                              borderRadius: '20px',
                              borderWidth: '2px',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'scale(1.1)';
                              e.target.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
                              e.target.style.color = 'white';
                              e.target.style.borderColor = 'transparent';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'scale(1)';
                              e.target.style.background = 'transparent';
                              e.target.style.color = '#0d6efd';
                              e.target.style.borderColor = '#0d6efd';
                            }}
                          >
                            <FiEye className="me-2" />
                            {sub.grade?.score != null ? '👀 Xem lại' : '✏️ Chấm điểm'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
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
      `}</style>
    </div>
  );
}
