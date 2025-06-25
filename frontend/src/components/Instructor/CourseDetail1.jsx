"use client"

import { useState } from "react"
import { Container, Row, Col, Card, Button, Badge, Modal, Alert, Table, Form, Accordion } from "react-bootstrap"
import {
    ArrowLeft,
    Edit,
    Trash2,
    Calendar,
    User,
    BookOpen,
    GraduationCap,
    Users,
    Search,
    X,
    Plus,
    Save,
    Eye,
    EyeOff,
} from "lucide-react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import Header from "../header/Header"
// Dữ liệu mẫu khóa học
const courseData = {
    _id: "64f8a1b2c3d4e5f6a7b8c9d0",
    title: "Lập Trình Web Nâng Cao",
    description:
        "Khóa học chuyên sâu về phát triển ứng dụng web hiện đại với React, Node.js và MongoDB. Học viên sẽ được thực hành xây dựng các dự án thực tế và làm việc với các công nghệ mới nhất trong ngành.",
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
        {
            moduleId: "64f8a1b2c3d4e5f6a7b8c9d3",
            title: "Giới thiệu về React",
            isVisible: true,
            lessons: [
                {
                    lessonId: "64f8a1b2c3d4e5f6a7b8c9d4",
                    title: "Cài đặt và thiết lập môi trường",
                    content: "Hướng dẫn cài đặt Node.js, npm và tạo project React đầu tiên",
                    isVisible: true,
                },
                {
                    lessonId: "64f8a1b2c3d4e5f6a7b8c9d5",
                    title: "JSX và Components",
                    content: "Tìm hiểu về JSX syntax và cách tạo components trong React",
                    isVisible: true,
                },
            ],
        },
        {
            moduleId: "64f8a1b2c3d4e5f6a7b8c9d6",
            title: "State Management",
            isVisible: true,
            lessons: [
                {
                    lessonId: "64f8a1b2c3d4e5f6a7b8c9d7",
                    title: "useState và useEffect",
                    content: "Quản lý state và side effects trong React",
                    isVisible: true,
                },
            ],
        },
    ],
    createdAt: "2024-01-15T08:00:00.000Z",
    updatedAt: "2024-01-20T10:30:00.000Z",
}

// Thêm dữ liệu mẫu học sinh tham gia khóa học
const enrolledStudents = [
    {
        _id: "64f8a1b2c3d4e5f6a7b8c9e1",
        username: "nguyenvana",
        email: "nguyenvana@student.edu.vn",
        role: "student",
        profile: {
            fullName: "Nguyễn Văn A",
            avatarUrl: "https://i.pravatar.cc/150?img=1",
            parentIds: ["64f8a1b2c3d4e5f6a7b8c9f1"],
        },
        enrolledAt: "2024-02-05T08:00:00.000Z",
        createdAt: "2024-01-10T08:00:00.000Z",
    },
    {
        _id: "64f8a1b2c3d4e5f6a7b8c9e2",
        username: "tranthib",
        email: "tranthib@student.edu.vn",
        role: "student",
        profile: {
            fullName: "Trần Thị B",
            avatarUrl: "https://i.pravatar.cc/150?img=2",
            parentIds: ["64f8a1b2c3d4e5f6a7b8c9f2"],
        },
        enrolledAt: "2024-02-03T09:30:00.000Z",
        createdAt: "2024-01-08T10:00:00.000Z",
    },
    {
        _id: "64f8a1b2c3d4e5f6a7b8c9e3",
        username: "levancuong",
        email: "levancuong@student.edu.vn",
        role: "student",
        profile: {
            fullName: "Lê Văn Cường",
            avatarUrl: "https://i.pravatar.cc/150?img=3",
            parentIds: [],
        },
        enrolledAt: "2024-02-01T14:15:00.000Z",
        createdAt: "2024-01-05T11:30:00.000Z",
    },
    {
        _id: "64f8a1b2c3d4e5f6a7b8c9e4",
        username: "phamthidung",
        email: "phamthidung@student.edu.vn",
        role: "student",
        profile: {
            fullName: "Phạm Thị Dung",
            avatarUrl: "https://i.pravatar.cc/150?img=4",
            parentIds: ["64f8a1b2c3d4e5f6a7b8c9f4"],
        },
        enrolledAt: "2024-02-07T16:45:00.000Z",
        createdAt: "2024-01-12T09:20:00.000Z",
    },
    {
        _id: "64f8a1b2c3d4e5f6a7b8c9e5",
        username: "hoangvane",
        email: "hoangvane@student.edu.vn",
        role: "student",
        profile: {
            fullName: "Hoàng Văn E",
            avatarUrl: "https://i.pravatar.cc/150?img=5",
            parentIds: ["64f8a1b2c3d4e5f6a7b8c9f5"],
        },
        enrolledAt: "2024-02-10T10:00:00.000Z",
        createdAt: "2024-01-15T13:45:00.000Z",
    },
]

