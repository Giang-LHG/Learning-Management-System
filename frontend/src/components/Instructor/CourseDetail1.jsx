"use client"

import { useState } from "react"
import { Container, Row, Col, Card, Button, Badge, Modal, Alert, Table, Form, Nav, Tab } from "react-bootstrap"
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
    FileText,
    Clock,
    CheckCircle,
    Eye,
    BarChart3,
} from "lucide-react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import Header from "../header/Header"
import EditCourseModal from "./EditCourseModal"

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

// Dữ liệu mẫu assignments
const assignmentsData = [
    {
        _id: "64f8a1b2c3d4e5f6a7b8c9a1",
        courseId: "64f8a1b2c3d4e5f6a7b8c9d0",
        title: "Bài tập React Components",
        description: "Tạo một ứng dụng React đơn giản với các components cơ bản",
        type: "essay",
        dueDate: "2024-03-15T23:59:59.000Z",
        isVisible: true,
        term: ["Học kỳ 2", "2023-2024"],
        createdAt: "2024-02-10T08:00:00.000Z",
        submissions: 15,
        totalStudents: 25,
    },
    {
        _id: "64f8a1b2c3d4e5f6a7b8c9a2",
        courseId: "64f8a1b2c3d4e5f6a7b8c9d0",
        title: "Quiz: JavaScript ES6",
        description: "Kiểm tra kiến thức về các tính năng mới của JavaScript ES6",
        type: "quiz",
        dueDate: "2024-03-20T23:59:59.000Z",
        isVisible: true,
        term: ["Học kỳ 2", "2023-2024"],
        questions: [
            {
                questionId: "q1",
                text: "Arrow function trong ES6 có đặc điểm gì?",
                options: [
                    { key: "A", text: "Không có context riêng" },
                    { key: "B", text: "Có thể hoisting" },
                    { key: "C", text: "Luôn return undefined" },
                    { key: "D", text: "Không thể sử dụng với callback" },
                ],
                correctOption: "A",
                points: 2,
            },
            {
                questionId: "q2",
                text: "Destructuring assignment được sử dụng để làm gì?",
                options: [
                    { key: "A", text: "Tạo object mới" },
                    { key: "B", text: "Trích xuất dữ liệu từ array/object" },
                    { key: "C", text: "Xóa thuộc tính object" },
                    { key: "D", text: "Sao chép array" },
                ],
                correctOption: "B",
                points: 2,
            },
        ],
        createdAt: "2024-02-12T10:00:00.000Z",
        submissions: 22,
        totalStudents: 25,
    },
    {
        _id: "64f8a1b2c3d4e5f6a7b8c9a3",
        courseId: "64f8a1b2c3d4e5f6a7b8c9d0",
        title: "Project: Todo App với React",
        description: "Xây dựng một ứng dụng Todo hoàn chỉnh sử dụng React hooks và local storage",
        type: "essay",
        dueDate: "2024-04-01T23:59:59.000Z",
        isVisible: false,
        term: ["Học kỳ 2", "2023-2024"],
        createdAt: "2024-02-15T14:00:00.000Z",
        submissions: 0,
        totalStudents: 25,
    },
]

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
    const [assignments, setAssignments] = useState(assignmentsData)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showStudentsModal, setShowStudentsModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [students, setStudents] = useState(enrolledStudents)
    const [searchStudent, setSearchStudent] = useState("")
    const [studentToRemove, setStudentToRemove] = useState(null)
    const [showRemoveStudentModal, setShowRemoveStudentModal] = useState(false)
    const [activeTab, setActiveTab] = useState("overview")
    const navigate = useNavigate()

    const handleEdit = () => {
        setShowEditModal(true)
    }

    const handleSaveEdit = (updatedCourseData) => {
        // Update course with edited data
        setCourse({
            ...course,
            ...updatedCourseData,
            updatedAt: new Date().toISOString(),
        })
        console.log("Khóa học đã được cập nhật:", updatedCourseData)
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

    const isOverdue = (dueDate) => {
        return new Date(dueDate) < new Date()
    }

    const getDaysUntilDue = (dueDate) => {
        const now = new Date()
        const due = new Date(dueDate)
        const diffTime = due - now
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const getAssignmentStatusBadge = (assignment) => {
        if (!assignment.isVisible) {
            return <Badge bg="secondary">Ẩn</Badge>
        }

        if (isOverdue(assignment.dueDate)) {
            return <Badge bg="danger">Quá hạn</Badge>
        }

        const daysLeft = getDaysUntilDue(assignment.dueDate)
        if (daysLeft <= 3) {
            return <Badge bg="warning">Sắp hết hạn</Badge>
        }

        return <Badge bg="success">Đang mở</Badge>
    }

    const getSubmissionRate = (assignment) => {
        if (assignment.totalStudents === 0) return 0
        return Math.round((assignment.submissions / assignment.totalStudents) * 100)
    }

    const totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0)
    const totalAssignments = assignments.length
    const activeAssignments = assignments.filter((a) => a.isVisible && !isOverdue(a.dueDate)).length

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

    const filteredStudents = students.filter(
        (student) =>
            student.profile.fullName.toLowerCase().includes(searchStudent.toLowerCase()) ||
            student.email.toLowerCase().includes(searchStudent.toLowerCase()) ||
            student.username.toLowerCase().includes(searchStudent.toLowerCase()),
    )

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

                            {/* Tabs Navigation */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <Card style={cardStyle}>
                                    <Card.Header className="border-0 pb-0">
                                        <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab}>
                                            <Nav.Item>
                                                <Nav.Link eventKey="overview" className="d-flex align-items-center">
                                                    <BookOpen size={16} className="me-2" />
                                                    Nội dung khóa học
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="assignments" className="d-flex align-items-center">
                                                    <FileText size={16} className="me-2" />
                                                    Bài tập ({totalAssignments})
                                                </Nav.Link>
                                            </Nav.Item>
                                        </Nav>
                                    </Card.Header>
                                    <Card.Body>
                                        <Tab.Content>
                                            {/* Overview Tab */}
                                            <Tab.Pane active={activeTab === "overview"}>
                                                <div className="d-flex align-items-center justify-content-between mb-3">
                                                    <div className="d-flex align-items-center">
                                                        <BookOpen size={20} className="me-2" />
                                                        <h5 className="mb-0">Chương trình học</h5>
                                                    </div>
                                                    <Badge bg="secondary">{course.modules.length} chương</Badge>
                                                </div>
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
                                            </Tab.Pane>

                                            {/* Assignments Tab */}
                                            <Tab.Pane active={activeTab === "assignments"}>
                                                <div className="d-flex align-items-center justify-content-between mb-4">
                                                    <div className="d-flex align-items-center">
                                                        <FileText size={20} className="me-2" />
                                                        <h5 className="mb-0">Danh sách bài tập</h5>
                                                    </div>
                                                    <Button style={{ background: "#fbbf24", border: "none", color: "#000" }} size="sm">
                                                        <Plus size={16} className="me-2" />
                                                        Thêm bài tập
                                                    </Button>
                                                </div>

                                                {assignments.length === 0 ? (
                                                    <div className="text-center py-5">
                                                        <div className="p-4 rounded-circle d-inline-flex mb-3" style={{ background: "#f8f9fa" }}>
                                                            <FileText size={32} className="text-muted" />
                                                        </div>
                                                        <h5 className="text-muted mb-2">Chưa có bài tập nào</h5>
                                                        <p className="text-muted mb-3">Tạo bài tập đầu tiên để học sinh có thể luyện tập</p>
                                                        <Button style={{ background: "#fbbf24", border: "none", color: "#000" }}>
                                                            <Plus size={16} className="me-2" />
                                                            Tạo bài tập đầu tiên
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="d-grid gap-3">
                                                        {assignments.map((assignment, index) => (
                                                            <motion.div
                                                                key={assignment._id}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                                            >
                                                                <Card className="border">
                                                                    <Card.Body>
                                                                        <Row className="align-items-center">
                                                                            <Col md={8}>
                                                                                <div className="d-flex align-items-start">
                                                                                    <div
                                                                                        className="p-2 rounded me-3 flex-shrink-0"
                                                                                        style={{
                                                                                            background: assignment.type === "quiz" ? "#e0f2fe" : "#f3e8ff",
                                                                                        }}
                                                                                    >
                                                                                        {assignment.type === "quiz" ? (
                                                                                            <CheckCircle size={20} style={{ color: "#0891b2" }} />
                                                                                        ) : (
                                                                                            <FileText size={20} style={{ color: "#7c3aed" }} />
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="flex-grow-1">
                                                                                        <div className="d-flex align-items-center gap-2 mb-1">
                                                                                            <h6 className="fw-semibold mb-0">{assignment.title}</h6>
                                                                                            {getAssignmentStatusBadge(assignment)}
                                                                                            <Badge
                                                                                                bg={assignment.type === "quiz" ? "info" : "primary"}
                                                                                                className="small"
                                                                                            >
                                                                                                {assignment.type === "quiz" ? "Trắc nghiệm" : "Tự luận"}
                                                                                            </Badge>
                                                                                        </div>
                                                                                        <p className="text-muted small mb-2 lh-sm">{assignment.description}</p>
                                                                                        <div className="d-flex align-items-center gap-3 small text-muted">
                                                                                            <div className="d-flex align-items-center">
                                                                                                <Clock size={14} className="me-1" />
                                                                                                <span>
                                                                                                    Hạn nộp: {formatDateTime(assignment.dueDate)}
                                                                                                    {!isOverdue(assignment.dueDate) && (
                                                                                                        <span className="ms-1">
                                                                                                            ({getDaysUntilDue(assignment.dueDate)} ngày)
                                                                                                        </span>
                                                                                                    )}
                                                                                                </span>
                                                                                            </div>
                                                                                            {assignment.type === "quiz" && assignment.questions && (
                                                                                                <div className="d-flex align-items-center">
                                                                                                    <FileText size={14} className="me-1" />
                                                                                                    <span>{assignment.questions.length} câu hỏi</span>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </Col>
                                                                            <Col md={4}>
                                                                                <div className="text-end">
                                                                                    <div className="mb-2">
                                                                                        <div className="d-flex align-items-center justify-content-end gap-2 mb-1">
                                                                                            <BarChart3 size={14} className="text-muted" />
                                                                                            <span className="small text-muted">Tỷ lệ nộp bài</span>
                                                                                        </div>
                                                                                        <div className="d-flex align-items-center justify-content-end">
                                                                                            <div className="progress me-2" style={{ width: "60px", height: "6px" }}>
                                                                                                <div
                                                                                                    className="progress-bar"
                                                                                                    style={{
                                                                                                        width: `${getSubmissionRate(assignment)}%`,
                                                                                                        backgroundColor:
                                                                                                            getSubmissionRate(assignment) >= 80
                                                                                                                ? "#16a34a"
                                                                                                                : getSubmissionRate(assignment) >= 50
                                                                                                                    ? "#eab308"
                                                                                                                    : "#dc2626",
                                                                                                    }}
                                                                                                />
                                                                                            </div>
                                                                                            <span className="small fw-medium">
                                                                                                {assignment.submissions}/{assignment.totalStudents}(
                                                                                                {getSubmissionRate(assignment)}%)
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="d-flex gap-1 justify-content-end">
                                                                                        <Button variant="outline-primary" size="sm" title="Xem chi tiết">
                                                                                            <Eye size={14} />
                                                                                        </Button>
                                                                                        <Button variant="outline-secondary" size="sm" title="Chỉnh sửa">
                                                                                            <Edit size={14} />
                                                                                        </Button>
                                                                                        <Button variant="outline-danger" size="sm" title="Xóa">
                                                                                            <Trash2 size={14} />
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>
                                                                            </Col>
                                                                        </Row>
                                                                    </Card.Body>
                                                                </Card>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                )}
                                            </Tab.Pane>
                                        </Tab.Content>
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
                                                <span className="fw-medium">Số bài tập:</span>
                                                <span className="h4 fw-bold mb-0">{totalAssignments}</span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="fw-medium">Số tín chỉ:</span>
                                                <span className="h4 fw-bold mb-0">{course.credits}</span>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </motion.div>

                            {/* Assignment Stats Card */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <Card style={cardStyle} className="mb-4">
                                    <Card.Header className="border-0">
                                        <Card.Title className="h5 mb-0 d-flex align-items-center">
                                            <FileText size={18} className="me-2" />
                                            Thống kê bài tập
                                        </Card.Title>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="d-grid gap-3">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="fw-medium">Đang mở:</span>
                                                <Badge bg="success" className="fs-6">
                                                    {activeAssignments}
                                                </Badge>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="fw-medium">Quá hạn:</span>
                                                <Badge bg="danger" className="fs-6">
                                                    {assignments.filter((a) => isOverdue(a.dueDate)).length}
                                                </Badge>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="fw-medium">Bản nháp:</span>
                                                <Badge bg="secondary" className="fs-6">
                                                    {assignments.filter((a) => !a.isVisible).length}
                                                </Badge>
                                            </div>
                                            <hr className="my-2" />
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="fw-medium">Tỷ lệ nộp bài trung bình:</span>
                                                <span className="fw-bold text-primary">
                                                    {assignments.length > 0
                                                        ? Math.round(
                                                            assignments.reduce((acc, a) => acc + getSubmissionRate(a), 0) / assignments.length,
                                                        )
                                                        : 0}
                                                    %
                                                </span>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </motion.div>

                            {/* Course Info Card */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
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
                <EditCourseModal
                    show={showEditModal}
                    onHide={() => setShowEditModal(false)}
                    onSubmit={handleSaveEdit}
                    courseData={course}
                />

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
