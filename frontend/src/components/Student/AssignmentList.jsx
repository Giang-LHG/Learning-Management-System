import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, 
  FiChevronDown, 
  FiArrowLeft, 
  FiCalendar, 
  FiBook, 
  FiUser,
  FiClock,
  FiFileText,
  FiPlay
} from 'react-icons/fi';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Form,
  InputGroup,
  Badge
} from 'react-bootstrap';

const sortOptions = [
  { label: 'Due Date ↑', value: 'dueDate:asc' },
  { label: 'Due Date ↓', value: 'dueDate:desc' },
  { label: 'Title A→Z', value: 'title:asc' },
  { label: 'Title Z→A', value: 'title:desc' },
  { label: 'Created ↑', value: 'createdAt:asc' },
  { label: 'Created ↓', value: 'createdAt:desc' }
];

export default function AssignmentList() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  // State quản lý
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [order, setOrder] = useState('asc');
  const [isLoading, setIsLoading] = useState(true);
const [studentId, setStudentId] = useState('');
useEffect(() => {
  try {
    const stored = localStorage.getItem('user');
    if (stored) {
      const u = JSON.parse(stored);
      if (u && u._id) setStudentId(u._id);
    }
  } catch (e) {
    console.warn('Error parsing user from localStorage:', e);
  }
}, []);
  // Fetch Course detail
  const fetchCourseDetail = useCallback(async () => {
    try {
      const resp = await axios.get(`/api/student/courses/${courseId}`);
      if (resp.data.success) {
        setCourse(resp.data.data);
      }
    } catch (err) {
      console.error('Error fetching course detail:', err);
    }
  }, [courseId]);

  // Fetch Assignments cho course
  const fetchAssignments = useCallback(async () => {
   if(!studentId) return;
    try {
      setIsLoading(true);
      console.log(studentId);
      const resp = await axios.get(`/api/student/assignments/course/${courseId}/student/${studentId}`);
      if (resp.data.success) {
        setAssignments(resp.data.data);
        setFiltered(resp.data.data);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, studentId]);

  // Khi component mount
  useEffect(() => {
    fetchCourseDetail();
    fetchAssignments();
  }, [fetchCourseDetail, fetchAssignments]);

  // Lọc + Sắp xếp Assignments
  useEffect(() => {
    let temp = [...assignments];

    if (searchQuery.trim()) {
      const regex = new RegExp(searchQuery, 'i');
      temp = temp.filter((a) => regex.test(a.title));
    }

    temp.sort((a, b) => {
      let fieldA = a[sortBy];
      let fieldB = b[sortBy];
      if (sortBy === 'dueDate' || sortBy === 'createdAt') {
        fieldA = new Date(fieldA).getTime();
        fieldB = new Date(fieldB).getTime();
      } else {
        fieldA = fieldA ? fieldA.toString().toLowerCase() : '';
        fieldB = fieldB ? fieldB.toString().toLowerCase() : '';
      }
      if (fieldA < fieldB) return order === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return order === 'asc' ? 1 : -1;
      return 0;
    });

    setFiltered(temp);
  }, [assignments, searchQuery, sortBy, order]);

  const handleSortChange = (value) => {
    const [field, ord] = value.split(':');
    setSortBy(field);
    setOrder(ord);
  };

  const goToQuizList = (assignmentId) => {
    navigate(`/student/quiz/${assignmentId}`);
  };

  // Helper function to get assignment status
  const getAssignmentStatus = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffInDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) return { status: 'overdue', variant: 'danger', text: 'Overdue' };
    if (diffInDays === 0) return { status: 'today', variant: 'warning', text: 'Due Today' };
    if (diffInDays <= 3) return { status: 'urgent', variant: 'warning', text: `${diffInDays} days left` };
    return { status: 'normal', variant: 'success', text: `${diffInDays} days left` };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 50%, #ffffff 100%)',
      paddingTop: '2rem',
      paddingBottom: '2rem'
    }}>
      <Container>
        {/* Back Button */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="primary"
            className="mb-4 shadow-sm"
            onClick={() => navigate(-1)}
            style={{
              borderRadius: '12px',
              padding: '10px 20px',
              border: 'none',
              fontWeight: '500',
              background: 'linear-gradient(45deg, #1976d2, #2196f3)'
            }}
          >
            <FiArrowLeft className="me-2" /> Back to Courses
          </Button>
        </motion.div>

        {/* Course Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card 
            className="mb-4 shadow-lg border-0"
            style={{
              borderRadius: '20px',
              background: 'white',
              border: '1px solid #e3f2fd'
            }}
          >
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <div 
                  className="me-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(45deg, #1976d2, #2196f3)',
                    borderRadius: '16px',
                    color: 'white'
                  }}
                >
                  <FiBook size={24} />
                </div>
                <div>
                  <h2 className="mb-1" style={{ color: '#1565c0', fontWeight: '700' }}>
                    {course?.title || 'Loading...'}
                  </h2>
                  {course?.instructorName && (
                    <div className="d-flex align-items-center" style={{ color: '#616161' }}>
                      <FiUser className="me-1" size={14} />
                      <span style={{ fontSize: '0.95rem' }}>
                        Instructor: {course.instructorName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Badge 
                style={{ 
                  borderRadius: '20px',
                  padding: '6px 12px',
                  fontSize: '0.85rem',
                  background: 'linear-gradient(45deg, #1976d2, #2196f3)',
                  color: 'white',
                  border: 'none'
                }}
              >
                {filtered.length} Assignment{filtered.length !== 1 ? 's' : ''}
              </Badge>
            </Card.Body>
          </Card>
        </motion.div>

        {/* Search and Sort Controls */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card 
            className="mb-4 shadow-sm border-0"
            style={{
              borderRadius: '16px',
              background: 'white',
              border: '1px solid #e3f2fd'
            }}
          >
            <Card.Body className="p-3">
              <Row className="align-items-center">
                <Col md={8}>
                  <InputGroup>
                    <InputGroup.Text 
                      style={{ 
                        background: '#f8f9fa',
                        border: '1px solid #e0e0e0',
                        borderRight: 'none',
                        color: '#1976d2'
                      }}
                    >
                      <FiSearch />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Search assignments..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{
                        border: '1px solid #e0e0e0',
                        borderLeft: 'none',
                        fontSize: '0.95rem'
                      }}
                    />
                  </InputGroup>
                </Col>
                <Col md={4}>
                  <InputGroup>
                    <Form.Select
                      value={`${sortBy}:${order}`}
                      onChange={e => handleSortChange(e.target.value)}
                      style={{
                        border: '1px solid #e0e0e0',
                        borderRight: 'none',
                        fontSize: '0.95rem'
                      }}
                    >
                      {sortOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Form.Select>
                    <InputGroup.Text 
                      style={{ 
                        background: '#f8f9fa',
                        border: '1px solid #e0e0e0',
                        borderLeft: 'none',
                        color: '#1976d2'
                      }}
                    >
                      <FiChevronDown />
                    </InputGroup.Text>
                  </InputGroup>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </motion.div>

        {/* List */}
        {isLoading ? (
          <div className="text-center py-5">
            <Spinner 
              animation="border" 
              style={{ color: '#1976d2', width: '3rem', height: '3rem' }}
            />
            <p className="mt-3" style={{ color: '#1976d2' }}>Loading assignments...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5">
            <Card 
              className="shadow-sm border-0 mx-auto"
              style={{
                maxWidth: '400px',
                borderRadius: '16px',
                background: 'white',
                border: '1px solid #e3f2fd'
              }}
            >
              <Card.Body className="p-4">
                <FiFileText size={48} style={{ color: '#90caf9' }} className="mb-3" />
                <h5 style={{ color: '#1976d2' }}>No assignments found</h5>
                <p className="text-muted small mb-0">
                  {searchQuery ? 'Try adjusting your search criteria' : 'No assignments available for this course'}
                </p>
              </Card.Body>
            </Card>
          </div>
        ) : (
          <Row xs={1} sm={2} md={3} lg={4} className="g-3">
            {filtered.map(a => (
              <Col key={a._id}>
                <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Card 
                    className="h-100 shadow-sm"
                    style={{
                      background: 'white',
                      border: '1px solid #e3f2fd',
                      borderRadius: '16px'
                    }}
                  >
                    <Card.Body className="d-flex flex-column p-4">
                      <Card.Title style={{ color: '#1565c0', fontWeight: '600' }}>
                        {a.title}
                      </Card.Title>
                      {a.description && (
                        <Card.Text className="small text-muted mb-3">
                          {a.description.length > 60
                            ? `${a.description.slice(0, 60)}…`
                            : a.description}
                        </Card.Text>
                      )}
                      <Card.Text className="mt-auto mb-3">
                        <FiCalendar className="me-2" size={14} />
                        <small style={{ color: '#616161' }}>
                          Due: {new Date(a.dueDate).toLocaleDateString()}
                        </small>
                      </Card.Text>
                      <Button
                        onClick={() => goToQuizList(a._id)}
                        style={{
                          background: 'linear-gradient(45deg, #1976d2, #2196f3)',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '10px 16px',
                          fontWeight: '500'
                        }}
                        size="sm"
                      >
                        <FiPlay className="me-2" size={14} />
                        View Quiz
                      </Button>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}