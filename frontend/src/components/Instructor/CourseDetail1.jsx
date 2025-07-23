"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Tab, Tabs, ListGroup } from "react-bootstrap"
import {
    ArrowLeft,
    BookOpen,
    Users,
    Calendar,
    Clock,
    Award,
    Eye,
    EyeOff,
    Edit,
    Plus,
    BarChart3,
    FileText,
    CheckCircle,
} from "lucide-react"
import { motion } from "framer-motion"
import Header from "../header/Header"
import api from "../../utils/api"
import assignmentService from "../../services/assignmentService"

const CourseDetail1 = () => {
    const { id: courseId } = useParams()
    const navigate = useNavigate()
    const [courseDetail, setCourseDetail] = useState(null)
    const [assignments, setAssignments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState("overview")
    const [showLessonModal, setShowLessonModal] = useState(false)
    const [selectedLesson, setSelectedLesson] = useState(null)

    useEffect(() => {
        fetchCourseDetail()
        fetchAssignments()
    }, [courseId])

    const fetchCourseDetail = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/instructor/courses/${courseId}`)
            if (response.data.success) {
                setCourseDetail(response.data.data)
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
            // Don't set error for assignments, just log it
        }
    }

    const handleBack = () => {
        navigate("/instructor/course")
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString("vi-VN", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const toggleAssignmentVisibility = async (assignmentId, currentVisibility) => {
        try {
            await assignmentService.toggleAssignmentVisibility(assignmentId, !currentVisibility)
            fetchAssignments() // Refresh assignments after update
        } catch (err) {
            console.error("Error toggling assignment visibility:", err)
            setError("Không thể cập nhật trạng thái hiển thị assignment")
        }
    }

    if (loading) {
        return (
            <div className="instructor-course-detail">
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

    if (error) {
        return (
            <div className="instructor-course-detail">
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

    if (!courseDetail) {
        return (
            <div className="instructor-course-detail">
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

    const cardStyle = {
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        borderRadius: "10px",
    }

    return (
        <div className="instructor-course-detail">
            <Header />
            <Container className="py-4">
                {/* Header */}
                <div className="d-flex align-items-center mb-4">
                    <Button variant="outline-primary" className="me-3" onClick={handleBack}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                            <h1 className="mb-0 me-3">{courseDetail.title}</h1>
                            {getStatusBadge(courseDetail.status)}
                        </div>
                        <div className="text-muted">
                            <span className="me-4">
                                {courseDetail.subjectId?.name} • {courseDetail.subjectId?.code}
                            </span>
                            <span className="me-4">{courseDetail.credits || 0} tín chỉ</span>
                        </div>
                    </div>
                    <Button variant="primary">
                        <Plus size={16} className="me-2" />
                        Chỉnh sửa
                    </Button>
                </div>

                {/* Statistics Cards */}
                <Row className="mb-4">
                    <Col md={3} className="mb-3">
                        <Card className="text-center h-100">
                            <Card.Body>
                                <Users className="text-primary mb-2" size={32} />
                                <h3 className="h4 text-primary mb-1">{courseDetail.statistics?.totalEnrollments || 0}</h3>
                                <p className="text-muted mb-0 small">Học viên</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3} className="mb-3">
                        <Card className="text-center h-100">
                            <Card.Body>
                                <BookOpen className="text-success mb-2" size={32} />
                                <h3 className="h4 text-success mb-1">{courseDetail.modules?.length || 0}</h3>
                                <p className="text-muted mb-0 small">Chương học</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3} className="mb-3">
                        <Card className="text-center h-100">
                            <Card.Body>
                                <FileText className="text-warning mb-2" size={32} />
                                <h3 className="h4 text-warning mb-1">
                                    {courseDetail.modules?.reduce((total, module) => total + (module.lessons?.length || 0), 0) || 0}
                                </h3>
                                <p className="text-muted mb-0 small">Bài học</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} md={6} className="mb-4">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <Card style={cardStyle} className="text-center h-100">
                                <Card.Body className="p-4">
                                    <div className="d-flex align-items-center justify-content-center mb-3">
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center"
                                            style={{
                                                width: "60px",
                                                height: "60px",
                                                background: "linear-gradient(135deg, #17a2b8, #6f42c1)",
                                            }}
                                        >
                                            <FileText size={28} className="text-white" />
                                        </div>
                                    </div>
                                    <h2 className="h1 fw-bold text-info mb-1">{assignments.length}</h2>
                                    <p className="text-muted mb-0">Assignments</p>
                                    <div className="mt-2">
                                        <Award size={16} className="me-1 text-info" />
                                        <small className="text-info">
                                            {assignments.filter((a) => a.isVisible !== false).length} đang hiển thị
                                        </small>
                                    </div>
                                </Card.Body>
                            </Card>
                        </motion.div>
                    </Col>
                </Row>

                {/* Main Content Tabs */}
                <Card>
                    <Card.Body className="p-0">
                        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="px-3 pt-3" fill>
                            <Tab eventKey="overview" title="Tổng quan">
                                <div className="p-3">
                                    <Row>
                                        <Col md={8}>
                                            <h5 className="fw-bold mb-3">Mô tả khóa học</h5>
                                            <p className="text-muted mb-4">{courseDetail.description || "Chưa có mô tả cho khóa học này."}</p>

                                            <h5 className="fw-bold mb-3">Thông tin chi tiết</h5>
                                            <Row>
                                                <Col sm={6} className="mb-3">
                                                    <div className="d-flex align-items-center">
                                                        <Calendar className="text-muted me-2" size={16} />
                                                        <div>
                                                            <small className="text-muted d-block">Thời gian học</small>
                                                            <span className="fw-semibold">
                                                                {formatDate(courseDetail.startDate)} - {formatDate(courseDetail.endDate)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col sm={6} className="mb-3">
                                                    <div className="d-flex align-items-center">
                                                        <Clock className="text-muted me-2" size={16} />
                                                        <div>
                                                            <small className="text-muted d-block">Kỳ học</small>
                                                            <span className="fw-semibold">
                                                                {Array.isArray(courseDetail.term)
                                                                    ? courseDetail.term.join(", ")
                                                                    : courseDetail.term || "Chưa xác định"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col md={4}>
                                            <h5 className="fw-bold mb-3">Thống kê</h5>
                                            <ListGroup variant="flush">
                                                <ListGroup.Item className="d-flex justify-content-between px-0">
                                                    <span>Học viên đang học:</span>
                                                    <Badge bg="success">{courseDetail.statistics?.activeEnrollments || 0}</Badge>
                                                </ListGroup.Item>
                                                <ListGroup.Item className="d-flex justify-content-between px-0">
                                                    <span>Ngày tạo:</span>
                                                    <span>{formatDateTime(courseDetail.createdAt)}</span>
                                                </ListGroup.Item>
                                                <ListGroup.Item className="d-flex justify-content-between px-0">
                                                    <span>Cập nhật cuối:</span>
                                                    <span>{formatDateTime(courseDetail.updatedAt)}</span>
                                                </ListGroup.Item>
                                            </ListGroup>
                                        </Col>
                                    </Row>
                                </div>
                            </Tab>

                            <Tab eventKey="modules" title={`Nội dung (${courseDetail.modules?.length || 0})`}>
                                <div className="p-3">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="fw-bold mb-0">Danh sách chương học</h5>
                                        <Button variant="primary" size="sm">
                                            <Plus size={16} className="me-1" />
                                            Thêm chương
                                        </Button>
                                    </div>

                                    {courseDetail.modules && courseDetail.modules.length > 0 ? (
                                        <div className="list-group">
                                            {courseDetail.modules.map((module, index) => (
                                                <div key={module.moduleId} className="list-group-item">
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div className="flex-grow-1">
                                                            <h6 className="fw-semibold mb-1">{module.title}</h6>
                                                            <small className="text-muted">
                                                                {module.lessons?.length || 0} bài học
                                                                {module.isVisible === false && (
                                                                    <Badge bg="secondary" className="ms-2">
                                                                        Ẩn
                                                                    </Badge>
                                                                )}
                                                            </small>
                                                            {module.lessons && module.lessons.length > 0 && (
                                                                <div className="mt-2">
                                                                    {module.lessons.map((lesson) => (
                                                                        <div key={lesson.lessonId} className="d-flex align-items-center mb-1">
                                                                            <FileText size={14} className="text-muted me-2" />
                                                                            <span className="small">{lesson.title}</span>
                                                                            {lesson.isVisible === false && (
                                                                                <Badge bg="secondary" className="ms-2 small">
                                                                                    Ẩn
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <BookOpen size={48} className="text-muted mb-3" />
                                            <h5 className="text-muted mb-2">Chưa có chương học nào</h5>
                                            <p className="text-muted mb-3">Bắt đầu tạo nội dung cho khóa học của bạn</p>
                                            <Button variant="primary">
                                                <Plus size={16} className="me-1" />
                                                Tạo chương đầu tiên
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Tab>

                            <Tab
                                eventKey="assignments"
                                title={
                                    <span className="d-flex align-items-center">
                                        <FileText size={18} className="me-2" />
                                        <span className="fw-semibold">Assignments ({assignments.length})</span>
                                    </span>
                                }
                            >
                                <div className="p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div>
                                            <h4 className="fw-bold mb-1">Danh sách Assignments</h4>
                                            <p className="text-muted mb-0">Quản lý bài tập và đánh giá cho khóa học</p>
                                        </div>
                                        <Button
                                            style={{
                                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                border: "none",
                                                color: "white",
                                            }}
                                            className="rounded-pill px-4"
                                        >
                                            <Plus size={16} className="me-2" />
                                            Thêm Assignment
                                        </Button>
                                    </div>

                                    {assignments.length > 0 ? (
                                        <div className="d-grid gap-3">
                                            {assignments.map((assignment, index) => (
                                                <Card key={assignment._id} className="border-0 shadow-sm">
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
                                                                            <Badge bg={assignment.type === "quiz" ? "info" : "primary"} className="small">
                                                                                {assignment.type === "quiz" ? "Trắc nghiệm" : "Tự luận"}
                                                                            </Badge>
                                                                            {assignment.isVisible === false && (
                                                                                <Badge bg="secondary" className="small">
                                                                                    Ẩn
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-muted small mb-2 lh-sm">{assignment.description}</p>
                                                                        <div className="d-flex align-items-center gap-3 small text-muted">
                                                                            <div className="d-flex align-items-center">
                                                                                <Clock size={14} className="me-1" />
                                                                                <span>Hạn nộp: {formatDateTime(assignment.dueDate)}</span>
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
                                                                    <div className="d-flex gap-1 justify-content-end">
                                                                        <Button
                                                                            variant="outline-secondary"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                toggleAssignmentVisibility(assignment._id, assignment.isVisible !== false)
                                                                            }
                                                                            title={assignment.isVisible !== false ? "Ẩn assignment" : "Hiển thị assignment"}
                                                                        >
                                                                            {assignment.isVisible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                                                                        </Button>
                                                                        <Button variant="outline-primary" size="sm" title="Chỉnh sửa">
                                                                            <Edit size={14} />
                                                                        </Button>
                                                                        <Button variant="outline-info" size="sm" title="Xem chi tiết">
                                                                            <BarChart3 size={14} />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                    </Card.Body>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <div
                                                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
                                                style={{
                                                    width: "100px",
                                                    height: "100px",
                                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                }}
                                            >
                                                <FileText size={48} className="text-white" />
                                            </div>
                                            <h4 className="fw-bold mb-3">Chưa có assignment nào</h4>
                                            <p className="text-muted mb-4 lead">
                                                Tạo assignment đầu tiên để học sinh có thể luyện tập và đánh giá
                                            </p>
                                            <Button
                                                style={{
                                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                    border: "none",
                                                    color: "white",
                                                }}
                                                size="lg"
                                                className="rounded-pill px-5"
                                            >
                                                <Plus size={20} className="me-2" />
                                                Tạo Assignment đầu tiên
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Tab>

                            <Tab eventKey="students" title={`Học viên (${courseDetail.statistics?.totalEnrollments || 0})`}>
                                <div className="p-3">
                                    <div className="text-center py-5">
                                        <Users size={48} className="text-muted mb-3" />
                                        <h5 className="text-muted mb-2">Danh sách học viên</h5>
                                        <p className="text-muted">Chức năng này sẽ được phát triển trong phiên bản tiếp theo</p>
                                    </div>
                                </div>
                            </Tab>
                        </Tabs>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    )
}

export default CourseDetail1
