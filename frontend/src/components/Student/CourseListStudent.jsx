import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiChevronDown, FiArrowLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Form,
  InputGroup,
  Nav,
  Tab,
  Pagination
} from 'react-bootstrap';

export default function CourseList() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const subjectId = params.get('subjectId');

  const DEFAULT_STUDENT_ID = '60a000000000000000000002';
  const [studentId] = useState(
    () => JSON.parse(localStorage.getItem('user') || `{"_id":"${DEFAULT_STUDENT_ID}"}`)._id
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [order, setOrder] = useState('asc');
  const [allCourses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('enrolled');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(8); // 8 courses per page

  // Function to sort courses locally
  const sortCourses = (coursesToSort, sortField, sortOrder) => {
    return [...coursesToSort].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle different data types
      if (sortField === 'startDate') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      } else if (sortField === 'credits') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      } else if (sortField === 'title') {
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }

      // Compare values
      let comparison = 0;
      if (aValue > bValue) {
        comparison = 1;
      } else if (aValue < bValue) {
        comparison = -1;
      }

      return sortOrder === 'desc' ? comparison * -1 : comparison;
    });
  };

  // Function to filter courses based on search query
  const filterCourses = (coursesToFilter, query) => {
    if (!query.trim()) return coursesToFilter;
    
    const searchTerm = query.toLowerCase();
    return coursesToFilter.filter(course => 
      course.title?.toLowerCase().includes(searchTerm) ||
      course.description?.toLowerCase().includes(searchTerm)
    );
  };

  // Process courses (filter + sort + separate enrolled/other)
  const processedCourses = useMemo(() => {
    let filtered = filterCourses(allCourses, searchQuery);
    let sorted = sortCourses(filtered, sortBy, order);
    
    const enrolled = sorted.filter(course => course.enrolled === true);
    const other = sorted.filter(course => course.enrolled === false);
    
    return { enrolled, other };
  }, [allCourses, searchQuery, sortBy, order]);

  // Get current courses for active tab with pagination
  const getCurrentCourses = () => {
    const courses = activeTab === 'enrolled' ? processedCourses.enrolled : processedCourses.other;
    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    return courses.slice(indexOfFirstCourse, indexOfLastCourse);
  };

  const getTotalPages = () => {
    const courses = activeTab === 'enrolled' ? processedCourses.enrolled : processedCourses.other;
    return Math.ceil(courses.length / coursesPerPage);
  };

  // Load courses data from single endpoint
  useEffect(() => {
    if (!subjectId) return;
    
    setIsLoading(true);
    const cancel = axios.CancelToken.source();
    
    // Single API call to get all courses with enrollment status
    axios.get(
      `/api/student/courses/subject/${subjectId}/student/${studentId}`,
      { cancelToken: cancel.token }
    )
    .then(response => {
      if (response.data.success) {
        // Backend already provides courses with enrolled field (true/false)
        setCourses(response.data.data || []);
      } else {
        setCourses([]);
      }
    })
    .catch(err => {
      if (!axios.isCancel(err)) {
        console.error('Error loading courses:', err);
        setCourses([]);
      }
    })
    .finally(() => {
      setIsLoading(false);
    });

    return () => cancel.cancel();
  }, [subjectId, studentId]);

  // Reset pagination when tab changes or search/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, sortBy, order]);

  const handleEnroll = async (courseId) => {
    try {
      const { data } = await axios.post(
        '/api/student/enrollments/enroll',
        { studentId, courseId }
      );
      
       if (data.success) {
      setCourses(prev =>
        prev.map(c => c._id === id ? { ...c, enrolled: true } : c)
      );
    } else {
      alert(data.message || 'Enrollment failed.');
    }
  } catch (err) {
    console.error('Enroll error:', err);
    if (err.response?.data?.message) {
      alert(err.response.data.message);
    } else {
      alert('Error enrolling');
    }
  }
  };

  const onSortChange = (value) => {
    const [field, ord] = value.split(':');
    setSortBy(field);
    setOrder(ord);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const currentCourses = getCurrentCourses();
  const totalPages = getTotalPages();
  const currentTabCourses = activeTab === 'enrolled' ? processedCourses.enrolled : processedCourses.other;

  return (
    <Container className="py-4">
      <Button variant="link" onClick={() => navigate('/student/subjects')} className="mb-4 p-0">
        <FiArrowLeft /> Back to Subjects
      </Button>

      {/* Search + Sort */}
      <Row className="align-items-center mb-3">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text><FiSearch /></InputGroup.Text>
            <Form.Control
              placeholder="Search courses..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={4}>
          <InputGroup>
            <Form.Select value={`${sortBy}:${order}`} onChange={e => onSortChange(e.target.value)}>
              <option value="title:asc">Title A→Z</option>
              <option value="title:desc">Title Z→A</option>
              <option value="startDate:asc">Start Date ↑</option>
              <option value="startDate:desc">Start Date ↓</option>
              <option value="credits:asc">Credits ↑</option>
              <option value="credits:desc">Credits ↓</option>
            </Form.Select>
            <InputGroup.Text><FiChevronDown /></InputGroup.Text>
          </InputGroup>
        </Col>
      </Row>

      {/* Tabs for Enrolled vs Other Courses */}
      <Tab.Container activeKey={activeTab} onSelect={handleTabChange}>
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="enrolled">
              Enrolled Courses ({processedCourses.enrolled.length})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="other">
              Other Courses ({processedCourses.other.length})
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="enrolled">
            <h5>My Enrolled Courses</h5>
          </Tab.Pane>
          <Tab.Pane eventKey="other">
            <h5>Available Courses</h5>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {/* Course List */}
      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : allCourses.length === 0 ? (
        <p>No courses available for this subject.</p>
      ) : currentTabCourses.length === 0 ? (
        <p>No courses found in this category.</p>
      ) : (
        <>
          <Row xs={1} sm={2} md={3} lg={4} className="g-3 mb-4">
            {currentCourses.map(c => (
              <Col key={c._id}>
                <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Card border={c.enrolled ? 'success' : 'secondary'} className="h-100">
                    <Card.Body className="d-flex flex-column">
                      <Card.Title>{c.title}</Card.Title>
                      <Card.Text className="text-muted mb-2">
                        Credits: {c.credits || 'N/A'}
                      </Card.Text>
                      <Card.Text className="text-muted mb-2">
                        Description: {c.description || 'N/A'}
                      </Card.Text>
                      {c.startDate && (
                        <Card.Text className="text-muted small">
                          Start: {new Date(c.startDate).toLocaleDateString()}
                        </Card.Text>
                      )}
                      <div className="mt-auto d-flex justify-content-between">
                        {c.enrolled ? (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => navigate(`/student/course/${c._id}`)}
                          >
                            Detail
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleEnroll(c._id)}
                          >
                            Enroll
                          </Button>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center">
              <Pagination>
                <Pagination.First 
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                
                {/* Page numbers */}
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  const isNearCurrent = Math.abs(pageNumber - currentPage) <= 2;
                  const isFirstOrLast = pageNumber === 1 || pageNumber === totalPages;
                  
                  if (isNearCurrent || isFirstOrLast) {
                    return (
                      <Pagination.Item
                        key={pageNumber}
                        active={pageNumber === currentPage}
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </Pagination.Item>
                    );
                  } else if (pageNumber === currentPage - 3 || pageNumber === currentPage + 3) {
                    return <Pagination.Ellipsis key={pageNumber} />;
                  }
                  return null;
                })}
                
                <Pagination.Next 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last 
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}

          {/* Pagination Info */}
          <div className="text-center text-muted mt-2">
            <small>
              Showing {currentCourses.length} of {currentTabCourses.length} courses
              {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
            </small>
          </div>
        </>
      )}
    </Container>
  );
}