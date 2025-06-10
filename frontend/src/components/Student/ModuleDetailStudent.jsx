import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { 
  FiArrowLeft, 
  FiSearch, 
  FiChevronDown, 
  FiBookOpen, 
  FiPlay, 
  FiFileText
} from "react-icons/fi";
import { motion } from "framer-motion";
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
  { label: "Title A→Z", value: "title:asc" },
  { label: "Title Z→A", value: "title:desc" },
  { label: "Order (Default)", value: "order:asc" }
];

export default function ModuleDetail() {
  const navigate = useNavigate();
  const { courseId, moduleId } = useParams(); 

  // State
  const [courseTitle, setCourseTitle] = useState("");
  const [module, setModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("order");
  const [order, setOrder] = useState("asc");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch course & module details
  const fetchModule = useCallback(async () => {
    try {
      setIsLoading(true);
      const courseResp = await axios.get(`/api/student/courses/${courseId}`);
      if (courseResp.data.success) {
        setCourseTitle(courseResp.data.data.title);
        const mod = courseResp.data.data.modules.find(
          (m) => m.moduleId === moduleId || m._id === moduleId
        );
        if (mod) {
          setModule(mod);
          setLessons(mod.lessons || []);
          setFiltered(mod.lessons || []);
        } else {
          setModule(null);
          setLessons([]);
          setFiltered([]);
        }
      }
    } catch (err) {
      console.error("Error fetching course/module:", err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, moduleId]);

  useEffect(() => {
    fetchModule();
  }, [fetchModule]);

  // Filter + Sort lessons
  useEffect(() => {
    let temp = [...lessons];

    // Search by lesson title
    if (searchQuery.trim()) {
      const regex = new RegExp(searchQuery, "i");
      temp = temp.filter((l) => regex.test(l.title));
    }

    // Sort
    temp.sort((a, b) => {
      let fieldA, fieldB;
      
      if (sortBy === 'order') {
        // Sử dụng index làm order mặc định nếu không có order field
        fieldA = a.order || lessons.indexOf(a);
        fieldB = b.order || lessons.indexOf(b);
      } else {
        fieldA = a[sortBy]?.toLowerCase() || "";
        fieldB = b[sortBy]?.toLowerCase() || "";
      }
      
      if (fieldA < fieldB) return order === "asc" ? -1 : 1;
      if (fieldA > fieldB) return order === "asc" ? 1 : -1;
      return 0;
    });

    setFiltered(temp);
  }, [lessons, searchQuery, sortBy, order]);

  const handleSortChange = (value) => {
    const [field, ord] = value.split(":");
    setSortBy(field);
    setOrder(ord);
  };

  // Handler click lesson
  const handleLessonClick = (lessonId) => {
    navigate(`/student/course/${courseId}/module/${moduleId}/lesson/${lessonId}`);
  };

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <div className="d-flex flex-column align-items-center">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3 text-muted">Loading module details...</p>
        </div>
      </Container>
    );
  }

  if (!module) {
    return (
      <Container className="py-5 text-center">
        <Card className="shadow-sm border-0">
          <Card.Body className="py-5">
            <div className="text-danger mb-3">
              <FiBookOpen size={48} />
            </div>
            <h4 className="text-danger mb-3">Module not found</h4>
            <p className="text-muted mb-4">The module you're looking for doesn't exist or has been removed.</p>
            <Button 
              variant="primary" 
              onClick={() => navigate(`/student/course/${courseId}`)}
              className="px-4"
            >
              <FiArrowLeft className="me-2" /> Back to Course
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
          onClick={() => navigate(`/student/course/${courseId}`)}
        >
          <FiArrowLeft className="me-2" /> Back to Course Detail
        </Button>
      </motion.div>

      {/* Module Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="mb-4 shadow-lg border-0 bg-gradient-primary text-white">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center justify-content-between">
              <div className="flex-grow-1">
                <h6 className="mb-2 opacity-90">Course: {courseTitle}</h6>
                <h2 className="mb-3 fw-bold">{module.title}</h2>
                <div className="d-flex align-items-center gap-3">
                  <Badge bg="light" text="dark" className="px-3 py-2">
                    <FiBookOpen className="me-1" />
                    {filtered.length} Lessons
                  </Badge>
                </div>
              </div>
              <div className="text-white opacity-75">
                <FiBookOpen size={48} />
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
                    placeholder="Search lessons by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-start-0 ps-0"
                  />
                </InputGroup>
              </Col>
              <Col md={4}>
                <InputGroup size="lg">
                  <Form.Select
                    value={`${sortBy}:${order}`}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="border-end-0"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
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

      {/* Lesson List */}
      {filtered.length === 0 ? (
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
              <h5 className="text-muted mb-2">No lessons found</h5>
              <p className="text-muted">
                {searchQuery ? 'Try adjusting your search terms' : 'This module has no lessons yet'}
              </p>
            </Card.Body>
          </Card>
        </motion.div>
      ) : (
        <div className="row g-4">
          {filtered.map((lesson, index) => (
            <div key={lesson.lessonId || lesson._id} className="col-12 col-md-6 col-lg-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="h-100"
              >
                <Card 
                  className="h-100 shadow-sm border-0 cursor-pointer hover-shadow-lg transition-all lesson-card"
                  onClick={() => handleLessonClick(lesson.lessonId || lesson._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Body className="p-4 d-flex flex-column">
                    {/* Lesson Header */}
                    <div className="d-flex align-items-start mb-3">
                      <div className="bg-primary text-white rounded-circle p-2 me-3 flex-shrink-0">
                        <FiFileText size={18} />
                      </div>
                      <div className="flex-grow-1 min-width-0">
                        <h5 className="mb-1 fw-bold text-truncate" title={lesson.title}>
                          {lesson.title}
                        </h5>
                        <small className="text-muted">
                          Lesson #{index + 1}
                        </small>
                      </div>
                    </div>
                    
                    {/* Lesson Content Preview */}
                    {lesson.content && (
                      <div className="flex-grow-1 mb-3">
                        <p className="text-muted mb-0" style={{ 
                          fontSize: '0.9rem',
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {lesson.content}
                        </p>
                      </div>
                    )}
                    
                    {/* Lesson Footer */}
                    <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top">
                      <Badge bg="primary" className="px-2 py-1">
                        <FiBookOpen size={12} className="me-1" />
                        Lesson
                      </Badge>
                      <div className="text-primary d-flex align-items-center">
                        <span className="me-2 small text-muted">Start</span>
                        <FiPlay size={18} />
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </div>
          ))}
        </div>
      )}

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
        .lesson-card {
          border-left: 4px solid transparent;
          transition: all 0.3s ease;
        }
        .lesson-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 123, 255, 0.15) !important;
          border-left-color: #007bff;
        }
        .min-width-0 {
          min-width: 0;
        }
      `}</style>
    </Container>
  );
}