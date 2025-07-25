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
  FiPlus,
  FiRefreshCw,
  FiBookOpen,
  FiArchive,
  FiInbox

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
  ButtonGroup,
  Tooltip ,
  OverlayTrigger
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
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const token = localStorage.getItem('token'); 
console.log(token);
  const [expandedCourses, setExpandedCourses] = useState(new Set());
  const [coursesWithModules, setCoursesWithModules] = useState({});
  
  const [visibleCounts, setVisibleCounts] = useState({
    enrolled: 8,
    preEnrolled: 8,
    available: 8
  });

  const coursesPerPage = 8;

  // Animation variants for staggered loading
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Empty state icon component
  const EmptyStateIcon = ({ icon: Icon, title, description }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="d-flex flex-column align-items-center justify-content-center text-center py-5"
      style={{ minHeight: '300px' }}
    >
      <div 
        className="d-flex align-items-center justify-content-center rounded-circle bg-light mb-4"
        style={{ width: '120px', height: '120px' }}
      >
        <Icon size={60} className="text-muted" />
      </div>
      <h5 className="text-muted mb-2">{title}</h5>
      <p className="text-muted small">{description}</p>
    </motion.div>
  );

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
    const { data } = await axios.get(`/api/student/courses/${courseId}`,{
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
   console.log("Đây là", data);
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

  useEffect(() => {
    if (!subjectId) return;
    
    setIsLoading(true);
    setIsDataLoaded(false);
    const cancel = axios.CancelToken.source();
    
    axios.get(
      `/api/student/courses/subject/${subjectId}/student/${studentId}`,
      { cancelToken: cancel.token, headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        } }
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
      // Add slight delay for better UX
      setTimeout(() => {
        setIsDataLoaded(true);
      }, 300);
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
      setIsDataLoaded(true);
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
      ,{
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      
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
     ,{
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      
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
  const isExpanded = expandedCourses[course._id];
  
  if (isFromSameTerm) {
    return (
      <div className="d-flex align-items-center">
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id={`tooltip-detail-${course._id}`}>
              View details
            </Tooltip>
          }
        >
          <Button
            variant="success"
            size="sm"
            onClick={() => navigate(`/student/subject/${subjectId}/course/${course._id}`)}
            className="d-flex align-items-center justify-content-center"
            style={{ 
              minWidth: '40px', 
              width: '40px', 
              height: '36px',
              borderRadius: '8px'
            }}
          >
            <FiEye size={16} />
          </Button>
        </OverlayTrigger>
        
        <div style={{ flex: '0 0 auto', marginLeft: '8px' }}>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`tooltip-modules-${course._id}`}>
                {isExpanded ? 'Hide modules' : 'Show modules'}
              </Tooltip>
            }
          >
            <Button
              variant="outline-info"
              size="sm"
              onClick={() => toggleCourseExpansion(course._id)}
              className="d-flex align-items-center justify-content-center"
              style={{ minWidth: '90px', width: '90px' }}
            >
              <FiList style={{ marginRight: '4px' }} /> 
              {isExpanded ? 'Hide' : 'Modules'}
            </Button>
          </OverlayTrigger>
        </div>
      </div>
    );
  } else if (isFromOtherTerms) {
    return (
      <div className="d-flex align-items-center">
        <div style={{ flex: '0 0 auto', marginRight: '8px' }}>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`tooltip-detail-other-${course._id}`}>
                View details
              </Tooltip>
            }
          >
           <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id={`tooltip-detail-${course._id}`}>
              View details
            </Tooltip>
          }
        >
          <Button
            variant="success"
            size="sm"
            onClick={() => navigate(`/student/subject/${subjectId}/course/${course._id}`)}
            className="d-flex align-items-center justify-content-center"
            style={{ 
              minWidth: '40px', 
              width: '40px', 
              height: '36px',
              borderRadius: '8px'
            }}
          >
            <FiEye size={16} />
          </Button>
        </OverlayTrigger>
          </OverlayTrigger>
        </div>
        
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id={`tooltip-reenroll-${course._id}`}>
              Re-enroll
            </Tooltip>
          }
        >
          <Button
            variant="warning"
            size="sm"
            onClick={() => handleReEnroll(course._id)}
            className="d-flex align-items-center justify-content-center"
            style={{ 
              minWidth: '40px', 
              width: '40px', 
              height: '36px',
              borderRadius: '8px'
            }}
          >
            <FiRefreshCw size={16} />
          </Button>
        </OverlayTrigger>
        
        <div style={{ flex: '0 0 auto', marginLeft: '8px' }}>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`tooltip-modules-other-${course._id}`}>
                {isExpanded ? 'Hide modules' : 'Show modules'}
              </Tooltip>
            }
          >
            <Button
              variant="outline-info"
              size="sm"
              onClick={() => toggleCourseExpansion(course._id)}
              className="d-flex align-items-center justify-content-center"
              style={{ minWidth: '90px', width: '90px' }}
            >
              <FiList style={{ marginRight: '4px' }} /> 
              {isExpanded ? 'Hide' : 'Modules'}
            </Button>
          </OverlayTrigger>
        </div>
      </div>
    );
  } else {
    return (
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id={`tooltip-enroll-${course._id}`}>
            Enroll
          </Tooltip>
        }
      >
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleEnroll(course._id)}
          className="d-flex align-items-center justify-content-center"
          style={{ 
            minWidth: '40px', 
            width: '40px', 
            height: '36px',
            borderRadius: '8px'
          }}
        >
          <FiPlus size={16} />
        </Button>
      </OverlayTrigger>
    );
  }
};
  const onSortChange = (value) => {
    const [field, ord] = value.split(':');
    setSortBy(field);
    setOrder(ord);
  };

  const renderCourseList = (courses, listType, title, emptyMessage, emptyIcon) => {
    const visibleCourses = courses.slice(0, visibleCounts[listType]);
    const hasMoreCourses = courses.length > visibleCounts[listType];

    return (
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">{title}</h5>
          <Badge bg="secondary">{courses.length} courses</Badge>
        </div>
        
        {courses.length === 0 ? (
          <EmptyStateIcon 
            icon={emptyIcon}
            title="No Courses Found"
            description={emptyMessage}
          />
        ) : (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={isDataLoaded ? "visible" : "hidden"}
            >
              <Row xs={1} sm={2} md={3} lg={4} className="g-3 mb-3">
                {visibleCourses.map((c, index) => {
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
                      <motion.div 
                        variants={cardVariants}
                        whileHover={{ scale: 1.02, y: -5 }} 
                        transition={{ duration: 0.2 }}
                      >
                        <Card border={borderVariant} className="h-100 shadow-sm">
                          <Card.Body className="d-flex flex-column">
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
                             
                              {c.startDate && (
                                <Card.Text className="text-muted mb-1 small">
                                  <strong>Start:</strong> {new Date(c.startDate).toLocaleDateString()}
                                </Card.Text>
                              )}
                               {c.endDate && (
                                <Card.Text className="text-muted small">
                                  <strong>End:</strong> {new Date(c.endDate).toLocaleDateString()}
                                </Card.Text>
                              )}
                            </div>
                            
                            <div className="mt-auto">
                              <div className="d-flex justify-content-between mb-2" style={{ height: '32px' }}>
                                <div style={{ flex: '0 0 auto' }}>
                                  {getCourseButton(c)}
                                </div>
                               
                              </div>
                              
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
            </motion.div>
       
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

const getFirstAvailableCourse = (coursesData) => {
  if (!coursesData) return null;

  if (coursesData.sameTerm && coursesData.sameTerm.length > 0) {
    return coursesData.sameTerm[0];
  }

  if (coursesData.otherTerm && coursesData.otherTerm.length > 0) {
    return coursesData.otherTerm[0];
  }

  if (coursesData.noneEnrolled && coursesData.noneEnrolled.length > 0) {
    return coursesData.noneEnrolled[0];
  }

  return null;
};

const firstCourse = getFirstAvailableCourse(coursesData);
console.log(firstCourse);

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-4">
        <Col>
   <Button 
  onClick={() => navigate('/student/subjects')} 
  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all duration-200 ease-in-out shadow-sm hover:shadow-md active:scale-98 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
>
  <FiArrowLeft className="w-4 h-4" /> 
  Back to Subjects
</Button>
        </Col>
      </Row>

 <Row className="align-items-center mb-4">
    <Col>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="border-0 shadow-sm h-100">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-start">
              <div className="flex-grow-1">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-primary bg-opacity-10 rounded-3 p-3 me-3">
                    <i className="fas fa-graduation-cap text-primary fs-4"></i>
                  </div>
                  <div>
                    <h4 className="mb-1 text-dark fw-bold">
                      {firstCourse?.subjectId?.name}
                    </h4>
                    <Badge bg="light" text="dark" className="px-3 py-2">
                      {firstCourse?.subjectId?.code}
                    </Badge>
                  </div>
                </div>
                
                <div className="ps-5">
                  <small className="text-muted fw-semibold d-block mb-2">
                    Course Description
                  </small>
                  <p className="text-secondary mb-0 lh-base">
                    {firstCourse?.subjectId?.description}
                  </p>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </motion.div>
    </Col>
  </Row>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
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
      </motion.div>

      {/* Course Lists */}
      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (coursesData.sameTerm.length + coursesData.otherTerms.length + coursesData.noneEnrolled.length) === 0 ? (
        <div className="text-center py-5">
          <EmptyStateIcon 
            icon={FiInbox}
            title="No Courses Available"
            description="No courses available for this subject."
          />
        </div>
      ) : (
        <div>
          {renderCourseList(
            processedCourses.enrolled,
            'enrolled',
            'My Current Enrollments',
            'No current enrollments found.',
            FiBookOpen
          )}
        
          {renderCourseList(
            processedCourses.preEnrolled,
            'preEnrolled',
            'Previously Enrolled Courses',
            'No previously enrolled courses found.',
            FiArchive
          )}

          {renderCourseList(
            processedCourses.available,
            'available',
            'Available Courses for Enrollment',
            'No available courses found.',
            FiBook
          )}
        </div>
      )}
    </Container>
  );
}