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


  const [studentId] = useState(
    () => JSON.parse(localStorage.getItem('user') )._id
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [order, setOrder] = useState('asc');
  
  // Updated state to handle the 3 types of courses
  const [coursesData, setCoursesData] = useState({
    sameTerm: [],
    otherTerms: [],
    noneEnrolled: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('enrolled');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(8);

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
      } else if (sortField === 'term') {
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
      course.description?.toLowerCase().includes(searchTerm) ||
course.term?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  // Process courses (filter + sort + organize by tabs)
  const processedCourses = useMemo(() => {
    // Combine sameTerm and otherTerms for "enrolled" tab
    const allEnrolled = [...coursesData.sameTerm, ...coursesData.otherTerms];
    
    // Filter and sort each category
    const filteredEnrolled = filterCourses(allEnrolled, searchQuery);
    const filteredOther = filterCourses(coursesData.noneEnrolled, searchQuery);
    
    const sortedEnrolled = sortCourses(filteredEnrolled, sortBy, order);
    const sortedOther = sortCourses(filteredOther, sortBy, order);
    
    return {
      enrolled: sortedEnrolled,
      other: sortedOther
    };
  }, [coursesData, searchQuery, sortBy, order]);

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

  // Load courses data from API
  useEffect(() => {
    if (!subjectId) return;
    
    setIsLoading(true);
    const cancel = axios.CancelToken.source();
    
    axios.get(
      `/api/student/courses/subject/${subjectId}/student/${studentId}`,
      { cancelToken: cancel.token }
    )
    .then(response => {
      if (response.data.success) {
        setCoursesData(response.data.data || {
          sameTerm: [],
          otherTerms: [],
          noneEnrolled: []
        });
      } else {
        setCoursesData({
          sameTerm: [],
          otherTerms: [],
          noneEnrolled: []
        });
      }
    })
    .catch(err => {
      if (!axios.isCancel(err)) {
        console.error('Error loading courses:', err);
        setCoursesData({
          sameTerm: [],
          otherTerms: [],
          noneEnrolled: []
        });
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
        // Move course from noneEnrolled to sameTerm (assuming it gets enrolled in current term)
        setCoursesData(prev => {
          const courseToMove = prev.noneEnrolled.find(c => c._id === courseId);
          if (courseToMove) {
            return {
              ...prev,
              sameTerm: [...prev.sameTerm, { ...courseToMove, enrolled: true }],
              noneEnrolled: prev.noneEnrolled.filter(c => c._id !== courseId)
            };
          }
          return prev;
        });
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

  const handleReEnroll = async (courseId) => {
    try {
      const { data } = await axios.post(
        '/api/student/enrollments/enroll',
        { studentId, courseId }
      );
      
      if (data.success) {
        // Move course from otherTerms to sameTerm
        setCoursesData(prev => {
          const courseToMove = prev.otherTerms.find(c => c._id === courseId);
          if (courseToMove) {
            return {
              ...prev,
              sameTerm: [...prev.sameTerm, { ...courseToMove, enrolled: true }],
              otherTerms: prev.otherTerms.filter(c => c._id !== courseId)
            };
          }
          return prev;
        });
      } else {
        alert(data.message || 'Re-enrollment failed.');
      }
    } catch (err) {
      console.error('Re-enroll error:', err);
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert('Error re-enrolling');
      }
    }
  };

  // Helper function to determine course type and get appropriate button
  const getCourseButton = (course) => {
    // Check if course is from sameTerm (current term enrolled)
    const isFromSameTerm = coursesData.sameTerm.find(c => c._id === course._id);
    // Check if course is from otherTerms (previously enrolled)
    const isFromOtherTerms = coursesData.otherTerms.find(c => c._id === course._id);
    
    if (isFromSameTerm) {
      return (
        <Button
          variant="success"
          size="sm"
          onClick={() => navigate(`/student/course/${course._id}`)}
        >
          Detail
        </Button>
      );
    } else if (isFromOtherTerms) {
      return (
         <>
        <Button
          variant="warning"
          size="sm"
          onClick={() => handleReEnroll(course._id)}
        >
          Re-Enroll
        </Button>
           <Button
          variant="success"
          size="sm"
          onClick={() => navigate(`/student/course/${course._id}`)}
        >
          Detail
        </Button> </>
      );
    } else {
      // Course from noneEnrolled
      return (
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleEnroll(course._id)}
        >
          Enroll
        </Button>
      );
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
              <option value="term:asc">Term ↑</option>
              <option value="term:desc">Term ↓</option>
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
              Available Courses ({processedCourses.other.length})
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
      ) : (coursesData.sameTerm.length + coursesData.otherTerms.length + coursesData.noneEnrolled.length) === 0 ? (
        <p>No courses available for this subject.</p>
      ) : currentTabCourses.length === 0 ? (
        <p>No courses found in this category.</p>
      ) : (
        <>
          <Row xs={1} sm={2} md={3} lg={4} className="g-3 mb-4">
            {currentCourses.map(c => {
              // Determine course status for styling
              const isFromSameTerm = coursesData.sameTerm.find(course => course._id === c._id);
              const isFromOtherTerms = coursesData.otherTerms.find(course => course._id === c._id);
              
              let borderVariant = 'secondary';
              let statusBadge = null;
              
              if (isFromSameTerm) {
                borderVariant = 'success';
                statusBadge = <small className="text-success">Current Term</small>;
              } else if (isFromOtherTerms) {
                borderVariant = 'warning';
                statusBadge = <small className="text-warning">Previously Enrolled</small>;
              }

              return (
                <Col key={c._id}>
                  <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                    <Card border={borderVariant} className="h-100">
                      <Card.Body className="d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Card.Title className="mb-1">{c.title}</Card.Title>
                          {statusBadge}
                        </div>
                        
                        {c.term && (
                          <Card.Text className="text-muted mb-2">
                            <strong>Term:</strong> {c.term[c.term.length - 1]}
                          </Card.Text>
                        )}
                        
                        {c.credits && (
                          <Card.Text className="text-muted mb-2">
                            <strong>Credits:</strong> {c.credits}
                          </Card.Text>
                        )}
                        
                        {c.description && (
                          <Card.Text className="text-muted mb-2">
                            <strong>Description:</strong> {c.description}
                          </Card.Text>
                        )}
                        
                        {c.startDate && (
                          <Card.Text className="text-muted small">
                            <strong>Start:</strong> {new Date(c.startDate).toLocaleDateString()}
                          </Card.Text>
                        )}
                        
                        <div className="mt-auto d-flex justify-content-between">
                          {getCourseButton(c)}
                        </div>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              );
            })}
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