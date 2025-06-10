import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Card, Button, Spinner, Form, InputGroup, Badge } from 'react-bootstrap';

import { FiArrowLeft, FiSearch, FiChevronDown, FiMoreVertical, FiCalendar, FiUser, FiAward } from "react-icons/fi";
import { motion } from "framer-motion";

const sortOptions = [
  { label: "Grade ↑",      value: "grade:asc" },
  { label: "Grade ↓",      value: "grade:desc" },

  { label: "Assignment A→Z", value: "assignmentTitle:asc" },
  { label: "Assignment Z→A", value: "assignmentTitle:desc" }
];

export default function GradeOverview() {
  const navigate = useNavigate();
  const { courseId } = useParams(); 
   const DEFAULT_STUDENT_ID = "60a000000000000000000002";
   const [studentId, setStudentId] = useState(DEFAULT_STUDENT_ID);
   
   useEffect(() => {
     try {
       const stored = localStorage.getItem("user");
       if (stored) {
         const u = JSON.parse(stored);
         if (u && u._id) setStudentId(u._id);
       }
     } catch (e) {
       console.warn("localStorage user parse error:", e);
     }
   }, []); 

  const [submissions, setSubmissions] = useState([]);     
  const [filtered, setFiltered] = useState([]);             
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("grade");
  const [order, setOrder] = useState("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [courseTitle, setCourseTitle] = useState("");       
  const [assignments, setAssignments] = useState([]);       

  const fetchGrades = useCallback(async () => {
    try {
      setIsLoading(true);
      const resp = await axios.get(`/api/student/submissions/student/${studentId}/course/${courseId}`);
      if (resp.data.success) {
     
        setSubmissions(resp.data.data);
        setFiltered(resp.data.data);

        const uniqueAssignments = [
          ...new Map(
            resp.data.data.map((s) => [s.assignment._id, s.assignment])
          ).values(),
        ];
        setAssignments(uniqueAssignments);
      }
      const courseResp = await axios.get(`/api/student/courses/${courseId}`);
      if (courseResp.data.success) {
        setCourseTitle(courseResp.data.data.title);
      }
    } catch (err) {
      console.error("Error fetching grades:", err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  useEffect(() => {
    let temp = [...submissions];

    if (searchQuery.trim()) {
      const regex = new RegExp(searchQuery, "i");
      temp = temp.filter((s) => regex.test(s.assignment.title));
    }

    //  Sort
    temp.sort((a, b) => {
      let fieldA, fieldB;

      switch (sortBy) {
        case "grade":
          fieldA = a.grade?.score ?? 0;
          fieldB = b.grade?.score ?? 0;
          break;
        case "studentName":
          fieldA = a.student?.profile?.fullName?.toLowerCase() || "";
          fieldB = b.student?.profile?.fullName?.toLowerCase() || "";
          break;
        case "assignmentTitle":
          fieldA = a.assignment?.title?.toLowerCase() || "";
          fieldB = b.assignment?.title?.toLowerCase() || "";
          break;
        default:
          fieldA = a.grade?.score ?? 0;
          fieldB = b.grade?.score ?? 0;
      }

      if (fieldA < fieldB) return order === "asc" ? -1 : 1;
      if (fieldA > fieldB) return order === "asc" ? 1 : -1;
      return 0;
    });

    setFiltered(temp);
  }, [submissions, searchQuery, sortBy, order]);

  const handleSortChange = (value) => {
    const [field, ord] = value.split(":");
    setSortBy(field);
    setOrder(ord);
  };

  const goToAppeal = (submissionId) => {
    navigate(`/student/appeal/${submissionId}`);
  };

  const goBack = () => {
    navigate(-1);
  };

  const getGradeColor = (score) => {
    if (score >= 9) return "success";
    if (score >= 8) return "primary";
    if (score >= 7) return "warning";
    if (score >= 6) return "info";
    return "danger";
  };

  return (
    <div style={{ backgroundColor: '#f8f9fc', minHeight: '100vh' }}>
      <Container className="py-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button 
            variant="outline-primary" 
            className="mb-4 px-4 py-2 rounded-pill shadow-sm" 
            onClick={goBack}
            style={{ borderWidth: '2px' }}
          >
            <FiArrowLeft className="me-2" /> Back to Course Detail
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-4 border-0 shadow-lg" style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px'
          }}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center">
                <div className="bg-white bg-opacity-20 rounded-circle p-3 me-3">
                  <FiAward size={24} className="text-white" />
                </div>
                <div>
                  <Card.Title className="h3 text-white mb-1">
                    Grade Overview
                  </Card.Title>
                  <Card.Subtitle className="text-white-50 h5">
                    {courseTitle || `Course ${courseId}`}
                  </Card.Subtitle>
                </div>
              </div>
            </Card.Body>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="mb-4 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <Card.Body className="p-4">
              <Row className="align-items-center g-3">
                <Col md={8}>
                  <div className="position-relative">
                    <InputGroup size="lg" className="shadow-sm">
                      <InputGroup.Text className="bg-light border-0 px-3">
                        <FiSearch className="text-muted" />
                      </InputGroup.Text>
                      <Form.Select
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="border-0 ps-2"
                        style={{ borderRadius: '0 10px 10px 0' }}
                      >
                        <option value="">All Assignments</option>
                        {assignments.map(a => (
                          <option key={a._id} value={a.title}>{a.title}</option>
                        ))}
                      </Form.Select>
                    </InputGroup>
                  </div>
                </Col>
                <Col md={4}>
                  <InputGroup size="lg" className="shadow-sm">
                    <Form.Select
                      value={`${sortBy}:${order}`}
                      onChange={e => handleSortChange(e.target.value)}
                      className="border-0"
                      style={{ borderRadius: '10px 0 0 10px' }}
                    >
                      {[
                        { label: 'Grade ↑', value: 'grade:asc' },
                        { label: 'Grade ↓', value: 'grade:desc' },
                       
                        { label: 'Assignment A→Z', value: 'assignmentTitle:asc' },
                        { label: 'Assignment Z→A', value: 'assignmentTitle:desc' },
                      ].map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Form.Select>
                    <InputGroup.Text className="bg-light border-0 px-3">
                      <FiChevronDown className="text-muted" />
                    </InputGroup.Text>
                  </InputGroup>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </motion.div>

        {!isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="text-muted mb-0">
                Found {filtered.length} submission{filtered.length !== 1 ? 's' : ''}
              </h5>
              {searchQuery && (
                <Badge bg="primary" pill className="px-3 py-2">
                  Filtered by: {searchQuery}
                </Badge>
              )}
            </div>
          </motion.div>
        )}

        {isLoading ? (
          <div className="text-center py-5">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Spinner animation="border" variant="primary" />
            </motion.div>
            <p className="mt-3 text-muted">Loading submissions...</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="text-center py-5 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
              <Card.Body>
                <div className="text-muted mb-3">
                  <FiSearch size={48} />
                </div>
                <h5 className="text-muted">No submissions found</h5>
                <p className="text-muted">Try adjusting your search or filter criteria</p>
              </Card.Body>
            </Card>
          </motion.div>
        ) : (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {filtered.map((s, index) => (
              <Col key={s._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="h-100 border-0 shadow-sm position-relative overflow-hidden" 
                        style={{ borderRadius: '15px', transition: 'all 0.3s ease' }}>
                    {/* Grade Badge */}
                    {s.grade?.score != null && (
                      <Badge 
                        bg={getGradeColor(s.grade.score)}
                        className="position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill"
                        style={{ zIndex: 2 }}
                      >
                        {s.grade.score}
                      </Badge>
                    )}
                    
                    <Button
                      variant="light"
                      className="position-absolute top-0 end-0 m-3 rounded-circle p-2 shadow-sm"
                      onClick={() => goToAppeal(s._id)}
                      style={{ 
                        width: '40px', 
                        height: '40px',
                        border: 'none',
                        zIndex: 2
                      }}
                    >
                      <FiMoreVertical />
                    </Button>

                    <Card.Body className="p-4 d-flex flex-column">
                      <Card.Title className="h6 mb-3 fw-bold text-primary" 
                                  style={{ lineHeight: '1.4' }}>
                        {s.assignment.title}
                      </Card.Title>

                      <div className="d-flex align-items-center mb-2 text-muted">
                        <FiUser size={16} className="me-2" />
                        <span className="small">{s.student.profile.fullName}</span>
                      </div>

                      <div className="d-flex align-items-center mb-3 text-muted">
                        <FiCalendar size={16} className="me-2" />
                        <span className="small">
                          {new Date(s.submittedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="mt-auto">
                        {s.grade?.score != null ? (
                          <div className="text-center">
                            <div className={`text-${getGradeColor(s.grade.score)} fw-bold h5 mb-1`}>
                              {s.grade.score}/10
                            </div>
                            <small className="text-muted">Graded</small>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="text-warning h6 mb-1">
                              Pending
                            </div>
                            <small className="text-muted">Not graded yet</small>
                          </div>
                        )}
                      </div>
                    </Card.Body>

                    {/* Hover Effect Overlay */}
                    <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary bg-opacity-5" 
                         style={{ 
                           opacity: 0, 
                           transition: 'opacity 0.3s ease',
                           pointerEvents: 'none'
                         }}
                         onMouseEnter={(e) => e.target.style.opacity = 1}
                         onMouseLeave={(e) => e.target.style.opacity = 0}
                    />
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