import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Table, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { FiArrowLeft, FiUsers, FiMail, FiCalendar, FiUserCheck, FiStar } from 'react-icons/fi';

export default function CourseParticipantsList() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [courseInfo, setCourseInfo] = useState({ title: '', term: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const participantsRes = await axios.get(`/api/instructor/courses/${courseId}/participants`);
      if (participantsRes.data.success) {
        setParticipants(participantsRes.data.data);
      }

      const courseRes = await axios.get(`/api/student/courses/${courseId}`);
      if (courseRes.data.success) {
        const courseData = courseRes.data.data;
        const currentTerm = courseData.term && courseData.term.length > 0
          ? courseData.term[courseData.term.length - 1]
          : 'N/A';
        setCourseInfo({ title: courseData.title, term: currentTerm });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Không thể tải dữ liệu học viên.");
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
      }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" style={{ width: '4rem', height: '4rem' }}></div>
          <h4 className="text-white">Đang tải danh sách học viên...</h4>
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
      {/* Floating Background Elements */}
      <div className="position-absolute w-100 h-100" style={{ overflow: 'hidden', zIndex: 0 }}>
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="position-absolute rounded-circle"
            style={{
              width: `${Math.random() * 80 + 40}px`,
              height: `${Math.random() * 80 + 40}px`,
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
        {/* Animated Header */}
        <div className="d-flex align-items-center mb-5">
          <Button
            variant="outline-light"
            onClick={() => navigate(-1)}
            className="me-4 px-4 py-2 border-2"
            style={{ 
              borderRadius: '25px', 
              backdropFilter: 'blur(10px)', 
              transition: 'all 0.3s ease',
              animation: 'slideInLeft 0.6s ease-out'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.background = 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.background = 'transparent';
            }}
          >
            <FiArrowLeft className="me-2" />
            🔙 Quay lại khóa học
          </Button>
          <div style={{ animation: 'fadeInRight 0.8s ease-out' }}>
            <h1 className="text-white fw-bold mb-1 display-5">
              <FiUsers className="me-3" />
              👥 Danh Sách Học Viên
            </h1>
            <p className="text-white-50 mb-0 fs-5">
              📚 {courseInfo.title} • 📅 Học kỳ: {courseInfo.term}
            </p>
          </div>
        </div>

        {/* Participants Card */}
        <Card 
          className="border-0 shadow-lg" 
          style={{ 
            borderRadius: '20px', 
            overflow: 'hidden',
            animation: 'slideInUp 0.8s ease-out'
          }}
        >
          <Card.Header 
            className="text-white d-flex justify-content-between align-items-center py-4"
            style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}
          >
            <h4 className="mb-0 fw-bold">
              <FiUserCheck className="me-3" />
              🎓 Học Viên Đăng Ký
            </h4>
            <div className="d-flex align-items-center">
              <FiStar className="me-2" />
              <Badge bg="light" text="dark" className="fs-5 px-3 py-2">
                {participants.length} học viên
              </Badge>
            </div>
          </Card.Header>
          
          <Card.Body className="p-0">
            {error && (
              <Alert variant="danger" className="m-4 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                <strong>❌ Lỗi:</strong> {error}
              </Alert>
            )}

            {!error && participants.length === 0 ? (
              <div className="text-center py-5">
                <div 
                  className="d-inline-block p-4 rounded-circle mb-4"
                  style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}
                >
                  <FiUsers size={64} className="text-primary" />
                </div>
                <h4 className="text-muted mb-3">🤷‍♂️ Chưa có học viên đăng ký</h4>
                <p className="text-muted fs-5">
                  Chưa có học viên nào đăng ký khóa học này trong học kỳ hiện tại.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                    <tr>
                      <th className="border-0 py-4 fw-bold">#</th>
                      <th className="border-0 py-4 fw-bold">
                        <FiUsers className="me-2 text-primary" />
                        👤 Họ và tên
                      </th>
                      <th className="border-0 py-4 fw-bold">
                        <FiMail className="me-2 text-info" />
                        📧 Email
                      </th>
                      <th className="border-0 py-4 fw-bold">
                        <FiCalendar className="me-2 text-success" />
                        📅 Ngày đăng ký
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((p, index) => (
                      <tr 
                        key={p.email}
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
                            style={{ width: '40px', height: '40px' }}
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
                              {p.fullName.charAt(0).toUpperCase()}
                            </div>
                            <strong className="fs-5">{p.fullName}</strong>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="text-muted fs-6">📧 {p.email}</span>
                        </td>
                        <td className="py-4">
                          <Badge 
                            bg="success" 
                            className="fs-6 px-3 py-2"
                            style={{ borderRadius: '15px' }}
                          >
                            📅 {new Date(p.enrolledAt).toLocaleDateString('vi-VN')}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
          
          {participants.length > 0 && (
            <Card.Footer 
              className="text-center py-4"
              style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}
            >
              <div className="d-flex justify-content-center align-items-center">
                <FiStar className="me-2 text-warning" />
                <span className="text-muted fs-5">
                  🎉 Tổng số học viên trong học kỳ này: <strong className="text-primary">{participants.length}</strong>
                </span>
              </div>
            </Card.Footer>
          )}
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