const CourseDetail = () => {
    const [course, setCourse] = useState(courseData)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showStudentsModal, setShowStudentsModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [students, setStudents] = useState(enrolledStudents)
    const [searchStudent, setSearchStudent] = useState("")
    const [studentToRemove, setStudentToRemove] = useState(null)
    const [showRemoveStudentModal, setShowRemoveStudentModal] = useState(false)
    const navigate = useNavigate();
    // Edit form states
    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        credits: 0,
        term: [],
        modules: [],
    })

    const handleEdit = () => {
        // Initialize edit form with current course data
        setEditForm({
            title: course.title,
            description: course.description,
            startDate: course.startDate,
            endDate: course.endDate,
            credits: course.credits,
            term: course.term,
            modules: [...course.modules],
        })
        setShowEditModal(true)
    }

    const handleSaveEdit = () => {
        // Update course with edited data
        setCourse({
            ...course,
            ...editForm,
            updatedAt: new Date().toISOString(),
        })
        setShowEditModal(false)
        console.log("Khóa học đã được cập nhật:", editForm)
    }

    const handleDelete = () => {
        console.log("Xóa khóa học:", course._id)
        setShowDeleteModal(false)
    }

    const handleBack = () => {
        navigate(`/instructor/course`)
        console.log("Quay lại danh sách")
    }

    const formatDate = (dateString) => {
        if (!dateString) return "Chưa xác định"
        try {
            return new Date(dateString).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })
        } catch (error) {
            console.error("Error formatting date:", error)
            return "Ngày không hợp lệ"
        }
    }

    const formatDateForInput = (dateString) => {
        if (!dateString) return ""
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) {
                return ""
            }
            return date.toISOString().split("T")[0]
        } catch (error) {
            console.error("Error formatting date for input:", error)
            return ""
        }
    }

    const totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0)

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

    const cardStyle = {
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        border: "none",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    }

    const statsCardStyle = {
        background: "#fbbf24",
        color: "#000",
        border: "none",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    }

    const handleShowStudents = () => {
        setShowStudentsModal(true)
    }

    const handleRemoveStudent = (student) => {
        setStudentToRemove(student)
        setShowRemoveStudentModal(true)
    }

    const confirmRemoveStudent = () => {
        if (studentToRemove) {
            setStudents(students.filter((student) => student._id !== studentToRemove._id))
            setShowRemoveStudentModal(false)
            setStudentToRemove(null)
        }
    }

    const formatDateTime = (dateString) => {
        if (!dateString) return "Chưa xác định"
        try {
            return new Date(dateString).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
        } catch (error) {
            console.error("Error formatting datetime:", error)
            return "Thời gian không hợp lệ"
        }
    }

    const filteredStudents = students.filter(
        (student) =>
            student.profile.fullName.toLowerCase().includes(searchStudent.toLowerCase()) ||
            student.email.toLowerCase().includes(searchStudent.toLowerCase()) ||
            student.username.toLowerCase().includes(searchStudent.toLowerCase()),
    )

    // Module management functions
    const addModule = () => {
        const newModule = {
            moduleId: Date.now().toString(),
            title: "Chương mới",
            isVisible: true,
            lessons: [],
        }
        setEditForm({
            ...editForm,
            modules: [...editForm.modules, newModule],
        })
    }

    const updateModule = (moduleIndex, field, value) => {
        const updatedModules = [...editForm.modules]
        updatedModules[moduleIndex] = {
            ...updatedModules[moduleIndex],
            [field]: value,
        }
        setEditForm({
            ...editForm,
            modules: updatedModules,
        })
    }

    const removeModule = (moduleIndex) => {
        const updatedModules = editForm.modules.filter((_, index) => index !== moduleIndex)
        setEditForm({
            ...editForm,
            modules: updatedModules,
        })
    }

    const addLesson = (moduleIndex) => {
        const newLesson = {
            lessonId: Date.now().toString(),
            title: "Bài học mới",
            content: "",
            isVisible: true,
        }
        const updatedModules = [...editForm.modules]
        updatedModules[moduleIndex].lessons.push(newLesson)
        setEditForm({
            ...editForm,
            modules: updatedModules,
        })
    }

    const updateLesson = (moduleIndex, lessonIndex, field, value) => {
        const updatedModules = [...editForm.modules]
        updatedModules[moduleIndex].lessons[lessonIndex] = {
            ...updatedModules[moduleIndex].lessons[lessonIndex],
            [field]: value,
        }
        setEditForm({
            ...editForm,
            modules: updatedModules,
        })
    }

    const removeLesson = (moduleIndex, lessonIndex) => {
        const updatedModules = [...editForm.modules]
        updatedModules[moduleIndex].lessons = updatedModules[moduleIndex].lessons.filter(
            (_, index) => index !== lessonIndex,
        )
        setEditForm({
            ...editForm,
            modules: updatedModules,
        })
    }

    return (
        <div>
            <Header />
            <div style={containerStyle}>
                {/* Header */}
                <div style={headerStyle}>
                    <Container>
                        <Row className="align-items-center">
                            <Col>
                                <div className="d-flex align-items-center">
                                    <Button variant="link" className="text-white p-0 me-3 text-decoration-none" onClick={handleBack}>
                                        <ArrowLeft size={20} className="me-2" />
                                        Quay lại
                                    </Button>
                                    <div
                                        style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.3)" }}
                                        className="me-3"
                                    ></div>
                                    <h1 className="text-white mb-0 h4 fw-semibold">Chi Tiết Khóa Học</h1>
                                </div>
                            </Col>
                            <Col xs="auto">
                                <div className="d-flex gap-2">
                                    <Button variant="info" onClick={handleShowStudents} className="text-white">
                                        <Users size={16} className="me-2" />
                                        Học sinh ({students.length})
                                    </Button>
                                    <Button
                                        style={{ background: "#fbbf24", border: "none", color: "#000" }}
                                        className="fw-semibold"
                                        onClick={handleEdit}
                                    >
                                        <Edit size={16} className="me-2" />
                                        Chỉnh sửa
                                    </Button>
                                    <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                                        <Trash2 size={16} className="me-2" />
                                        Xóa
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>

                {/* Main Content */}
                <Container className="py-4">
                    <Row>
                        {/* Course Information */}
                        <Col lg={8} className="mb-4">
                            {/* Basic Info Card */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                <Card style={cardStyle} className="mb-4">
                                    <Card.Header className="border-0 pb-2">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <Card.Title className="h3 fw-bold text-dark mb-2">{course.title}</Card.Title>
                                                <div className="d-flex align-items-center gap-3 text-muted">
                                                    <div className="d-flex align-items-center">
                                                        <BookOpen size={16} className="me-1" />
                                                        {course.subjectId.name}
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                        <GraduationCap size={16} className="me-1" />
                                                        {course.credits} tín chỉ
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge bg="warning" text="dark" className="fs-6">
                                                {Array.isArray(course.term) ? course.term.join(" - ") : course.term}
                                            </Badge>
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="mb-4">
                                            <h5 className="fw-semibold text-dark mb-2">Mô tả khóa học</h5>
                                            <p className="text-muted lh-lg">{course.description}</p>
                                        </div>

                                        <hr />

                                        <Row>
                                            <Col md={6} className="mb-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="p-2 rounded me-3" style={{ background: "#e0e7ff" }}>
                                                        <User size={16} style={{ color: "#6366f1" }} />
                                                    </div>
                                                    <div>
                                                        <small className="text-muted d-block">Giảng viên</small>
                                                        <span className="fw-medium text-dark">{course.instructorId.name}</span>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md={6} className="mb-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="p-2 rounded me-3" style={{ background: "#dcfce7" }}>
                                                        <Calendar size={16} style={{ color: "#16a34a" }} />
                                                    </div>
                                                    <div>
                                                        <small className="text-muted d-block">Thời gian</small>
                                                        <span className="fw-medium text-dark">
                                                            {formatDate(course.startDate)} - {formatDate(course.endDate)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </motion.div>

                            {/* Modules Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Card style={cardStyle}>
                                    <Card.Header className="border-0">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div className="d-flex align-items-center">
                                                <BookOpen size={20} className="me-2" />
                                                <Card.Title className="mb-0 h5">Nội dung khóa học</Card.Title>
                                            </div>
                                            <Badge bg="secondary">{course.modules.length} chương</Badge>
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="d-grid gap-3">
                                            {course.modules.map((module, index) => (
                                                <div key={module.moduleId} className="p-3 rounded" style={{ background: "#f8f9fa" }}>
                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                        <h6 className="fw-semibold text-dark mb-0">
                                                            Chương {index + 1}: {module.title}
                                                        </h6>
                                                        <Badge bg={module.isVisible ? "success" : "secondary"}>
                                                            {module.isVisible ? "Hiển thị" : "Ẩn"}
                                                        </Badge>
                                                    </div>
                                                    <div className="d-grid gap-2">
                                                        {module.lessons.map((lesson, lessonIndex) => (
                                                            <div key={lesson.lessonId} className="d-flex align-items-center">
                                                                <div
                                                                    className="rounded-circle d-flex align-items-center justify-content-center me-3 fw-medium small"
                                                                    style={{
                                                                        width: "24px",
                                                                        height: "24px",
                                                                        background: "#e0e7ff",
                                                                        color: "#6366f1",
                                                                    }}
                                                                >
                                                                    {lessonIndex + 1}
                                                                </div>
                                                                <span className="text-muted small">{lesson.title}</span>
                                                                {!lesson.isVisible && (
                                                                    <Badge bg="light" text="dark" className="ms-2 small">
                                                                        Ẩn
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </motion.div>
                        </Col>

                        {/* Sidebar */}
                        <Col lg={4}>
                            {/* Stats Card */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <Card style={statsCardStyle} className="mb-4">
                                    <Card.Header className="border-0">
                                        <Card.Title className="h5 fw-bold mb-0">Thống kê khóa học</Card.Title>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="d-grid gap-3">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="fw-medium">Tổng số chương:</span>
                                                <span className="h4 fw-bold mb-0">{course.modules.length}</span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="fw-medium">Tổng số bài học:</span>
                                                <span className="h4 fw-bold mb-0">{totalLessons}</span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="fw-medium">Số tín chỉ:</span>
                                                <span className="h4 fw-bold mb-0">{course.credits}</span>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </motion.div>

                            {/* Course Info Card */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <Card style={cardStyle}>
                                    <Card.Header className="border-0">
                                        <Card.Title className="h5 mb-0">Thông tin bổ sung</Card.Title>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="d-grid gap-3">
                                            <div>
                                                <small className="text-muted d-block mb-1">Mã môn học</small>
                                                <span className="fw-medium">{course.subjectId.code}</span>
                                            </div>
                                            <div>
                                                <small className="text-muted d-block mb-1">Email giảng viên</small>
                                                <span className="fw-medium text-primary">{course.instructorId.email}</span>
                                            </div>
                                            <div>
                                                <small className="text-muted d-block mb-1">Ngày tạo</small>
                                                <span className="fw-medium">{formatDate(course.createdAt)}</span>
                                            </div>
                                            <div>
                                                <small className="text-muted d-block mb-1">Cập nhật lần cuối</small>
                                                <span className="fw-medium">{formatDate(course.updatedAt)}</span>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>

                {/* Edit Course Modal */}
                <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="xl" centered>
                    <Modal.Header closeButton>
                        <Modal.Title className="d-flex align-items-center">
                            <Edit size={20} className="me-2" />
                            Chỉnh sửa khóa học - {course.title}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                        <Form>
                            {/* Basic Information */}
                            <Card className="mb-4">
                                <Card.Header>
                                    <h5 className="mb-0">Thông tin cơ bản</h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col md={12} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Tên khóa học *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={editForm.title}
                                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                                    placeholder="Nhập tên khóa học"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={12} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Mô tả khóa học</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={4}
                                                    value={editForm.description}
                                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                    placeholder="Nhập mô tả khóa học"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Số tín chỉ *</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={editForm.credits}
                                                    onChange={(e) => setEditForm({ ...editForm, credits: Number.parseInt(e.target.value) || 0 })}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Ngày bắt đầu *</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    value={formatDateForInput(editForm.startDate)}
                                                    onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Ngày kết thúc *</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    value={formatDateForInput(editForm.endDate)}
                                                    onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Modules Management */}
                            <Card>
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">Quản lý chương học</h5>
                                    <Button variant="success" size="sm" onClick={addModule}>
                                        <Plus size={16} className="me-1" />
                                        Thêm chương
                                    </Button>
                                </Card.Header>
                                <Card.Body>
                                    {editForm.modules.length === 0 ? (
                                        <div className="text-center py-4">
                                            <BookOpen size={48} className="text-muted mb-3" />
                                            <h6 className="text-muted">Chưa có chương học nào</h6>
                                            <p className="text-muted small">Nhấn "Thêm chương" để bắt đầu tạo nội dung khóa học</p>
                                        </div>
                                    ) : (
                                        <Accordion>
                                            {editForm.modules.map((module, moduleIndex) => (
                                                <Accordion.Item key={module.moduleId} eventKey={moduleIndex.toString()}>
                                                    <Accordion.Header>
                                                        <div className="d-flex align-items-center justify-content-between w-100 me-3">
                                                            <span>
                                                                Chương {moduleIndex + 1}: {module.title}
                                                            </span>
                                                            <div className="d-flex align-items-center gap-2">
                                                                <Badge bg={module.isVisible ? "success" : "secondary"}>
                                                                    {module.isVisible ? "Hiển thị" : "Ẩn"}
                                                                </Badge>
                                                                <Badge bg="info">{module.lessons.length} bài học</Badge>
                                                            </div>
                                                        </div>
                                                    </Accordion.Header>
                                                    <Accordion.Body>
                                                        <Row className="mb-3">
                                                            <Col md={8}>
                                                                <Form.Group>
                                                                    <Form.Label>Tên chương *</Form.Label>
                                                                    <Form.Control
                                                                        type="text"
                                                                        value={module.title}
                                                                        onChange={(e) => updateModule(moduleIndex, "title", e.target.value)}
                                                                        placeholder="Nhập tên chương"
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={2}>
                                                                <Form.Group>
                                                                    <Form.Label>Hiển thị</Form.Label>
                                                                    <Form.Check
                                                                        type="switch"
                                                                        checked={module.isVisible}
                                                                        onChange={(e) => updateModule(moduleIndex, "isVisible", e.target.checked)}
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={2} className="d-flex align-items-end">
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    onClick={() => removeModule(moduleIndex)}
                                                                    className="w-100"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </Button>
                                                            </Col>
                                                        </Row>

                                                        <hr />

                                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                                            <h6 className="mb-0">Bài học</h6>
                                                            <Button variant="outline-primary" size="sm" onClick={() => addLesson(moduleIndex)}>
                                                                <Plus size={14} className="me-1" />
                                                                Thêm bài học
                                                            </Button>
                                                        </div>

                                                        {module.lessons.length === 0 ? (
                                                            <div className="text-center py-3" style={{ background: "#f8f9fa" }}>
                                                                <p className="text-muted small mb-0">Chưa có bài học nào trong chương này</p>
                                                            </div>
                                                        ) : (
                                                            <div className="d-grid gap-3">
                                                                {module.lessons.map((lesson, lessonIndex) => (
                                                                    <div key={lesson.lessonId} className="p-3 border rounded">
                                                                        <Row>
                                                                            <Col md={6}>
                                                                                <Form.Group className="mb-2">
                                                                                    <Form.Label className="small">Tên bài học *</Form.Label>
                                                                                    <Form.Control
                                                                                        type="text"
                                                                                        size="sm"
                                                                                        value={lesson.title}
                                                                                        onChange={(e) =>
                                                                                            updateLesson(moduleIndex, lessonIndex, "title", e.target.value)
                                                                                        }
                                                                                        placeholder="Nhập tên bài học"
                                                                                    />
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={4}>
                                                                                <Form.Group className="mb-2">
                                                                                    <Form.Label className="small">Hiển thị</Form.Label>
                                                                                    <div className="d-flex align-items-center">
                                                                                        <Form.Check
                                                                                            type="switch"
                                                                                            checked={lesson.isVisible}
                                                                                            onChange={(e) =>
                                                                                                updateLesson(moduleIndex, lessonIndex, "isVisible", e.target.checked)
                                                                                            }
                                                                                        />
                                                                                        {lesson.isVisible ? (
                                                                                            <Eye size={16} className="ms-2 text-success" />
                                                                                        ) : (
                                                                                            <EyeOff size={16} className="ms-2 text-muted" />
                                                                                        )}
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={2} className="d-flex align-items-start">
                                                                                <Button
                                                                                    variant="outline-danger"
                                                                                    size="sm"
                                                                                    onClick={() => removeLesson(moduleIndex, lessonIndex)}
                                                                                    className="w-100"
                                                                                >
                                                                                    <Trash2 size={12} />
                                                                                </Button>
                                                                            </Col>
                                                                            <Col md={12}>
                                                                                <Form.Group>
                                                                                    <Form.Label className="small">Nội dung bài học</Form.Label>
                                                                                    <Form.Control
                                                                                        as="textarea"
                                                                                        rows={2}
                                                                                        size="sm"
                                                                                        value={lesson.content}
                                                                                        onChange={(e) =>
                                                                                            updateLesson(moduleIndex, lessonIndex, "content", e.target.value)
                                                                                        }
                                                                                        placeholder="Nhập nội dung bài học"
                                                                                    />
                                                                                </Form.Group>
                                                                            </Col>
                                                                        </Row>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </Accordion.Body>
                                                </Accordion.Item>
                                            ))}
                                        </Accordion>
                                    )}
                                </Card.Body>
                            </Card>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="d-flex justify-content-between w-100 align-items-center">
                            <div className="text-muted small">
                                {editForm.modules.length} chương •{" "}
                                {editForm.modules.reduce((total, module) => total + module.lessons.length, 0)} bài học
                            </div>
                            <div className="d-flex gap-2">
                                <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                                    Hủy
                                </Button>
                                <Button style={{ background: "#fbbf24", border: "none", color: "#000" }} onClick={handleSaveEdit}>
                                    <Save size={16} className="me-2" />
                                    Lưu thay đổi
                                </Button>
                            </div>
                        </div>
                    </Modal.Footer>
                </Modal>

                {/* Students List Modal */}
                <Modal show={showStudentsModal} onHide={() => setShowStudentsModal(false)} size="lg" centered>
                    <Modal.Header closeButton>
                        <Modal.Title className="d-flex align-items-center">
                            <Users size={20} className="me-2" />
                            Danh sách học sinh - {course.title}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {/* Search */}
                        <div className="mb-3">
                            <div className="position-relative">
                                <Search
                                    className="position-absolute text-muted"
                                    size={16}
                                    style={{ left: "12px", top: "50%", transform: "translateY(-50%)" }}
                                />
                                <Form.Control
                                    type="text"
                                    placeholder="Tìm kiếm học sinh theo tên, email, username..."
                                    value={searchStudent}
                                    onChange={(e) => setSearchStudent(e.target.value)}
                                    style={{ paddingLeft: "40px" }}
                                />
                            </div>
                        </div>

                        {/* Stats */}
                        <div
                            className="d-flex justify-content-between align-items-center mb-3 p-3 rounded"
                            style={{ background: "#f8f9fa" }}
                        >
                            <div>
                                <strong>Tổng số học sinh: {students.length}</strong>
                            </div>
                            <div className="text-muted small">Kết quả tìm kiếm: {filteredStudents.length}</div>
                        </div>

                        {/* Students Table */}
                        {filteredStudents.length === 0 ? (
                            <div className="text-center py-4">
                                <Users size={48} className="text-muted mb-3" />
                                <h5 className="text-muted">
                                    {searchStudent ? "Không tìm thấy học sinh" : "Chưa có học sinh nào tham gia"}
                                </h5>
                                <p className="text-muted">
                                    {searchStudent
                                        ? "Thử thay đổi từ khóa tìm kiếm"
                                        : "Học sinh sẽ xuất hiện ở đây khi họ đăng ký khóa học"}
                                </p>
                            </div>
                        ) : (
                            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                                <Table hover responsive>
                                    <thead style={{ background: "#f8f9fa", position: "sticky", top: 0 }}>
                                        <tr>
                                            <th>Học sinh</th>
                                            <th>Thông tin liên hệ</th>
                                            <th>Ngày tham gia</th>
                                            <th className="text-center">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.map((student) => (
                                            <tr key={student._id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <img
                                                            src={
                                                                student.profile.avatarUrl ||
                                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(student.profile.fullName) || "/placeholder.svg"}&background=6366f1&color=fff`
                                                            }
                                                            alt={student.profile.fullName}
                                                            className="rounded-circle me-3"
                                                            style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                                        />
                                                        <div>
                                                            <div className="fw-semibold">{student.profile.fullName}</div>
                                                            <small className="text-muted">@{student.username}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>
                                                        <div className="small">{student.email}</div>
                                                        <Badge bg={student.profile.parentIds.length > 0 ? "info" : "secondary"} className="small">
                                                            {student.profile.parentIds.length > 0 ? "Có phụ huynh" : "Độc lập"}
                                                        </Badge>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="small">
                                                        <div>{formatDateTime(student.enrolledAt)}</div>
                                                        <div className="text-muted">
                                                            Tham gia {Math.ceil((new Date() - new Date(student.enrolledAt)) / (1000 * 60 * 60 * 24))}{" "}
                                                            ngày
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleRemoveStudent(student)}
                                                        title="Xóa học sinh khỏi khóa học"
                                                    >
                                                        <X size={14} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="d-flex justify-content-between w-100 align-items-center">
                            <div className="text-muted small">
                                Hiển thị {filteredStudents.length} / {students.length} học sinh
                            </div>
                            <Button variant="secondary" onClick={() => setShowStudentsModal(false)}>
                                Đóng
                            </Button>
                        </div>
                    </Modal.Footer>
                </Modal>

                {/* Remove Student Confirmation Modal */}
                <Modal show={showRemoveStudentModal} onHide={() => setShowRemoveStudentModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Xác nhận xóa học sinh</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Alert variant="warning" className="mb-3">
                            <strong>Cảnh báo!</strong> Học sinh sẽ bị xóa khỏi khóa học.
                        </Alert>
                        {studentToRemove && (
                            <div>
                                <p>
                                    Bạn có chắc chắn muốn xóa học sinh <strong>"{studentToRemove.profile.fullName}"</strong> khỏi khóa học
                                    này?
                                </p>
                                <div className="d-flex align-items-center p-3 rounded" style={{ background: "#f8f9fa" }}>
                                    <img
                                        src={
                                            studentToRemove.profile.avatarUrl ||
                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(studentToRemove.profile.fullName) || "/placeholder.svg"}&background=6366f1&color=fff`
                                        }
                                        alt={studentToRemove.profile.fullName}
                                        className="rounded-circle me-3"
                                        style={{ width: "50px", height: "50px", objectFit: "cover" }}
                                    />
                                    <div>
                                        <div className="fw-semibold">{studentToRemove.profile.fullName}</div>
                                        <div className="text-muted small">{studentToRemove.email}</div>
                                        <div className="text-muted small">Tham gia từ: {formatDateTime(studentToRemove.enrolledAt)}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowRemoveStudentModal(false)}>
                            Hủy
                        </Button>
                        <Button variant="danger" onClick={confirmRemoveStudent}>
                            Xóa học sinh
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Xác nhận xóa khóa học</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Alert variant="danger" className="mb-3">
                            <strong>Cảnh báo!</strong> Hành động này không thể hoàn tác.
                        </Alert>
                        <p>
                            Bạn có chắc chắn muốn xóa khóa học <strong>"{course.title}"</strong>? Tất cả dữ liệu liên quan sẽ bị xóa
                            vĩnh viễn.
                        </p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                            Hủy
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Xóa khóa học
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    )
}

export default CourseDetail
