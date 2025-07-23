"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Container, Row, Col, Card, Button, Badge, Modal, Alert, Table, Form, Nav, Tab, Spinner } from "react-bootstrap"
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
import Header from "../header/Header"
import EditCourseModal from "./EditCourseModal"
import AssignmentDetailModal from "./assignment-detail-modal"
import api from "../../utils/api"
import assignmentService from "../../services/assignmentService"

const CourseDetail = () => {
    const { id: courseId } = useParams()
    const navigate = useNavigate()

    // State for course data
    const [course, setCourse] = useState(null)
    const [assignments, setAssignments] = useState([])
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showStudentsModal, setShowStudentsModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showRemoveStudentModal, setShowRemoveStudentModal] = useState(false)
    const [showAssignmentDetail, setShowAssignmentDetail] = useState(false)

    // Other states
    const [searchStudent, setSearchStudent] = useState("")
    const [studentToRemove, setStudentToRemove] = useState(null)
    const [activeTab, setActiveTab] = useState("overview")
    const [selectedAssignment, setSelectedAssignment] = useState(null)

    useEffect(() => {
        if (courseId) {
            fetchCourseDetail()
            fetchAssignments()
            fetchEnrolledStudents()
        }
    }, [courseId])

    const fetchCourseDetail = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/instructor/courses/${courseId}`)
            if (response.data.success) {
                setCourse(response.data.data)
            } else {
                setError(response.data.message || "Không thể tải chi tiết khóa học")
            }
        } catch (err) {
            console.error("Error fetching course detail:", err)
            setError("Có lỗi xảy ra khi tải chi tiết khóa học")
        } finally {
            setLoading(false)
        }
    }

    const fetchAssignments = async () => {
        try {
            const response = await assignmentService.getAssignmentsByCourse(courseId)
            if (response.success) {
                setAssignments(response.data || [])
            }
        } catch (err) {
            console.error("Error fetching assignments:", err)
        }
    }

    const fetchEnrolledStudents = async () => {
        try {
            const response = await api.get(`/instructor/courses/${courseId}/students`)
            if (response.data.success) {
                setStudents(response.data.data || [])
            }
        } catch (err) {
            console.error("Error fetching enrolled students:", err)
        }
    }

    const handleEdit = () => {
        setShowEditModal(true)
    }

    const handleSaveEdit = async (updatedCourseData) => {
        try {
            const response = await api.put(`/instructor/courses/${courseId}`, updatedCourseData)
            if (response.data.success) {
                setCourse({
                    ...course,
                    ...updatedCourseData,
                    updatedAt: new Date().toISOString(),
                })
                console.log("Khóa học đã được cập nhật:", updatedCourseData)
            }
        } catch (err) {
            console.error("Error updating course:", err)
            setError("Không thể cập nhật khóa học")
        }
    }

    const handleDelete = async () => {
        try {
            const response = await api.delete(`/instructor/courses/${courseId}`)
            if (response.data.success) {
                console.log("Xóa khóa học:", courseId)
                navigate("/instructor/course")
            }
        } catch (err) {
            console.error("Error deleting course:", err)
            setError("Không thể xóa khóa học")
        }
        setShowDeleteModal(false)
    }

    const handleBack = () => {
        navigate(`/instructor/course`)
    }

    const handleViewAssignmentDetail = (assignment) => {
        setSelectedAssignment(assignment)
        setShowAssignmentDetail(true)
    }

    const handleToggleAssignmentVisibility = async (assignmentId, currentVisibility) => {
        try {
            await assignmentService.toggleAssignmentVisibility(assignmentId, !currentVisibility)
            fetchAssignments() // Refresh assignments
        } catch (err) {
            console.error("Error toggling assignment visibility:", err)
            setError("Không thể cập nhật trạng thái hiển thị assignment")
        }
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
        if (!assignment.totalStudents || assignment.totalStudents === 0) return 0
        return Math.round((assignment.submissions / assignment.totalStudents) * 100)
    }

    const handleShowStudents = () => {
        setShowStudentsModal(true)
    }

    const handleRemoveStudent = (student) => {
        setStudentToRemove(student)
        setShowRemoveStudentModal(true)
    }

    const confirmRemoveStudent = async () => {
        if (studentToRemove) {
            try {
                const response = await api.delete(`/instructor/courses/${courseId}/students/${studentToRemove._id}`)
                if (response.data.success) {
                    setStudents(students.filter((student) => student._id !== studentToRemove._id))
                    setShowRemoveStudentModal(false)
                    setStudentToRemove(null)
                }
            } catch (err) {
                console.error("Error removing student:", err)
                setError("Không thể xóa học sinh khỏi khóa học")
            }
        }
    }

    const filteredStudents = students.filter(
        (student) =>
            student.profile?.fullName?.toLowerCase().includes(searchStudent.toLowerCase()) ||
            student.email?.toLowerCase().includes(searchStudent.toLowerCase()) ||
            student.username?.toLowerCase().includes(searchStudent.toLowerCase()),
    )

    const handleDeleteAssignment = async (assignmentId) => {
        try {
            const response = await assignmentService.deleteAssignment(assignmentId)
            if (response.success) {
                setAssignments(assignments.filter((assignment) => assignment._id !== assignmentId))
                console.log("Assignment deleted successfully")
            } else {
                console.error("Failed to delete assignment:", response.message)
                setError(response.message || "Failed to delete assignment")
            }
        } catch (error) {
            console.error("Error deleting assignment:", error)
            setError("Error deleting assignment")
        }
    }

    // Loading state
    if (loading) {
        return (
            <div>
                <Header />
                <Container className="py-5">
                    <div className="text-center">
                        <Spinner animation="border" variant="primary" size="lg" />
                        <p className="mt-3 h5">Đang tải chi tiết khóa học...</p>
                    </div>
                </Container>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div>
                <Header />
                <Container className="py-5">
                    <Alert variant="danger" className="text-center">
                        <h5>Có lỗi xảy ra</h5>
                        <p>{error}</p>
                        <Button variant="outline-danger" onClick={handleBack}>
                            <ArrowLeft size={16} className="me-2" />
                            Quay lại danh sách khóa học
                        </Button>
                    </Alert>
                </Container>
            </div>
        )
    }

    // No course found
    if (!course) {
        return (
            <div>
                <Header />
                <Container className="py-5">
                    <Alert variant="warning" className="text-center">
                        <h5>Không tìm thấy khóa học</h5>
                        <Button variant="outline-warning" onClick={handleBack}>
                            <ArrowLeft size={16} className="me-2" />
                            Quay lại danh sách khóa học
                        </Button>
                    </Alert>
                </Container>
            </div>
        )
    }

    const totalLessons = course.modules?.reduce((total, module) => total + (module.lessons?.length || 0), 0) || 0
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
                                                        {course.subjectId?.name}
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
                                                        <span className="fw-medium text-dark">{course.instructorId?.name}</span>
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
                                                    <Badge bg="secondary">{course.modules?.length || 0} chương</Badge>
                                                </div>
                                                <div className="d-grid gap-3">
                                                    {course.modules && course.modules.length > 0 ? (
                                                        course.modules.map((module, index) => (
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
                                                                    {module.lessons && module.lessons.length > 0 ? (
                                                                        module.lessons.map((lesson, lessonIndex) => (
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
                                                                        ))
                                                                    ) : (
                                                                        <div className="text-muted small">Chưa có bài học nào</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-5">
                                                            <BookOpen size={48} className="text-muted mb-3" />
                                                            <h5 className="text-muted mb-2">Chưa có chương học nào</h5>
                                                            <p className="text-muted mb-3">Bắt đầu tạo nội dung cho khóa học của bạn</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </Tab.Pane>

                                            {/* Assignments Tab */}
                                            <Tab.Pane active={activeTab === "assignments"}>
                                                <div className="d-flex align-items-center justify-content-between mb-4">
                                                    <div className="d-flex align-items-center">
                                                        <FileText size={20} className="me-2" />
                                                        <h5 className="mb-0">Danh sách bài tập</h5>
                                                    </div>
                                                    <Button
                                                        style={{ background: "#fbbf24", border: "none", color: "#000" }}
                                                        size="sm"
                                                        onClick={() => navigate(`/instructor/assignments/create/${courseId}`)}
                                                    >
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
                                                        <Button
                                                            style={{ background: "#fbbf24", border: "none", color: "#000" }}
                                                            onClick={() => navigate(`/instructor/assignments/create/${courseId}`)}
                                                        >
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
                                                                                                {assignment.submissions || 0}/{students.length}(
                                                                                                {getSubmissionRate(assignment)}%)
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="d-flex gap-1 justify-content-end">
                                                                                        <Button
                                                                                            variant="outline-primary"
                                                                                            size="sm"
                                                                                            title="Xem chi tiết"
                                                                                            onClick={() => handleViewAssignmentDetail(assignment)}
                                                                                        >
                                                                                            <Eye size={14} />
                                                                                        </Button>
                                                                                        <Button
                                                                                            variant="outline-secondary"
                                                                                            size="sm"
                                                                                            title="Chỉnh sửa"
                                                                                            onClick={() => navigate(`/instructor/assignments/edit/${assignment._id}`)}
                                                                                        >
                                                                                            <Edit size={14} />
                                                                                        </Button>
                                                                                        <Button
                                                                                            variant="outline-danger"
                                                                                            size="sm"
                                                                                            title="Xóa"
                                                                                            onClick={() => handleDeleteAssignment(assignment._id)}
                                                                                        >
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
                                                <span className="h4 fw-bold mb-0">{course.modules?.length || 0}</span>
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
                                                <span className="fw-medium">{course.subjectId?.code}</span>
                                            </div>
                                            <div>
                                                <small className="text-muted d-block mb-1">Email giảng viên</small>
                                                <span className="fw-medium text-primary">{course.instructorId?.email}</span>
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

                {/* Assignment Detail Modal */}
                <AssignmentDetailModal
                    show={showAssignmentDetail}
                    onHide={() => setShowAssignmentDetail(false)}
                    assignment={selectedAssignment}
                    students={students}
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
                                                                student.profile?.avatarUrl ||
                                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(student.profile?.fullName || student.username)}&background=6366f1&color=fff`
                                                            }
                                                            alt={student.profile?.fullName || student.username}
                                                            className="rounded-circle me-3"
                                                            style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                                        />
                                                        <div>
                                                            <div className="fw-semibold">{student.profile?.fullName || student.username}</div>
                                                            <small className="text-muted">@{student.username}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>
                                                        <div className="small">{student.email}</div>
                                                        <Badge bg={student.profile?.parentIds?.length > 0 ? "info" : "secondary"} className="small">
                                                            {student.profile?.parentIds?.length > 0 ? "Có phụ huynh" : "Độc lập"}
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
                                    Bạn có chắc chắn muốn xóa học sinh{" "}
                                    <strong>"{studentToRemove.profile?.fullName || studentToRemove.username}"</strong> khỏi khóa học này?
                                </p>
                                <div className="d-flex align-items-center p-3 rounded" style={{ background: "#f8f9fa" }}>
                                    <img
                                        src={
                                            studentToRemove.profile?.avatarUrl ||
                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(studentToRemove.profile?.fullName || studentToRemove.username)}&background=6366f1&color=fff`
                                        }
                                        alt={studentToRemove.profile?.fullName || studentToRemove.username}
                                        className="rounded-circle me-3"
                                        style={{ width: "50px", height: "50px", objectFit: "cover" }}
                                    />
                                    <div>
                                        <div className="fw-semibold">{studentToRemove.profile?.fullName || studentToRemove.username}</div>
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
