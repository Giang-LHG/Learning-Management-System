// src/components/CourseDetail.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiChevronDown, FiArrowLeft, FiBookOpen, FiClock, FiUser, FiPlay } from 'react-icons/fi';
import axios from 'axios';
import { useNavigate, useParams ,useLocation} from 'react-router-dom';
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
  { label: 'Title A→Z', value: 'title:asc' },
  { label: 'Title Z→A', value: 'title:desc' },
  { label: 'Order (Default)', value: 'order:asc' }
];

export default function CourseDetail() {
  const navigate = useNavigate();
  const { courseId } = useParams();
const searchParams = new URLSearchParams(location.search);

const subjectId = searchParams.get('subjectId'); 
const enrolled = searchParams.get('enrolled');  
  // State để lưu course detail
  const [course, setCourse] = useState(null);

  // State cho module list, search + sort
  const [modules, setModules] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('order');
  const [order, setOrder] = useState('asc');

  const [isLoading, setIsLoading] = useState(true);

  // Fetch course detail
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

  // Handler khi search hoặc sort thay đổi
  useEffect(() => {
    let temp = [...modules];

    // Filter theo searchQuery (search module title)
    if (searchQuery.trim()) {
      const regex = new RegExp(searchQuery, 'i');
      temp = temp.filter((m) => regex.test(m.title));
    }

    // Sắp xếp theo sortBy & order
    temp.sort((a, b) => {
      let fieldA, fieldB;
      
      if (sortBy === 'order') {
        fieldA = a.order || 0;
        fieldB = b.order || 0;
      } else {
        fieldA = a[sortBy] ? a[sortBy].toString().toLowerCase() : '';
        fieldB = b[sortBy] ? b[sortBy].toString().toLowerCase() : '';
      }
      
      if (fieldA < fieldB) return order === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return order === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredModules(temp);
  }, [modules, searchQuery, sortBy, order]);

  // Handler sort change
  const handleSortChange = (value) => {
    const [field, ord] = value.split(':');
    setSortBy(field);
    setOrder(ord);
  };

  // Handler click module
  const handleModuleClick = (moduleId) => {
    navigate(`/student/course/${courseId}/module/${moduleId}`);
  };

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <div className="d-flex flex-column align-items-center">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3 text-muted">Loading course details...</p>
        </div>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container className="py-5 text-center">
        <Card className="shadow-sm border-0">
          <Card.Body className="py-5">
            <div className="text-danger mb-3">
              <FiBookOpen size={48} />
            </div>
            <h4 className="text-danger mb-3">Course not found</h4>
            <p className="text-muted mb-4">The course you're looking for doesn't exist or has been removed.</p>
            <Button variant="primary" onClick={() => navigate(-1)} className="px-4">
              <FiArrowLeft className="me-2" /> Go Back
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button 
          variant="outline-primary" 
          className="mb-4 shadow-sm" 
          onClick={() =>navigate(`/student/courses?subjectId=${course.subjectId}&enrolled=true`)}
        >
          <FiArrowLeft className="me-2" /> Back to Courses
        </Button>
      </motion.div>

      {/* Course Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="mb-4 shadow-lg border-0 bg-gradient-primary text-white">
          <Card.Body className="p-4">
            <div className="d-flex align-items-start justify-content-between">
              <div>
                <h2 className="mb-3 fw-bold">{course.title}</h2>
                <div className="d-flex align-items-center mb-2">
                  <FiUser className="me-2" />
                  <span>Instructor: {course.instructorName || 'Unknown'}</span>
                </div>
                {course.description && (
                  <p className="mb-3 opacity-90">{course.description}</p>
                )}
                <div className="d-flex flex-wrap gap-2">
                  <Badge bg="light" text="dark" className="px-3 py-2">
                    <FiBookOpen className="me-1" />
                    {filteredModules.length} Modules
                  </Badge>
                  {course.duration && (
                    <Badge bg="light" text="dark" className="px-3 py-2">
                      <FiClock className="me-1" />
                      {course.duration}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Search + Sort Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="mb-4 shadow-sm border-0">
          <Card.Body>
            <Row className="align-items-center g-3">
              <Col md={8}>
                <InputGroup size="lg">
                  <InputGroup.Text className="bg-light border-end-0">
                    <FiSearch className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search modules by title..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="border-start-0 ps-0"
                  />
                </InputGroup>
              </Col>
              <Col md={4}>
                <InputGroup size="lg">
                  <Form.Select
                    value={`${sortBy}:${order}`}
                    onChange={e => handleSortChange(e.target.value)}
                    className="border-end-0"
                  >
                    {sortOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Form.Select>
                  <InputGroup.Text className="bg-light border-start-0">
                    <FiChevronDown className="text-muted" />
                  </InputGroup.Text>
                </InputGroup>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Module List */}
      {filteredModules.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="text-center py-5 shadow-sm border-0">
            <Card.Body>
              <div className="text-muted mb-3">
                <FiBookOpen size={48} />
              </div>
              <h5 className="text-muted mb-2">No modules found</h5>
              <p className="text-muted">
                {searchQuery ? 'Try adjusting your search terms' : 'This course has no modules yet'}
              </p>
            </Card.Body>
          </Card>
        </motion.div>
      ) : (
        <div className="row g-3">
          {filteredModules.map((mod, index) => (
            <div key={mod.moduleId || mod._id} className="col-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="h-100"
              >
                <Card 
                  className="h-100 shadow-sm border-0 cursor-pointer hover-shadow-lg transition-all"
                  onClick={() => handleModuleClick(mod.moduleId || mod._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-start justify-content-between">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                          <div className="bg-primary text-white rounded-circle p-2 me-3">
                            <FiBookOpen size={20} />
                          </div>
                          <div>
                            <h5 className="mb-1 fw-bold">{mod.title}</h5>
                          
                          </div>
                        </div>
                        {mod.description && (
                          <p className="text-muted mb-3 ms-5">{mod.description}</p>
                        )}
                        <div className="d-flex align-items-center gap-3 ms-5">
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
                      </div>
                      <div className="text-primary">
                        <FiPlay size={24} />
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-5"
      >
        <Card className="shadow-sm border-0">
          <Card.Body>
            <h5 className="mb-3">Quick Actions</h5>
            <div className="d-flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(`/student/grades/${course._id}`)}
                className="px-4"
              >
                <FiBookOpen className="me-2" />
                Grade Overview
              </Button>
              <Button
                variant="outline-primary"
                size="lg"
                onClick={() => navigate(`/student/assignments/${course._id}`)}
                className="px-4"
              >
                <FiBookOpen className="me-2" />
                Assignments
              </Button>
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Custom CSS for hover effects */}
      <style jsx>{`
        .cursor-pointer {
          cursor: pointer;
        }
        .hover-shadow-lg:hover {
          box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important;
        }
        .transition-all {
          transition: all 0.3s ease;
        }
        .bg-gradient-primary {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
        }
      `}</style>
    </Container>
  );
}