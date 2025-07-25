"use client";

import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Badge, Modal, Dropdown, Alert } from "react-bootstrap";
import { Plus, Eye, Edit, Trash2, Calendar, User, BookOpen, GraduationCap, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
import Header from "../header/Header";
import AddCourseModal from "./AddCourseModal";
import EditCourseModal from "./EditCourseModal";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
const token = localStorage.getItem("token");
  useEffect(() => {
    const fetchCourses = async () => {
      console.log("Starting fetchCourses...");
      try {
        setLoading(true);
        console.log("Loading set to true");
        const user = localStorage.getItem("user");
        console.log("User from localStorage:", user);
        if (!user) {
          setError("No user found in localStorage. Please log in again.");
          setLoading(false);
          console.log("Error set: No user in localStorage");
          return;
        }
        let parsedUser;
        try {
          parsedUser = JSON.parse(user);
          console.log("Parsed User:", parsedUser);
        } catch (e) {
          setError("Invalid user data in localStorage.");
          setLoading(false);
          console.log("Error parsing user:", e.message);
          return;
        }
        const instructorId = parsedUser._id;
        console.log("Extracted instructorId:", instructorId);
        if (!instructorId) {
          setError("No instructorId found in user data. Please check the data.");
          setLoading(false);
          console.log("Error set: No instructorId in user");
          return;
        }
        const response = await api.get(`/instructor/courses/instructor/${instructorId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log("API Response received:", response.data);
        if (response.data.success) {
          setCourses(response.data.data || []);
          console.log("Courses set:", response.data.data);
        } else {
          setError(response.data.message || "Unable to load course list.");
          console.log("Error set from API:", response.data.message);
        }
      } catch (err) {
        console.error("Error fetching courses:", err.response ? err.response.data : err.message);
        setError("An error occurred while loading the course list. Please try again.");
        console.log("Catch block error:", err.message);
      } finally {
        setLoading(false);
        console.log("Loading set to false, final state:", { loading, courses, error });
      }
    };
    fetchCourses();
  }, []);

  const handleAddCourse = () => {
    console.log("handleAddCourse triggered");
    setShowAddModal(true);
  };

  const handleSubmitCourse = async (courseData) => {
    console.log("handleSubmitCourse triggered with data:", courseData);
    try {
      const user = localStorage.getItem("user");
      console.log("User from localStorage for submission:", user);
      if (!user) {
        setError("No user found to create the course.");
        console.log("Error set: No user for submission");
        return;
      }
      const parsedUser = JSON.parse(user);
      const instructorId = parsedUser._id;
      console.log("InstructorId for submission:", instructorId);
      const response = await api.post("/instructor/courses", courseData,{
 
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
      console.log("API Response for create:", response.data);
      if (response.data.success) {
        setCourses((prev) => [response.data.data, ...prev]);
        setShowAddModal(false);
        console.log("Courses updated after creation:", [response.data.data, ...courses]);
      }
    } catch (err) {
      setError("Unable to create course.");
      console.error("Error creating course:", err.response ? err.response.data : err.message);
      console.log("Catch block error for create:", err.message);
    }
  };

  const handleViewCourse = (courseId) => {
    console.log("handleViewCourse triggered with courseId:", courseId);
    navigate(`/instructor/course/${courseId}`);
  };

  const handleEditCourse = (courseId) => {
    console.log("handleEditCourse triggered with courseId:", courseId);
    const course = courses.find((c) => c._id === courseId);
    console.log("Found course for edit:", course);
    if (course) {
      setCourseToEdit(course);
      setShowEditModal(true);
    }
  };

  const handleSubmitEditCourse = async (updatedCourseData) => {
    console.log("handleSubmitEditCourse triggered with data:", updatedCourseData);
    try {
      const response = await api.put(`/instructor/courses/${courseToEdit._id}`,updatedCourseData,  {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        } );
      console.log("API Response for update:", response.data);
      if (response.data.success) {
        setCourses((prevCourses) =>
          prevCourses.map((course) => (course._id === courseToEdit._id ? response.data.data : course))
        );
        setShowEditModal(false);
        setCourseToEdit(null);
        console.log("Courses updated after edit:", courses);
      }
    } catch (err) {
      setError("Unable to update course.");
      console.error("Error updating course:", err.response ? err.response.data : err.message);
      console.log("Catch block error for update:", err.message);
    }
  };

  const handleDeleteCourse = (course) => {
    console.log("handleDeleteCourse triggered with course:", course);
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
  console.log("confirmDelete triggered for course:", courseToDelete);
  try {
    const response = await fetch(`/api/instructor/courses/${courseToDelete._id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });


    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to delete course');
    }

    console.log("Course deleted:", courseToDelete);
    setCourses(courses.filter((course) => course._id !== courseToDelete._id));
    setShowDeleteModal(false);
    setCourseToDelete(null);
    navigate("/instructor/course");
    console.log("Courses after deletion:", courses);

  } catch (err) {
    const msg = err.message || "Unable to delete course.";
    setError(msg);
    console.error("Error deleting course:", msg);
  }
};

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge bg="success">Active</Badge>;
      case "draft":
        return <Badge bg="secondary">Draft</Badge>;
      case "completed":
        return <Badge bg="primary">Completed</Badge>;
      default:
        return (
          <Badge bg="light" text="dark">
            Unknown
          </Badge>
        );
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.instructorId?.profile?.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.subjectId?.name || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === "all" || course.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const totalLessons = (modules) => {
    return modules ? modules.reduce((total, module) => total + module.lessons.length, 0) : 0;
  };

  const containerStyle = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 50%, #8b5cf6 100%)",
    paddingTop: "0",
  };

  const headerStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
    padding: "1rem 0",
  };

  const statsBarStyle = {
    background: "#fbbf24",
    color: "#000",
    padding: "1rem 0",
  };

  const cardStyle = {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    border: "none",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
  };

  return (
    <div className="instructor-course">
      <Header />
      <div style={containerStyle}>
        <div style={headerStyle}>
          <Container>
            <Row className="align-items-center">
              <Col>
                <div className="d-flex align-items-center">
                  <div className="p-2 rounded me-3" style={{ background: "rgba(255, 255, 255, 0.2)" }}>
                    <BookOpen className="text-white" size={24} />
                  </div>
                  <div>
                    <h1 className="text-white mb-0 h2 fw-bold">Course Management</h1>
                    <p className="text-white-50 mb-0 small">List of all courses in the system</p>
                  </div>
                </div>
              </Col>
              <Col xs="auto">
                <Button
                  style={{ background: "#fbbf24", border: "none", color: "#000" }}
                  className="fw-semibold"
                  onClick={handleAddCourse}
                >
                  <Plus size={16} className="me-2" />
                  Add Course
                </Button>
              </Col>
            </Row>
          </Container>
        </div>

        <div style={statsBarStyle}>
          <Container>
            <Row className="align-items-center">
              <Col>
                <div className="d-flex align-items-center">
                  <div className="d-flex align-items-center me-4">
                    <BookOpen size={20} className="me-2" />
                    <span className="fw-semibold">Total Courses: {courses.length}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <GraduationCap size={20} className="me-2" />
                    <span className="fw-semibold">
                      Active: {courses.filter((c) => c.status === "active").length}
                    </span>
                  </div>
                </div>
              </Col>
              <Col xs="auto">
                <small>Last Updated: {new Date().toLocaleDateString("en-US")}</small>
              </Col>
            </Row>
          </Container>
        </div>

        <Container className="py-4">
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          {loading && <Alert variant="info">Loading course list...</Alert>}

          <Row className="mb-4">
            <Col md={8}>
              <div className="position-relative">
                <Search
                  className="position-absolute text-muted"
                  size={16}
                  style={{ left: "12px", top: "50%", transform: "translateY(-50%)" }}
                />
                <Form.Control
                  type="text"
                  placeholder="Search courses, instructors, or subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    paddingLeft: "40px",
                    background: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                  }}
                />
              </div>
            </Col>
            <Col md={4}>
              <Dropdown>
                <Dropdown.Toggle
                  variant="outline-light"
                  style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    color: "#000",
                  }}
                  className="w-100"
                >
                  <Filter size={16} className="me-2" />
                  Filter by Status
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setFilterStatus("all")}>All</Dropdown.Item>
                  <Dropdown.Item onClick={() => setFilterStatus("active")}>Active</Dropdown.Item>
                  <Dropdown.Item onClick={() => setFilterStatus("draft")}>Draft</Dropdown.Item>
                  <Dropdown.Item onClick={() => setFilterStatus("completed")}>Completed</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>

          {loading ? null : filteredCourses.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card style={cardStyle}>
                <Card.Body className="text-center py-5">
                  <div className="p-4 rounded-circle d-inline-flex mb-3" style={{ background: "#f8f9fa" }}>
                    <BookOpen size={32} className="text-muted" />
                  </div>
                  <h3 className="h5 fw-semibold text-dark mb-2">No Courses Found</h3>
                  <p className="text-muted mb-3">
                    {searchTerm
                      ? "No courses match the search criteria."
                      : "No courses have been created yet."}
                  </p>
                  {!searchTerm && (
                    <Button style={{ background: "#fbbf24", border: "none", color: "#000" }} onClick={handleAddCourse}>
                      <Plus size={16} className="me-2" />
                      Create Your First Course
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </motion.div>
          ) : (
            <Row>
              {filteredCourses.map((course, index) => (
                <Col lg={4} md={6} className="mb-4" key={course._id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card
                      style={cardStyle}
                      className="h-100"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-5px)";
                        e.currentTarget.style.boxShadow = "0 15px 35px rgba(0, 0, 0, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.1)";
                      }}
                    >
                      <Card.Header className="border-0 pb-2">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <Card.Title className="h5 fw-bold text-dark mb-1">{course.title}</Card.Title>
                            <div className="d-flex align-items-center text-muted small">
                              <span>{course.subjectId?.code || "N/A"}</span>
                              <span className="mx-2">•</span>
                              <span>{course.credits || 0} credits</span>
                            </div>
                          </div>
                          {getStatusBadge(course.status)}
                        </div>
                      </Card.Header>
                      <Card.Body className="pt-0">
                        <p
                          className="text-muted small mb-3"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {course.description || "No description available"}
                        </p>

                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-2 small">
                            <User size={14} className="text-muted me-2" />
                            <span className="text-muted">{course.instructorId?.profile?.fullName || "Unknown"}</span>
                          </div>
                          <div className="d-flex align-items-center mb-2 small">
                            <Calendar size={14} className="text-muted me-2" />
                            <span className="text-muted">
                              {formatDate(course.startDate)} - {formatDate(course.endDate)}
                            </span>
                          </div>
                          <div className="d-flex align-items-center small">
                            <BookOpen size={14} className="text-muted me-2" />
                            <span className="text-muted">
                              {course.modules?.length || 0} modules • {totalLessons(course.modules)} lessons
                            </span>
                          </div>
                        </div>

                        <div className="d-flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            className="flex-grow-1"
                            style={{ background: "#6366f1", border: "none" }}
                            onClick={() => handleViewCourse(course._id)}
                          >
                            <Eye size={14} className="me-1" />
                            Details
                          </Button>
                          <Button
                            size="sm"
                            style={{ background: "#fbbf24", border: "none", color: "#000" }}
                            onClick={() => handleEditCourse(course._id)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDeleteCourse(course)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          )}
        </Container>

        <AddCourseModal show={showAddModal} onHide={() => setShowAddModal(false)} onSubmit={()=>  window.location.reload()} />
        <EditCourseModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          onSubmit={handleSubmitEditCourse}
          courseData={courseToEdit}
        />
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Course Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="warning" className="mb-3">
              <strong>Warning!</strong> This action cannot be undone.
            </Alert>
            <p>
              Are you sure you want to delete the course <strong>"{courseToDelete?.title || "Unknown"}"</strong>? All related
              data will be permanently deleted.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete Course
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default CourseList;