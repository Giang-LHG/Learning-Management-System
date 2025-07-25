import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Table, Button, Spinner, Badge, Alert } from 'react-bootstrap';
import { FiEye, FiMessageSquare, FiClock, FiUser, FiZap, FiAlertCircle } from 'react-icons/fi';

export default function InstructorAppealList() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
const INSTRUCTOR_ID = user._id;
  const [appeals, setAppeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
const token = localStorage.getItem('token');
  const fetchAppeals = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/instructor/appeals?instructorId=${INSTRUCTOR_ID}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
      if (res.data.success) {
      
        setAppeals(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching appeals:", error);
      setError("Error: Unable to load appeal data.");
    } finally {
      setIsLoading(false);
    }
  }, [INSTRUCTOR_ID]);

  useEffect(() => {
    fetchAppeals();
  }, [fetchAppeals]);
console.log("Appeals:", appeals);
  const handleReviewClick = (submissionId, appealId) => {
    navigate(`/instructor/appeal/review/${submissionId}/${appealId}`);
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
      }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" style={{ width: '4rem', height: '4rem' }}></div>
          <h4 className="text-white">Đang tải danh sách khiếu nại...</h4>
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
      {/* Animated Background */}
      <div className="position-absolute w-100 h-100" style={{ overflow: 'hidden', zIndex: 0 }}>
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="position-absolute"
            style={{
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
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
        {/* Animated Header */}
        <div 
          className="text-center mb-5"
          style={{ animation: 'bounceInDown 1s ease-out' }}
        >
          <div 
            className="d-inline-block p-4 rounded-circle mb-4"
            style={{ 
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <FiZap size={48} className="text-white" />
          </div>
          <h1 className="text-white fw-bold mb-3 display-4">
             Grade Appeals
          </h1>
          <p className="text-white-50 fs-4">
            <FiAlertCircle className="me-2" />
             Review and respond to student appeals
          </p>
          <Badge 
            bg="warning" 
            text="dark" 
            className="fs-5 px-4 py-2"
            style={{ borderRadius: '25px' }}
          >
            <FiClock className="me-2" />
            {appeals.length} pending appeals
          </Badge>
        </div>

        {/* Appeals Card */}
        <Card 
          className="border-0 shadow-lg" 
          style={{ 
            borderRadius: '25px', 
            overflow: 'hidden',
            animation: 'slideInUp 0.8s ease-out'
          }}
        >
          <Card.Header 
            className="text-dark d-flex justify-content-between align-items-center py-4"
            style={{ background: 'linear-gradient(135deg, #ffd54f 0%, #ffca28 100%)' }}
          >
            <h4 className="mb-0 fw-bold">
              <FiMessageSquare className="me-3" />
               Open Appeals List
            </h4>
            <div className="d-flex align-items-center">
              <div 
                className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center me-2"
                style={{ width: '30px', height: '30px', fontSize: '12px' }}
              >
                {appeals.length}
              </div>
              <span className="fw-bold">pending</span>
            </div>
          </Card.Header>
          
          <Card.Body className="p-0">
            {error && (
              <Alert 
                variant="danger" 
                className="m-4 border-0 shadow-sm"
                style={{ 
                  borderRadius: '15px',
                  animation: 'shake 0.5s ease-in-out'
                }}
              >
                <strong> Error:</strong> {error}
              </Alert>
            )}

            {!error && appeals.length === 0 ? (
              <div className="text-center py-5">
                <div 
                  className="d-inline-block p-4 rounded-circle mb-4"
                  style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}
                >
                  <FiMessageSquare size={64} className="text-primary" />
                </div>
                <h4 className="text-muted mb-3"> No appeals</h4>
                <p className="text-muted fs-5">
                  There are currently no appeals to review.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                    <tr>
                      <th className="border-0 py-4 fw-bold">
                        <FiUser className="me-2 text-primary" />
                         Student Name
                      </th>
                      <th className="border-0 py-4 fw-bold"> Assignment</th>
                      <th className="border-0 py-4 fw-bold">
                        <FiClock className="me-2 text-info" />
                        Submit Time
                      </th>
                      <th className="border-0 py-4 fw-bold"> Original Score</th>
                      <th className="border-0 py-4 fw-bold text-center"> Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appeals.map((appeal, index) => (
                      <tr 
                        key={`${appeal.submissionId}-${appeal.appealId}`}
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
                          <div className="d-flex align-items-center">
                            <div 
                              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                              style={{ width: '40px', height: '40px', fontSize: '16px' }}
                            >
                              {appeal.studentName.charAt(0).toUpperCase()}
                            </div>
                            <strong className="fs-5">{appeal.studentName}</strong>
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge 
                            bg="info" 
                            className="fs-6 px-3 py-2"
                            style={{ borderRadius: '15px' }}
                          >
                             {appeal.assignmentTitle}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <div className="text-muted">
                            <small>
                               {new Date(appeal.appealCreatedAt).toLocaleDateString('vi-VN')}
                              <br />
                               {new Date(appeal.appealCreatedAt).toLocaleTimeString('vi-VN')}
                            </small>
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge 
                            bg={appeal.originalScore >= 70 ? 'success' : appeal.originalScore >= 50 ? 'warning' : 'danger'}
                            className="fs-5 px-3 py-2"
                            style={{ borderRadius: '15px' }}
                          >
                            {appeal.originalScore} points
                          </Badge>
                        </td>
                        <td className="py-4 text-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleReviewClick(appeal.submissionId, appeal.appealId)}
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
                             Review
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
          
          {appeals.length > 0 && (
            <Card.Footer 
              className="text-center py-4"
              style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}
            >
              <div className="d-flex justify-content-center align-items-center">
                <FiClock className="me-2 text-warning" />
                <span className="text-muted fs-5">
                  Appeals should be reviewed and responded to promptly.
                </span>
              </div>
            </Card.Footer>
          )}
        </Card>
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
