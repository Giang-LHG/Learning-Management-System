import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiChevronDown, FiArrowLeft, FiBookOpen, FiClock, FiUser, FiPlay } from 'react-icons/fi';
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
} from 'react-bootstrap';

const sortOptions = [
  { label: 'Title A→Z',       value: 'title:asc' },
  { label: 'Title Z→A',       value: 'title:desc' },
  { label: 'Order (Default)', value: 'order:asc' }
];

export default function CourseDetail() {
  const navigate    = useNavigate();
  const { courseId }= useParams();
  const location    = useLocation();
  const searchParams= new URLSearchParams(location.search);
  const subjectId   = searchParams.get('subjectId');
  const enrolled    = searchParams.get('enrolled');

  // course + modules
  const [course, setCourse]             = useState(null);
  const [modules, setModules]           = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [searchQuery, setSearchQuery]   = useState('');
  const [sortBy, setSortBy]             = useState('order');
  const [order, setOrder]               = useState('asc');
  const [isLoading, setIsLoading]       = useState(true);

  // show assignments?
  const [showAssignments, setShowAssignments] = useState(false);

  // 1) Utility lấy studentId
  const getStudentId = () => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const { _id } = JSON.parse(stored);
        return _id;
      }
    } catch {
     console.warn("Error parsing user from localStorage:", e);
    }
   
  };

  // 2) Fetch course detail (và modules)
  const fetchCourseDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      const resp = await axios.get(`/api/student/courses/${courseId}`);
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

  useEffect(() => {
    fetchCourseDetail();
  }, [fetchCourseDetail]);

  // 3) Sau khi có course, fetch enrollment gần nhất
  useEffect(() => {
    if (!course) return;
    const studentId = getStudentId();
    axios
      .get(`/api/student/enrollments?studentId=${studentId}&courseId=${courseId}`)
      .then(resp => {
        if (!resp.data.success) return;
        const enrolls = resp.data.data;
        if (!enrolls.length) return;
        // sort enrollment mới nhất trước
        enrolls.sort((a, b) =>
          new Date(b.enrolledAt) - new Date(a.enrolledAt)
        );
        const latestEnroll = enrolls[0];
        // term cuối cùng của course
        const courseTerms = Array.isArray(course.term) ? course.term : [];
        const latestCourseTerm = courseTerms.length
          ? courseTerms[courseTerms.length - 1]
          : null;
        if (latestEnroll.term === latestCourseTerm) {
          setShowAssignments(true);
        }
      })
      .catch(err => console.error('Error fetching enrollment:', err));
  }, [course, courseId]);

  // 4) Search & sort modules
  useEffect(() => {
    let temp = [...modules];
    if (searchQuery.trim()) {
      const r = new RegExp(searchQuery, 'i');
      temp = temp.filter(m => r.test(m.title));
    }
    temp.sort((a, b) => {
      let A, B;
      if (sortBy === 'order') {
        A = a.order || 0;  B = b.order || 0;
      } else {
        A = String(a[sortBy]||'').toLowerCase();
        B = String(b[sortBy]||'').toLowerCase();
      }
      if (A < B) return order==='asc'? -1:1;
      if (A > B) return order==='asc'? 1:-1;
      return 0;
    });
    setFilteredModules(temp);
  }, [modules, searchQuery, sortBy, order]);

  const handleSortChange = v => {
    const [f, o] = v.split(':');
    setSortBy(f); setOrder(o);
  };

  const handleModuleClick = mid =>
    navigate(`/student/course/${courseId}/module/${mid}`);

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
            <p className="text-muted">
              The course you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate(-1)} className="px-4">
              <FiArrowLeft className="me-2" /> Go Back
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Back */}
      <motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}}>
        <Button
          variant="outline-primary"
          className="mb-4"
          onClick={() =>
            navigate(`/student/courses?subjectId=${course.subjectId}&enrolled=true`)
          }
        >
          <FiArrowLeft className="me-2" /> Back to Courses
        </Button>
      </motion.div>

      {/* Header */}
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
                {filteredModules.length} Modules
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

      {/* Search + Sort */}
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
                  <InputGroup.Text><FiChevronDown /></InputGroup.Text>
                </InputGroup>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Module List */}
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
              <motion.div
                initial={{opacity:0,y:20}}
                animate={{opacity:1,y:0}}
                transition={{delay: idx*0.1}}
                whileHover={{scale:1.02}}
              >
                <Card
                  className="shadow-sm"
                  onClick={() => handleModuleClick(mod.moduleId||mod._id)}
                  style={{cursor:'pointer'}}
                >
                  <Card.Body>
                    <Row>
                      <Col xs="auto" className="text-primary me-3">
                        <FiBookOpen size={24} />
                      </Col>
                      <Col>
                        <h5 className="fw-bold">{mod.title}</h5>
                        {mod.description && <p className="text-muted">{mod.description}</p>}
                        <div className="d-flex gap-3">
                          {mod.duration && (
                            <small className="text-muted">
                              <FiClock className="me-1" />
                              {mod.duration}
                            </small>
                          )}
                          {mod.lessonsCount && (
                            <small className="text-muted">
                              <FiBookOpen className="me-1" />
                              {mod.lessonsCount} lessons
                            </small>
                          )}
                        </div>
                      </Col>
                      <Col xs="auto" className="text-primary">
                        <FiPlay size={24} />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </motion.div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="mt-5">
        <Card className="shadow-sm">
          <Card.Body>
            <h5 className="mb-3">Quick Actions</h5>
            <div className="d-flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(`/student/grades/${course._id}`)}
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
