import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Spinner, Row, Col, Alert, ProgressBar } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { FiUsers, FiFileText, FiStar, FiPercent, FiBarChart2, FiPieChart, FiTrendingUp, FiActivity } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function AnalyticsDashboard() {
  const { courseId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/instructor/analytics/course/${courseId}`);
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics data.");
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading) {
    return (
      <div 
        className="d-flex justify-content-center align-items-center"
        style={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <div className="text-center">
          <div className="spinner-border text-light mb-3" style={{ width: '4rem', height: '4rem' }}></div>
          <h4 className="text-white">✨ Đang tải dữ liệu phân tích...</h4>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
        <Container className="py-5">
          <Alert variant="danger" className="border-0 shadow-lg animate__animated animate__fadeIn">
            <FiActivity className="me-2" />
            <strong>Oops!</strong> {error}
          </Alert>
        </Container>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
        <Container className="py-5">
          <Alert variant="info" className="border-0 shadow-lg">
            <FiBarChart2 className="me-2" />
            Không có dữ liệu phân tích.
          </Alert>
        </Container>
      </div>
    );
  }

  const gradeChartData = {
    labels: analytics.gradeDistribution.map(d => d.range),
    datasets: [{
      label: 'Số lượng học viên',
      data: analytics.gradeDistribution.map(d => d.count),
      backgroundColor: [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      ],
      borderRadius: 12,
      borderSkipped: false,
    }]
  };

  const StatCard = ({ icon, title, value, variant, gradient, delay = 0 }) => (
    <Card 
      className="h-100 border-0 shadow-lg position-relative overflow-hidden"
      style={{
        background: gradient,
        color: 'white',
        transform: 'translateY(20px)',
        opacity: 0,
        animation: `slideUp 0.6s ease-out ${delay}s forwards`
      }}
    >
      <div 
        className="position-absolute"
        style={{
          top: '-50px',
          right: '-50px',
          width: '100px',
          height: '100px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%'
        }}
      />
      <Card.Body className="d-flex align-items-center position-relative">
        <div className="me-4" style={{ fontSize: '3rem', opacity: 0.9 }}>
          {icon}
        </div>
        <div>
          <h1 className="mb-0 fw-bold display-6">{value}</h1>
          <p className="mb-0 opacity-75 fs-5">{title}</p>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Floating Elements */}
      <div className="position-absolute w-100 h-100" style={{ overflow: 'hidden', zIndex: 0 }}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="position-absolute rounded-circle"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              background: 'rgba(255,255,255,0.1)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 3 + 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <Container fluid className="py-5 position-relative" style={{ zIndex: 1 }}>
        {/* Animated Header */}
        <div className="text-center mb-5">
          <h1 
            className="text-white fw-bold mb-3 display-4"
            style={{
              textShadow: '0 4px 8px rgba(0,0,0,0.3)',
              animation: 'fadeInDown 1s ease-out'
            }}
          >
            <FiTrendingUp className="me-3" />
            📊 Dashboard Phân Tích
          </h1>
          <p className="text-white fs-4 opacity-75">
            ✨ Phân tích cho khóa học: <strong>{analytics.courseTitle}</strong>
          </p>
        </div>

        {/* Animated Stats Cards */}
        <Row className="g-4 mb-5">
          <Col md={3}>
            <StatCard 
              icon={<FiUsers />} 
              title="🎓 Tổng Học Viên" 
              value={analytics.totalStudents} 
              gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              delay={0.1}
            />
          </Col>
          <Col md={3}>
            <StatCard 
              icon={<FiFileText />} 
              title="📝 Tổng Bài Tập" 
              value={analytics.totalAssignments} 
              gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              delay={0.2}
            />
          </Col>
          <Col md={3}>
            <StatCard 
              icon={<FiStar />} 
              title="⭐ Điểm Trung Bình" 
              value={analytics.submissionSummary.averageScore} 
              gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              delay={0.3}
            />
          </Col>
          <Col md={3}>
            <StatCard 
              icon={<FiPercent />} 
              title="📈 Tỷ Lệ Nộp Bài" 
              value={`${analytics.submissionSummary.submissionRate}%`} 
              gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
              delay={0.4}
            />
          </Col>
        </Row>

        {/* Enhanced Charts */}
        <Row className="g-4">
          <Col lg={8}>
            <Card 
              className="h-100 border-0 shadow-lg"
              style={{
                borderRadius: '20px',
                overflow: 'hidden',
                animation: 'slideInLeft 0.8s ease-out'
              }}
            >
              <Card.Header 
                className="text-white py-4"
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                <h4 className="mb-0 fw-bold">
                  <FiBarChart2 className="me-3" />
                  📊 Phân Bố Điểm Số Siêu Đẹp
                </h4>
              </Card.Header>
              <Card.Body className="p-4">
                <Bar 
                  data={gradeChartData} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#667eea',
                        borderWidth: 2
                      }
                    },
                    scales: {
                      y: { 
                        beginAtZero: true, 
                        grid: { color: 'rgba(0,0,0,0.1)' },
                        ticks: { color: '#666' }
                      },
                      x: { 
                        grid: { display: false },
                        ticks: { color: '#666' }
                      }
                    },
                    animation: {
                      duration: 2000,
                      easing: 'easeOutBounce'
                    }
                  }}
                />
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4}>
            <Card 
              className="h-100 border-0 shadow-lg"
              style={{
                borderRadius: '20px',
                overflow: 'hidden',
                animation: 'slideInRight 0.8s ease-out'
              }}
            >
              <Card.Header 
                className="text-white py-4"
                style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}
              >
                <h4 className="mb-0 fw-bold">
                  <FiPieChart className="me-3" />
                  🎯 Tổng Quan Điểm Danh
                </h4>
              </Card.Header>
              <Card.Body className="p-4">
                <Pie 
                  data={attendanceChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { 
                        position: 'bottom',
                        labels: {
                          padding: 20,
                          usePointStyle: true,
                          font: { size: 12 }
                        }
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff'
                      }
                    },
                    animation: {
                      duration: 2000,
                      easing: 'easeOutElastic'
                    }
                  }}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        @keyframes slideUp {
          to {
            transform: translateY(0);
            opacity: 1;
          }
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
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
