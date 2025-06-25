"use client"

import { useState } from "react"
import { Container, Row, Col, Card, Button, Form, Badge, Modal, Dropdown, Alert } from "react-bootstrap"
import { Plus, Eye, Edit, Trash2, Calendar, User, BookOpen, GraduationCap, Search, Filter } from "lucide-react"
import { motion } from "framer-motion"
import Header from "../header/Header"
import AddCourseModal from "./AddCourseModal"
import { useNavigate } from "react-router-dom"

// Dữ liệu mẫu các khóa học
const coursesData = [
  {
    _id: "64f8a1b2c3d4e5f6a7b8c9d0",
    title: "Lập Trình Web Nâng Cao",
    description: "Khóa học chuyên sâu về phát triển ứng dụng web hiện đại với React, Node.js và MongoDB.",
    instructorId: {
      _id: "64f8a1b2c3d4e5f6a7b8c9d1",
      name: "Nguyễn Văn An",
      email: "nguyenvanan@example.com",
    },
    subjectId: {
      _id: "64f8a1b2c3d4e5f6a7b8c9d2",
      name: "Công Nghệ Thông Tin",
      code: "CNTT",
    },
    startDate: "2024-02-01",
    endDate: "2024-06-30",
    credits: 3,
    term: ["Học kỳ 2", "2023-2024"],
    modules: [
      { moduleId: "1", title: "Giới thiệu React", lessons: [{}, {}] },
      { moduleId: "2", title: "State Management", lessons: [{}] },
    ],
    createdAt: "2024-01-15T08:00:00.000Z",
    status: "active",
  },
  {
    _id: "64f8a1b2c3d4e5f6a7b8c9d3",
    title: "Cơ Sở Dữ Liệu",
    description: "Học về thiết kế và quản lý cơ sở dữ liệu quan hệ, SQL và NoSQL.",
    instructorId: {
      _id: "64f8a1b2c3d4e5f6a7b8c9d4",
      name: "Trần Thị Bình",
      email: "tranthibinh@example.com",
    },
    subjectId: {
      _id: "64f8a1b2c3d4e5f6a7b8c9d2",
      name: "Công Nghệ Thông Tin",
      code: "CNTT",
    },
    startDate: "2024-03-01",
    endDate: "2024-07-15",
    credits: 4,
    term: ["Học kỳ 2", "2023-2024"],
    modules: [
      { moduleId: "3", title: "SQL Cơ bản", lessons: [{}, {}, {}] },
      { moduleId: "4", title: "Thiết kế CSDL", lessons: [{}, {}] },
    ],
    createdAt: "2024-01-20T09:00:00.000Z",
    status: "active",
  },
  {
    _id: "64f8a1b2c3d4e5f6a7b8c9d5",
    title: "Trí Tuệ Nhân Tạo",
    description: "Khóa học về machine learning, deep learning và các ứng dụng AI.",
    instructorId: {
      _id: "64f8a1b2c3d4e5f6a7b8c9d6",
      name: "Lê Văn Cường",
      email: "levancuong@example.com",
    },
    subjectId: {
      _id: "64f8a1b2c3d4e5f6a7b8c9d7",
      name: "Khoa Học Máy Tính",
      code: "KHMT",
    },
    startDate: "2024-02-15",
    endDate: "2024-06-15",
    credits: 3,
    term: ["Học kỳ 2", "2023-2024"],
    modules: [
      { moduleId: "5", title: "Machine Learning", lessons: [{}, {}, {}, {}] },
      { moduleId: "6", title: "Deep Learning", lessons: [{}, {}, {}] },
    ],
    createdAt: "2024-01-25T10:00:00.000Z",
    status: "draft",
  },
  {
    _id: "64f8a1b2c3d4e5f6a7b8c9d8",
    title: "Phát Triển Mobile",
    description: "Học phát triển ứng dụng di động với React Native và Flutter.",
    instructorId: {
      _id: "64f8a1b2c3d4e5f6a7b8c9d9",
      name: "Phạm Thị Dung",
      email: "phamthidung@example.com",
    },
    subjectId: {
      _id: "64f8a1b2c3d4e5f6a7b8c9d2",
      name: "Công Nghệ Thông Tin",
      code: "CNTT",
    },
    startDate: "2024-04-01",
    endDate: "2024-08-30",
    credits: 3,
    term: ["Học kỳ 3", "2023-2024"],
    modules: [
      { moduleId: "7", title: "React Native", lessons: [{}, {}] },
      { moduleId: "8", title: "Flutter", lessons: [{}, {}, {}] },
    ],
    createdAt: "2024-02-01T11:00:00.000Z",
    status: "active",
  },
]

