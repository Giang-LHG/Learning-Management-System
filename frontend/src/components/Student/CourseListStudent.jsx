import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FiSearch, 
  FiChevronDown, 
  FiArrowLeft, 
  FiChevronLeft, 
  FiChevronRight,
  FiBook,
  FiList,
  FiEye,
  FiPlus
} from 'react-icons/fi';
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
  Pagination,
  Badge,
  Collapse,
  ListGroup,
  ButtonGroup
} from 'react-bootstrap';

export default function CourseList() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const subjectId = params.get('subjectId');

  const [studentId] = useState(
    () => JSON.parse(localStorage.getItem('user'))._id
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [order, setOrder] = useState('asc');
  
  const [coursesData, setCoursesData] = useState({
    sameTerm: [],
    otherTerms: [],
    noneEnrolled: []
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const [subjects, setSubjects] = useState([]);
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [expandedCourses, setExpandedCourses] = useState(new Set());
  const [coursesWithModules, setCoursesWithModules] = useState({});
  
  // Separate pagination states for each list
  const [visibleCounts, setVisibleCounts] = useState({
    enrolled: 8,
    preEnrolled: 8,
    available: 8
  });

  const coursesPerPage = 8;

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const response = await axios.get(`/api/student/subjects/by-student/${studentId}`);
        if (response.data.success) {
          setSubjects(response.data.data || []);
          const currentIndex = response.data.data.findIndex(s => s._id === subjectId);
          setCurrentSubjectIndex(currentIndex >= 0 ? currentIndex : 0);
        }
      } catch (error) {
        console.error('Error loading subjects:', error);
      }
    };

    if (studentId) {
      loadSubjects();
    }
  }, [studentId, subjectId]);

  const sortCourses = (coursesToSort, sortField, sortOrder) => {
    return [...coursesToSort].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

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

      let comparison = 0;
      if (aValue > bValue) {
        comparison = 1;
      } else if (aValue < bValue) {
        comparison = -1;
      }

      return sortOrder === 'desc' ? comparison * -1 : comparison;
    });
  };

  const filterCourses = (coursesToFilter, query) => {
    if (!query.trim()) return coursesToFilter;
    
    const searchTerm = query.toLowerCase();
    return coursesToFilter.filter(course => 
      course.title?.toLowerCase().includes(searchTerm) ||
      course.description?.toLowerCase().includes(searchTerm) ||
      course.term?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const processedCourses = useMemo(() => {
    const filteredSameTerm = filterCourses(coursesData.sameTerm, searchQuery);
    const filteredOtherTerms = filterCourses(coursesData.otherTerms, searchQuery);
    const filteredNoneEnrolled = filterCourses(coursesData.noneEnrolled, searchQuery);
    
    const sortedSameTerm = sortCourses(filteredSameTerm, sortBy, order);
    const sortedOtherTerms = sortCourses(filteredOtherTerms, sortBy, order);
    const sortedNoneEnrolled = sortCourses(filteredNoneEnrolled, sortBy, order);
    
    return {
      enrolled: sortedSameTerm,
      preEnrolled: sortedOtherTerms,
      available: sortedNoneEnrolled
    };
  }, [coursesData, searchQuery, sortBy, order]);

  const loadCourseModules = async (courseId) => {
   try {
    const { data } = await axios.get(`/api/student/courses/${courseId}`);
   
    if (data.success) {
      const course = data.data;
      const modules = course.modules || [];
      setCoursesWithModules(prev => ({
        ...prev,
        [courseId]: modules
      }));
    } else {
      setCoursesWithModules(prev => ({
        ...prev,
        [courseId]: []
      }));
    }
  } catch (err) {
    console.error('Error loading course & modules:', err);
    setCoursesWithModules(prev => ({
      ...prev,
      [courseId]: []
    }));
  }
  };

  const toggleCourseExpansion = (courseId) => {
    const newExpanded = new Set(expandedCourses);
    if (expandedCourses.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
      if (!coursesWithModules[courseId]) {
        loadCourseModules(courseId);
      }
    }
    setExpandedCourses(newExpanded);
  };

  const showMoreCourses = (listType) => {
    setVisibleCounts(prev => ({
      ...prev,
      [listType]: prev[listType] + coursesPerPage
    }));
  };

  const goToNextSubject = () => {
    if (currentSubjectIndex < subjects.length - 1) {
      const nextSubject = subjects[currentSubjectIndex + 1];
      navigate(`/student/course/?subjectId=${nextSubject._id}`);
    }
  };

  const goToPrevSubject = () => {
    if (currentSubjectIndex > 0) {
      const prevSubject = subjects[currentSubjectIndex - 1];
      navigate(`/student/course/?subjectId=${prevSubject._id}`);
    }
  };

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

  useEffect(() => {
    setVisibleCounts({
      enrolled: 8,
      preEnrolled: 8,
      available: 8
    });
  }, [searchQuery, sortBy, order]);

  const handleEnroll = async (courseId) => {
    try {
      const { data } = await axios.post(
        '/api/student/enrollments/enroll',
        { studentId, courseId }
      );
      
      if (data.success) {
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

  const getCourseButton = (course) => {
    const isFromSameTerm = coursesData.sameTerm.find(c => c._id === course._id);
    const isFromOtherTerms = coursesData.otherTerms.find(c => c._id === course._id);
    
    if (isFromSameTerm) {
      return (
        <Button
          variant="success"
          size="sm"
          onClick={() => navigate(`/student/subject/${subjectId}/course/${course._id}`)}
          style={{ minWidth: '70px', width: '70px' }}
        >
          Detail
        </Button>
      );
    } else if (isFromOtherTerms) {
      return (
        <Button
          variant="warning"
          size="sm"
          onClick={() => handleReEnroll(course._id)}
          style={{ minWidth: '80px', width: '80px' }}
        >
          Re-Enroll
        </Button>
      );
    } else {
      return (
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleEnroll(course._id)}
          style={{ minWidth: '60px', width: '60px' }}
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

  const renderCourseList = (courses, listType, title, emptyMessage) => {
    const visibleCourses = courses.slice(0, visibleCounts[listType]);
    const hasMoreCourses = courses.length > visibleCounts[listType];

    return (
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">{title}</h5>
          <Badge bg="secondary">{courses.length} courses</Badge>
        </div>
        
        {courses.length === 0 ? (
          <p className="text-muted">{emptyMessage}</p>
        ) : (
          <>
            <Row xs={1} sm={2} md={3} lg={4} className="g-3 mb-3">
              {visibleCourses.map(c => {
                const isFromSameTerm = coursesData.sameTerm.find(course => course._id === c._id);
                const isFromOtherTerms = coursesData.otherTerms.find(course => course._id === c._id);
                const isExpanded = expandedCourses.has(c._id);
                const courseModules = coursesWithModules[c._id] || [];
                
                let borderVariant = 'secondary';
                let statusBadge = null;
                
                if (isFromSameTerm) {
                  borderVariant = 'success';
                  statusBadge = <Badge bg="success">Current Term</Badge>;
                } else if (isFromOtherTerms) {
                  borderVariant = 'warning';
                  statusBadge = <Badge bg="warning">Previously Enrolled</Badge>;
                }

                return (
                  <Col key={c._id}>
                    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                      <Card border={borderVariant} className="h-100">
                        <Card.Body className="d-flex flex-column">
                          {/* Card Header */}
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <Card.Title className="mb-1 flex-grow-1" style={{ fontSize: '1rem' }}>
                              {c.title}
                            </Card.Title>
                            {statusBadge && (
                              <div style={{ minWidth: 'fit-content' }}>
                                {statusBadge}
                              </div>
                            )}
                          </div>
                          
                          {/* Course Info */}
                          <div className="mb-3 flex-grow-1">
                            {c.term && (
                              <Card.Text className="text-muted mb-1 small">
                                <strong>Term:</strong> {c.term[c.term.length - 1]}
                              </Card.Text>
                            )}
                            
                            {c.credits && (
                              <Card.Text className="text-muted mb-1 small">
                                <strong>Credits:</strong> {c.credits}
                              </Card.Text>
                            )}
                            
                            {c.description && (
                              <Card.Text className="text-muted mb-1 small">
                                <strong>Description:</strong> {c.description.length > 60 ? c.description.substring(0, 60) + '...' : c.description}
                              </Card.Text>
                            )}
                            
                            {c.startDate && (
                              <Card.Text className="text-muted small">
                                <strong>Start:</strong> {new Date(c.startDate).toLocaleDateString()}
                              </Card.Text>
                            )}
                          </div>
                          
                          {/* Fixed Button Area */}
                          <div className="mt-auto">
                            <div className="d-flex justify-content-between mb-2" style={{ height: '32px' }}>
                              <div style={{ flex: '0 0 auto' }}>
                                {getCourseButton(c)}
                              </div>
                              {isFromOtherTerms && (
                                <div style={{ flex: '0 0 auto', marginLeft: '8px' }}>
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => navigate(`/student/subject/${subjectId}/course/${c._id}`)}
                                    style={{ minWidth: '60px', width: '60px' }}
                                  >
                                    Detail
                                  </Button>
                                </div>
                              )}
                              <div style={{ flex: '0 0 auto', marginLeft: 'auto' }}>
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  onClick={() => toggleCourseExpansion(c._id)}
                                  style={{ minWidth: '90px', width: '90px' }}
                                >
                                  <FiList /> {isExpanded ? 'Hide' : 'Modules'}
                                </Button>
                              </div>
                            </div>
                            
                            {/* Expandable Modules Section */}
                            <Collapse in={isExpanded}>
                              <div>
                                {courseModules.length > 0 ? (
                                  <div>
                                    <ListGroup variant="flush" className="small">
                                      {courseModules.slice(0, 5).map((module, index) => (
                                        <ListGroup.Item 
                                          key={module._id}
                                          className="px-0 py-1 border-0"
                                          action
                                          onClick={() => navigate(`/student/course/${c._id}/module/${module.moduleId}`)}
                                        >
                                          <div className="d-flex justify-content-between align-items-center">
                                            <small className="text-truncate">
                                              {index + 1}. {module.title}
                                            </small>
                                            <FiEye className="text-muted" size={12} />
                                          </div>
                                        </ListGroup.Item>
                                      ))}
                                    </ListGroup>
                                    {courseModules.length > 5 && (
                                      <div className="text-center mt-2">
                                        <Button
                                          variant="link"
                                          size="sm"
                                          onClick={() => navigate(`/student/subject/${subjectId}/course/${c._id}`)}
                                        >
                                          Show All ({courseModules.length} modules)
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <small className="text-muted">No modules available</small>
                                )}
                              </div>
                            </Collapse>
                          </div>
                        </Card.Body>
                      </Card>
                    </motion.div>
                  </Col>
                );
              })}
            </Row>
            
            {/* Show More Button */}
            {hasMoreCourses && (
              <div className="text-center">
                <Button
                  variant="outline-primary"
                  onClick={() => showMoreCourses(listType)}
                  className="px-4"
                >
                  <FiPlus className="me-2" />
                  Show More ({Math.min(coursesPerPage, courses.length - visibleCounts[listType])} more courses)
                </Button>
              </div>
            )}
            
            {/* Course Count Info */}
            <div className="text-center text-muted mt-2">
              <small>
                Showing {visibleCourses.length} of {courses.length} courses
              </small>
            </div>
          </>
        )}
      </div>
    );
  };

  const currentSubject = subjects[currentSubjectIndex];

  return (
    <Container className="py-4">
      {/* Header Navigation */}
      <Row className="align-items-center mb-4">
        <Col>
          <Button variant="link" onClick={() => navigate('/student/subjects')} className="p-0">
            <FiArrowLeft /> Back to Subjects
          </Button>
        </Col>
        <Col className="text-center">
          <h4 className="mb-0">
            {currentSubject ? currentSubject.title : 'Course List'}
          </h4>
        </Col>
        <Col className="text-end">
          <ButtonGroup>
            <Button
              variant="outline-primary"
              onClick={goToPrevSubject}
              disabled={currentSubjectIndex === 0}
            >
              <FiChevronLeft /> Prev Subject
            </Button>
            <Button
              variant="outline-primary"
              onClick={goToNextSubject}
              disabled={currentSubjectIndex >= subjects.length - 1}
            >
              Next Subject <FiChevronRight />
            </Button>
          </ButtonGroup>
        </Col>
      </Row>

      {/* Search and Sort Controls */}
      <Row className="align-items-center mb-4">
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
          
          </InputGroup>
        </Col>
      </Row>

      {/* Course Content */}
      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (coursesData.sameTerm.length + coursesData.otherTerms.length + coursesData.noneEnrolled.length) === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">No courses available for this subject.</p>
        </div>
      ) : (
        <div>
          {/* My Current Enrollments */}
          {renderCourseList(
            processedCourses.enrolled,
            'enrolled',
            'My Current Enrollments',
            'No current enrollments found.'
          )}

          {/* Previously Enrolled Courses */}
          {renderCourseList(
            processedCourses.preEnrolled,
            'preEnrolled',
            'Previously Enrolled Courses',
            'No previously enrolled courses found.'
          )}

          {/* Available Courses */}
          {renderCourseList(
            processedCourses.available,
            'available',
            'Available Courses for Enrollment',
            'No available courses found.'
          )}
        </div>
      )}
    </Container>
  );
}