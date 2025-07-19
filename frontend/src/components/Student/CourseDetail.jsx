import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FiSearch, 
  FiChevronDown, 
  FiArrowLeft, 
  FiBookOpen, 
  FiClock, 
  FiUser, 
  FiPlay,
  FiChevronLeft,
  FiChevronRight,
  FiList,
  FiEye,
  FiCheckCircle,
  FiCircle
} from 'react-icons/fi';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Container,
  Card,
  Button,
  Spinner,
  Form,
  InputGroup,
  Row,
  Col,
  Badge,
  Dropdown,
  Collapse,
  Alert,
  Nav,
  Tab
} from 'react-bootstrap';
import {useMemo} from 'react';

const sortOptions = [
  { label: 'Title A→Z',       value: 'title:asc' },
  { label: 'Title Z→A',       value: 'title:desc' },
  { label: 'Order (Default)', value: 'order:asc' }
];

export default function CourseDetail() {
  const navigate = useNavigate();
  const { courseId, subjectId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const enrolled = searchParams.get('enrolled');

  const [coursesList, setCoursesList] = useState({ sameTerm: [], otherTerms: [], noneEnrolled: [] });
  const [currentCourseIndex, setCurrentCourseIndex] = useState(-1);

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [studiedModules, setStudiedModules] = useState([]);
  const [notStudiedModules, setNotStudiedModules] = useState([]);
  const [studiedLessons, setStudiedLessons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('order');
  const [order, setOrder] = useState('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [showAssignments, setShowAssignments] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [moduleLessons, setModuleLessons] = useState({});
  const [loadingLessons, setLoadingLessons] = useState({});
  const [currentListKey, setCurrentListKey] = useState('sameTerm');
const token = localStorage.getItem('token'); 

  const getStudentId = () => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const { _id } = JSON.parse(stored);
        return _id;
      }
    } catch (e) {
      console.warn("Error parsing user from localStorage:", e);
    }
    return null;
  };

  const fetchCoursesList = useCallback(async () => {
    try {
      const studentId = getStudentId();
      if (!studentId || !subjectId) return;

      const resp = await axios.get(`/api/student/courses/subject/${subjectId}/student/${studentId}`,{
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      console.log("✅ Response from server:", resp.data);
      if (resp.data.success) {
        const data = resp.data.data;
        setCoursesList(data);
        
        const keys = ['sameTerm', 'otherTerms', 'noneEnrolled'];
        for (const key of keys) {
          const idx = data[key].findIndex(c => c._id === courseId);
          if (idx >= 0) {
            setCurrentListKey(key);
            setCurrentCourseIndex(idx);
            break;
          }
        }
      }
    } catch (err) {
      console.error('Error fetching courses list:', err);
    }
  }, [subjectId, courseId]);

  const currentList = useMemo(() => coursesList[currentListKey] || [], [coursesList, currentListKey]);

  const fetchStudyProgress = useCallback(async () => {
    try {
      const studentId = getStudentId();
      if (!studentId || !course) return;

      const courseTerms = Array.isArray(course.term) ? course.term : [];
      const latestTerm = courseTerms.length ? courseTerms[courseTerms.length - 1] : null;

      if (!latestTerm) return;
console.log(latestTerm);
      const resp = await axios.get(`/api/student/enrollments/study`, {
  params: {
    courseId: courseId,
    studentId: studentId,
    term: latestTerm
  },
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
});

      if (resp.data.success) {
        const studiedLessonIds = resp.data.data || [];
        setStudiedLessons(studiedLessonIds);
        
        const studied = [];
        const notStudied = [];

        modules.forEach(module => {
          const lessons = module.lessons || [];
          
          if (lessons.length === 0) {
            notStudied.push(module);
            return;
          }

          const allLessonsStudied = lessons.every(lesson => 
            studiedLessonIds.includes(lesson.lessonId)
          );

          if (allLessonsStudied) {
            studied.push(module);
          } else {
            notStudied.push(module);
          }
        });

        setStudiedModules(studied);
        setNotStudiedModules(notStudied);
      }
    } catch (err) {
      console.error('Error fetching study progress:', err);
    }
  }, [courseId, course, modules]);

  const fetchCourseDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      const resp = await axios.get(`/api/student/courses/${courseId}`,{
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (resp.data.success) {
        const data = resp.data.data;
        setCourse(data);
        setModules(data.modules || []);
        setFilteredModules(data.modules || []);
      }
    } catch (err) {
      console.error('Error fetching course detail:', err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  const toggleModuleExpansion = (moduleId) => {
    setExpandedModuleId(prev =>
      prev === moduleId ? null : moduleId
    );
  };

  const goToPreviousCourse = () => {
    if (currentCourseIndex > 0) {
      const prevCourse = currentList[currentCourseIndex - 1];
      navigate(`/student/subject/${subjectId}/course/${prevCourse._id}`);
    }
  };

  const goToNextCourse = () => {
    if (currentCourseIndex < currentList.length - 1) {
      const nextCourse = currentList[currentCourseIndex + 1];
      navigate(`/student/subject/${subjectId}/course/${nextCourse._id}`);
    }
  };

  const handleLessonClick = (moduleId, lessonId) => {
    navigate(`/student/course/${courseId}/module/${moduleId}/lesson/${lessonId}`);
  };

  useEffect(() => {
    fetchCoursesList();
    fetchCourseDetail();
  }, [fetchCoursesList, fetchCourseDetail]);

  useEffect(() => {
    if (!course) return;
    const studentId = getStudentId();
    axios
      .get(`/api/student/enrollments?studentId=${studentId}&courseId=${courseId}`,{
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      .then(resp => {
        if (!resp.data.success) return;
        const enrolls = resp.data.data;
        if (!enrolls.length) return;
        enrolls.sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt));
        const latestEnroll = enrolls[0];
        const courseTerms = Array.isArray(course.term) ? course.term : [];
        const latestCourseTerm = courseTerms.length ? courseTerms[courseTerms.length - 1] : null;
        if (latestEnroll.term === latestCourseTerm) {
          setShowAssignments(true);
        }
      })
      .catch(err => console.error('Error fetching enrollment:', err));
  }, [course, courseId]);

  useEffect(() => {
    if (course && modules.length > 0) {
      fetchStudyProgress();
    }
  }, [course, modules, fetchStudyProgress]);

  useEffect(() => {
    let temp = [...modules];
    
    if (activeTab === 'studied') {
      temp = studiedModules;
    } else if (activeTab === 'not-studied') {
      temp = notStudiedModules;
    }
    
    // Áp dụng search
    if (searchQuery.trim()) {
      const r = new RegExp(searchQuery, 'i');
      temp = temp.filter(m => r.test(m.title));
    }
    
    // Áp dụng sort
    temp.sort((a, b) => {
      let A, B;
      if (sortBy === 'order') {
        A = a.order || 0;  
        B = b.order || 0;
      } else {
        A = String(a[sortBy]||'').toLowerCase();
        B = String(b[sortBy]||'').toLowerCase();
      }
      if (A < B) return order==='asc'? -1:1;
      if (A > B) return order==='asc'? 1:-1;
      return 0;
    });
    
    setFilteredModules(temp);
  }, [modules, studiedModules, notStudiedModules, searchQuery, sortBy, order, activeTab]);

  const handleSortChange = v => {
    const [f, o] = v.split(':');
    setSortBy(f); 
    setOrder(o);
  };

  const handleModuleClick = mid =>
    navigate(`/student/course/${courseId}/module/${mid}`);

  const isModuleStudied = (moduleId) => {
    return studiedModules.some(module => module.moduleId === moduleId);
  };

  const getLessonProgress = (lessons) => {
    if (!lessons || lessons.length === 0) return { studied: 0, total: 0 };
    
    const studiedCount = lessons.filter(lesson => 
      studiedLessons.includes(lesson.lessonId)
    ).length;
    
    return { studied: studiedCount, total: lessons.length };
  };

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" size="lg" />
        <p className="mt-3 text-muted">Loading course details...</p>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container className="py-5 text-center">
        <Card className="shadow-sm border-0">
          <Card.Body className="py-5">
            <FiBookOpen size={48} className="text-danger mb-3" />
            <h4 className="text-danger">Course not found</h4>
            <p className="text-muted">The course you're looking for doesn't exist.</p>
            <Button onClick={() => navigate(-1)} className="px-4">
              <FiArrowLeft className="me-2" /> Go Back
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const ModuleCard = ({ mod, idx }) => {
    const moduleId = mod.moduleId;
    const isExpanded = expandedModuleId === moduleId;
    const lessons = mod.lessons || [];
    const isLoadingLessons = loadingLessons[moduleId];
    const displayedLessons = lessons.slice(0, 5);
    const hasMore = lessons.length > 5;
    const moduleStudied = isModuleStudied(moduleId);
    const { studied, total } = getLessonProgress(lessons);

    return (
      <motion.div
        initial={{opacity:0,y:20}}
        animate={{opacity:1,y:0}}
        transition={{delay: idx*0.1}}
        whileHover={{scale:1.02}}
      >
        <Card className={`shadow-sm ${moduleStudied ? 'border-success' : 'border-warning'}`}>
          <Card.Body>
            <Row>
              <Col xs="auto" className="text-primary me-3">
                {moduleStudied ? (
                  <FiCheckCircle size={24} className="text-success" />
                ) : (
                  <FiCircle size={24} className="text-warning" />
                )}
              </Col>
              <Col>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h5 className="fw-bold mb-0">{mod.title}</h5>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <Badge bg={moduleStudied ? 'success' : 'warning'} text="white">
                        {moduleStudied ? 'Completed' : 'In Progress'}
                      </Badge>
                      {total > 0 && (
                        <small className="text-muted">
                          {studied}/{total} lessons completed
                        </small>
                      )}
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleModuleExpansion(moduleId);
                      }}
                    >
                      <FiList size={16} />
                      <FiChevronDown 
                        size={16} 
                        className={`ms-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      />
                    </Button>
                  </div>
                </div>
                
                <div className="d-flex gap-3 mb-2">
                  {lessons.length > 0 && (
                    <small className="text-muted">
                      <FiBookOpen className="me-1" />
                      {lessons.length} lessons
                    </small>
                  )}
                </div>

                {/* Progress bar */}
                {total > 0 && (
                  <div className="mb-3">
                    <div className="progress" style={{ height: '6px' }}>
                      <div 
                        className={`progress-bar ${moduleStudied ? 'bg-success' : 'bg-warning'}`}
                        style={{ width: `${(studied / total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <Collapse in={isExpanded}>
                  <div className="mt-3">
                    {isLoadingLessons ? (
                      <div className="text-center py-2">
                        <Spinner size="sm" animation="border" />
                        <small className="text-muted ms-2">Loading lessons...</small>
                      </div>
                    ) : lessons.length > 0 ? (
                      <div className="border rounded p-2 bg-light">
                        <small className="text-muted fw-bold mb-2 d-block">
                          Lessons:
                        </small>

                        {displayedLessons.map((lesson) => {
                          const isLessonStudied = studiedLessons.includes(lesson.lessonId);
                          return (
                            <div
                              key={lesson.lessonId}
                              className="d-flex align-items-center justify-content-between py-1 px-2 rounded hover-bg-white"
                              onClick={() =>
                                navigate(
                                  `/student/course/${courseId}/module/${moduleId}/lesson/${lesson.lessonId}`
                                )
                              }
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="d-flex align-items-center">
                                {isLessonStudied ? (
                                  <FiCheckCircle size={12} className="text-success me-2" />
                                ) : (
                                  <FiPlay size={12} className="text-primary me-2" />
                                )}
                                <small className={`${isLessonStudied ? 'text-success' : 'text-dark'}`}>
                                  {lesson.title}
                                </small>
                              </div>
                              <FiEye size={12} className="text-muted" />
                            </div>
                          );
                        })}

                        {hasMore && (
                          <div className="text-center mt-2">
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() =>
                                navigate(`/student/course/${courseId}/module/${moduleId}`)
                              }
                            >
                              View all {lessons.length} lessons →
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Alert variant="info" className="py-2 mb-0">
                        <small>No lessons available for this module.</small>
                      </Alert>
                    )}
                  </div>
                </Collapse>
              </Col>
              <Col xs="auto" className="text-primary">
                <Button
                  variant="link"
                  className="p-0 text-primary"
                  onClick={() => handleModuleClick(moduleId)}
                >
                  <FiPlay size={24} />
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </motion.div>
    );
  };

  return (
    <Container className="py-4">
      <motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Button
            variant="outline-primary"
            onClick={() => navigate(`/student/courses?subjectId=${course.subjectId}&enrolled=true`)}
          >
            <FiArrowLeft className="me-2" /> Back to Courses List
          </Button>
          
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              disabled={currentCourseIndex <= 0}
              onClick={goToPreviousCourse}
            >
              <FiChevronLeft className="me-1" /> Previous Course
            </Button>
            <Button
              variant="outline-secondary"
              disabled={currentCourseIndex >= currentList.length - 1}
              onClick={goToNextCourse}
            >
              Next Course <FiChevronRight className="ms-1" />
            </Button>
          </div>
        </div>
      </motion.div>

      {currentList.length > 1 && (
        <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}>
          <Alert variant="info" className="mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <small>
                Course {currentCourseIndex + 1} of {currentList.length}
                {currentListKey==='noneEnrolled' && ' (not enrolled)'}
                {currentListKey==='otherTerms' && ' (enrolled in other terms)'}
                {currentListKey==='sameTerm' && ' (enrolled in same term)'}
              </small>
              <div className="progress" style={{ width: '200px', height: '4px' }}>
                <div 
                  className="progress-bar" 
                  style={{ width: `${((currentCourseIndex + 1) / currentList.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </Alert>
        </motion.div>
      )}

      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}}>
        <Card className="mb-4 text-white" style={{
          background: 'linear-gradient(135deg,#007bff 0%,#0056b3 100%)'
        }}>
          <Card.Body>
            <h2 className="fw-bold">{course.title}</h2>
            <div className="d-flex align-items-center mb-2">
              <FiUser className="me-2" /> Instructor:&nbsp;
              {course.instructorName||'Unknown'}
            </div>
            {course.description && (
              <p className="mb-3 opacity-75">{course.description}</p>
            )}
            <div className="d-flex flex-wrap gap-2">
              <Badge bg="light" text="dark">
                <FiBookOpen className="me-1" />
                {modules.length} Modules
              </Badge>
              <Badge bg="light" text="dark">
                <FiCheckCircle className="me-1" />
                {studiedModules.length} Completed
              </Badge>
              <Badge bg="light" text="dark">
                <FiCircle className="me-1" />
                {notStudiedModules.length} In Progress
              </Badge>
              {course.duration && (
                <Badge bg="light" text="dark">
                  <FiClock className="me-1" />
                  {course.duration}
                </Badge>
              )}
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}}>
        <Card className="mb-4">
          <Card.Body>
            <Row className="g-3 align-items-center">
              <Col md={8}>
                <InputGroup>
                  <InputGroup.Text><FiSearch /></InputGroup.Text>
                  <Form.Control
                    placeholder="Search modules..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={4}>
                <InputGroup>
                  <Form.Select
                    value={`${sortBy}:${order}`}
                    onChange={e => handleSortChange(e.target.value)}
                  >
                    {sortOptions.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </Form.Select>
                </InputGroup>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </motion.div>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link 
              active={activeTab === 'all'} 
              onClick={() => setActiveTab('all')}
              className="d-flex align-items-center"
            >
              <FiBookOpen className="me-2" />
              All Modules ({modules.length})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeTab === 'studied'} 
              onClick={() => setActiveTab('studied')}
              className="d-flex align-items-center"
            >
              <FiCheckCircle className="me-2" />
              Completed ({studiedModules.length})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeTab === 'not-studied'} 
              onClick={() => setActiveTab('not-studied')}
              className="d-flex align-items-center"
            >
              <FiCircle className="me-2" />
              In Progress ({notStudiedModules.length})
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </motion.div>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}}>
        {filteredModules.length === 0 ? (
          <Card className="text-center py-5">
            <FiBookOpen size={48} className="text-muted mb-3" />
            <h5 className="text-muted mb-2">No modules found</h5>
            <p className="text-muted">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'This course has no modules yet'}
            </p>
          </Card>
        ) : (
          <div className="row g-3">
            {filteredModules.map((mod, idx) => (
              <div key={mod.moduleId||mod._id} className="col-12">
                <ModuleCard mod={mod} idx={idx} />
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}} className="mt-5">
        <Card className="shadow-sm">
          <Card.Body>
            <h5 className="mb-3">Quick Actions</h5>
            <div className="d-flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(`/student/subject/${subjectId}/grades/${course._id}`)}
              >
                <FiBookOpen className="me-2" />
                Grade Overview
              </Button>
              {showAssignments && (
                <Button
                  variant="outline-primary"
                  size="lg"
                  onClick={() => navigate(`/student/assignments/${course._id}`)}
                >
                  <FiBookOpen className="me-2" />
                  Assignments
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </motion.div>
    </Container>
  );
}