const CourseList = () => {
  const [courses, setCourses] = useState(coursesData)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState(null)
  const navigate = useNavigate()

  const handleAddCourse = () => {
    setShowAddModal(true)
  }

  const handleSubmitCourse = (courseData) => {
    // Generate new course with ID
    const newCourse = {
      _id: Date.now().toString(),
      ...courseData,
      createdAt: new Date().toISOString(),
      status: "draft",
      // Mock populate instructor and subject data
      instructorId: {
        _id: courseData.instructorId,
        name: "Nguyễn Văn An", // This would come from API
        email: "nguyenvanan@example.com",
      },
      subjectId: {
        _id: courseData.subjectId,
        name: "Công Nghệ Thông Tin", // This would come from API
        code: "CNTT",
      },
    }

    setCourses((prev) => [newCourse, ...prev])
    console.log("Khóa học mới được tạo:", newCourse)
  }

  const handleViewCourse = (courseId) => {
    navigate(`/instructor/course/${courseId}`)
    console.log("Xem chi tiết khóa học:", courseId)
  }

  const handleEditCourse = (courseId) => {
    console.log("Chỉnh sửa khóa học:", courseId)
  }

  const handleDeleteCourse = (course) => {
    setCourseToDelete(course)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (courseToDelete) {
      setCourses(courses.filter((course) => course._id !== courseToDelete._id))
      setShowDeleteModal(false)
      setCourseToDelete(null)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge bg="success">Đang hoạt động</Badge>
      case "draft":
        return <Badge bg="secondary">Bản nháp</Badge>
      case "completed":
        return <Badge bg="primary">Hoàn thành</Badge>
      default:
        return (
          <Badge bg="light" text="dark">
            Không xác định
          </Badge>
        )
    }
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructorId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.subjectId.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "all" || course.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const totalLessons = (modules) => {
    return modules.reduce((total, module) => total + module.lessons.length, 0)
  }

  const containerStyle = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 50%, #8b5cf6 100%)",
    paddingTop: "0",
  }

  const headerStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
    padding: "1rem 0",
  }

  const statsBarStyle = {
    background: "#fbbf24",
    color: "#000",
    padding: "1rem 0",
  }

  const cardStyle = {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    border: "none",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
  }

  return (
    <div className="instructor-course">
      <Header />
      <div style={containerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <Container>
            <Row className="align-items-center">
              <Col>
                <div className="d-flex align-items-center">
                  <div className="p-2 rounded me-3" style={{ background: "rgba(255, 255, 255, 0.2)" }}>
                    <BookOpen className="text-white" size={24} />
                  </div>
                  <div>
                    <h1 className="text-white mb-0 h2 fw-bold">Quản Lý Khóa Học</h1>
                    <p className="text-white-50 mb-0 small">Danh sách tất cả khóa học trong hệ thống</p>
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
                  Thêm khóa học
                </Button>
              </Col>
            </Row>
          </Container>
        </div>

        {/* Stats Bar */}
        <div style={statsBarStyle}>
          <Container>
            <Row className="align-items-center">
              <Col>
                <div className="d-flex align-items-center">
                  <div className="d-flex align-items-center me-4">
                    <BookOpen size={20} className="me-2" />
                    <span className="fw-semibold">Tổng số khóa học: {courses.length}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <GraduationCap size={20} className="me-2" />
                    <span className="fw-semibold">
                      Đang hoạt động: {courses.filter((c) => c.status === "active").length}
                    </span>
                  </div>
                </div>
              </Col>
              <Col xs="auto">
                <small>Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}</small>
              </Col>
            </Row>
          </Container>
        </div>

        {/* Main Content */}
        <Container className="py-4">
          {/* Search and Filter */}
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
                  placeholder="Tìm kiếm khóa học, giảng viên, môn học..."
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
                  Lọc theo trạng thái
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setFilterStatus("all")}>Tất cả</Dropdown.Item>
                  <Dropdown.Item onClick={() => setFilterStatus("active")}>Đang hoạt động</Dropdown.Item>
                  <Dropdown.Item onClick={() => setFilterStatus("draft")}>Bản nháp</Dropdown.Item>
                  <Dropdown.Item onClick={() => setFilterStatus("completed")}>Hoàn thành</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>

          {/* Course Grid */}
          {filteredCourses.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card style={cardStyle}>
                <Card.Body className="text-center py-5">
                  <div className="p-4 rounded-circle d-inline-flex mb-3" style={{ background: "#f8f9fa" }}>
                    <BookOpen size={32} className="text-muted" />
                  </div>
                  <h3 className="h5 fw-semibold text-dark mb-2">Không tìm thấy khóa học</h3>
                  <p className="text-muted mb-3">
                    {searchTerm
                      ? "Không có khóa học nào phù hợp với từ khóa tìm kiếm."
                      : "Chưa có khóa học nào được tạo."}
                  </p>
                  {!searchTerm && (
                    <Button style={{ background: "#fbbf24", border: "none", color: "#000" }} onClick={handleAddCourse}>
                      <Plus size={16} className="me-2" />
                      Tạo khóa học đầu tiên
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
                        e.currentTarget.style.transform = "translateY(-5px)"
                        e.currentTarget.style.boxShadow = "0 15px 35px rgba(0, 0, 0, 0.15)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)"
                        e.currentTarget.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.1)"
                      }}
                    >
                      <Card.Header className="border-0 pb-2">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <Card.Title className="h5 fw-bold text-dark mb-1">{course.title}</Card.Title>
                            <div className="d-flex align-items-center text-muted small">
                              <span>{course.subjectId.code}</span>
                              <span className="mx-2">•</span>
                              <span>{course.credits} tín chỉ</span>
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
                          {course.description}
                        </p>

                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-2 small">
                            <User size={14} className="text-muted me-2" />
                            <span className="text-muted">{course.instructorId.name}</span>
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
                              {course.modules.length} chương • {totalLessons(course.modules)} bài học
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
                            Chi tiết
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

        {/* Add Course Modal */}
        <AddCourseModal show={showAddModal} onHide={() => setShowAddModal(false)} onSubmit={handleSubmitCourse} />

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Xác nhận xóa khóa học</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="warning" className="mb-3">
              <strong>Cảnh báo!</strong> Hành động này không thể hoàn tác.
            </Alert>
            <p>
              Bạn có chắc chắn muốn xóa khóa học <strong>"{courseToDelete?.title}"</strong>? Tất cả dữ liệu liên quan sẽ
              bị xóa vĩnh viễn.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Hủy
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Xóa khóa học
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  )
}

export default CourseList
