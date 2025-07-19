import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Alert, 
  Button, 
  Spinner, 
  Badge,
  ListGroup,
  Dropdown
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const ArrowLeft = ({ size = 20, className = "", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} style={style}>
    <path d="m12 19-7-7 7-7"/>
    <path d="M19 12H5"/>
  </svg>
);

const User = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const LogOut = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16,17 21,12 16,7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const BookOpen = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const TrendingUp = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/>
    <polyline points="16,7 22,7 22,13"/>
  </svg>
);

const Calendar = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const Award = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="12" cy="8" r="7"/>
    <polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"/>
  </svg>
);

const BarChart3 = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M3 3v18h18"/>
    <path d="M18 17V9"/>
    <path d="M13 17V5"/>
    <path d="M8 17v-3"/>
  </svg>
);

const ParentStatsDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const token = localStorage.getItem('token'); 

  useEffect(() => {
    fetchParentStats();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const fetchParentStats = async () => {
    try {
      setLoading(true);
  
        const parentId = JSON.parse(localStorage.getItem('user'))._id;
        console.log(parentId);
        const response = await fetch(`/api/parent/student/${parentId}/stats`,{
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }
);
         const data = await response.json();
      setTimeout(() => {
      setStats(data.data || []);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching parent stats:', err);
      setLoading(false);
    }
  };

  const getGradeVariant = (grade) => {
    if (grade >= 90) return 'success';
    if (grade >= 80) return 'primary';
    if (grade >= 70) return 'warning';
    return 'danger';
  };

  const getCompletionVariant = (rate) => {
    const numRate = parseFloat(rate);
    if (numRate >= 9) return 'success';
    if (numRate >= 7) return 'primary';
    if (numRate >= 5) return 'warning';
    return 'danger';
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        {/* Header */}
        <div style={{ backgroundColor: '#0d6efd', color: 'white', padding: '2rem' }}>
          <Container>
            <div className="d-flex align-items-center justify-content-between mb-3">
              
            </div>
            <h1 className="h2 mb-2">Student Progress Overview</h1>
            <p className="text-light">Track your children's academic performance</p>
          </Container>
        </div>
        
        <Container className="mt-5">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
            <Spinner animation="border" variant="primary" />
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        {/* Header */}
        <div style={{ backgroundColor: '#0d6efd', color: 'white', padding: '2rem' }}>
          <Container>
            <div className="d-flex align-items-center justify-content-between mb-3">
              
            </div>
            <h1 className="h2 mb-2">Student Progress Overview</h1>
            <p className="text-light">Track your children's academic performance</p>
          </Container>
        </div>
        
        <Container className="mt-4">
          <Alert variant="danger">
            <Alert.Heading>Error Loading Statistics</Alert.Heading>
            <p>{error}</p>
            <Button variant="primary" onClick={fetchParentStats}>
              Retry
            </Button>
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#0d6efd', color: 'white', padding: '2rem' }}>
        <Container>
          
          <h1 className="h2 mb-2">Student Progress Overview</h1>
          <p className="text-light">Track your children's academic performance</p>
          <div className="d-flex align-items-center mt-3">
            <User size={16} className="me-2" />
            <small>{stats.length} Student{stats.length !== 1 ? 's' : ''}</small>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="mt-4">
        {stats.length === 0 ? (
          <div className="text-center py-5">
            <BookOpen size={64} className="text-muted mb-3" />
            <h3 className="text-muted mb-2">No Students Found</h3>
            <p className="text-muted">No student data available for this parent account.</p>
          </div>
        ) : (
          <div>
            {stats.map((student) => (
              <Card key={student.studentId} className="mb-4 shadow-sm">
                {/* Student Header */}
                <Card.Header style={{ backgroundColor: '#e7f1ff' }}>
                  <Row className="align-items-center">
                    <Col>
                      <div className="d-flex align-items-center">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-3"
                          style={{ 
                            width: '40px', 
                            height: '40px', 
                            backgroundColor: '#0d6efd' 
                          }}
                        >
                          {student.fullName?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <h5 className="mb-1">{student.fullName}</h5>
                          <small className="text-muted">Student ID: {student.studentId.slice(-6)}</small>
                        </div>
                      </div>
                    </Col>
                    <Col xs="auto" className="text-end">
                      <div className="h2 text-primary mb-0">{student.totalCourses}</div>
                      <small className="text-muted">Total Courses</small>
                    </Col>
                  </Row>
                </Card.Header>

                {/* Student Stats */}
                <Card.Body>
                  <Row className="mb-4">
                    {/* Average Grade */}
                    <Col md={4} className="mb-3">
                      <Card className="h-100" style={{ backgroundColor: '#f8f9fa' }}>
                        <Card.Body>
                          <div className="d-flex align-items-center mb-2">
                            <TrendingUp size={20} className="text-primary me-2" />
                            <span className="fw-medium">Average Grade</span>
                          </div>
                          <Badge 
                            bg={student.avgGrade ? getGradeVariant(student.avgGrade) : 'secondary'} 
                            className="fs-4"
                          >
                            {student.avgGrade ? `${student.avgGrade.toFixed(1)}/10` : 'N/A'}
                          </Badge>
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* Completion Rate */}
                    <Col md={4} className="mb-3">
                      <Card className="h-100" style={{ backgroundColor: '#f8f9fa' }}>
                        <Card.Body>
                          <div className="d-flex align-items-center mb-2">
                            <BarChart3 size={20} className="text-primary me-2" />
                            <span className="fw-medium">Completion Rate</span>
                          </div>
                          <Badge 
                            bg={student.completionRate !== 'N/A' ? getCompletionVariant(student.completionRate) : 'secondary'} 
                            className="fs-4"
                          >
                            {student.completionRate}
                          </Badge>
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* Terms Count */}
                    <Col md={4} className="mb-3">
                      <Card className="h-100" style={{ backgroundColor: '#f8f9fa' }}>
                        <Card.Body>
                          <div className="d-flex align-items-center mb-2">
                            <Calendar size={20} className="text-primary me-2" />
                            <span className="fw-medium">Active Terms</span>
                          </div>
                          <div className="h2 mb-0">
                            {Object.keys(student.byTerm).length}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {/* Term Breakdown */}
                  {Object.keys(student.byTerm).length > 0 && (
                    <div>
                      <h5 className="d-flex align-items-center mb-3">
                        <Award size={20} className="me-2" />
                        Performance by Term
                      </h5>
                      <Row>
                        {Object.entries(student.byTerm).map(([term, data]) => (
                          <Col key={term} lg={4} md={6} className="mb-3">
                            <Card className="h-100 border">
                              <Card.Header>
                                <Card.Title className="h6 mb-0">{term}</Card.Title>
                              </Card.Header>
                              <Card.Body>
                                <ListGroup variant="flush">
                                  <ListGroup.Item className="d-flex justify-content-between px-0">
                                    <span>Courses:</span>
                                    <Badge bg="info">{data.courses}</Badge>
                                  </ListGroup.Item>
                                  <ListGroup.Item className="d-flex justify-content-between px-0">
                                    <span>Submissions:</span>
                                    <Badge bg="info">{data.subs}</Badge>
                                  </ListGroup.Item>
                                  <ListGroup.Item className="d-flex justify-content-between px-0">
                                    <span>Avg Grade:</span>
                                    <Badge 
                                      bg={data.avgGrade ? getGradeVariant(parseFloat(data.avgGrade)) : 'secondary'}
                                    >
                                      {data.avgGrade ? `${data.avgGrade}/10` : 'N/A'}
                                    </Badge>
                                  </ListGroup.Item>
                                </ListGroup>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
};

export default ParentStatsDashboard;