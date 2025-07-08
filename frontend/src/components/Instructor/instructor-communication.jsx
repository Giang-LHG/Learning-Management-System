"use client"

import { useState } from "react"
import { Container, Row, Col, Card, Button, Modal, Form, Badge, Tab, Nav } from "react-bootstrap"
import {
    MessageCircle,
    Send,
    Users,
    Mail,
    Search,
    Reply,
    Trash2,
    Clock,
    AlertCircle,
    Megaphone,
    Eye,
    Edit,
    Filter,
    Paperclip,
} from "lucide-react"
import { motion } from "framer-motion"
import Header from "../header/Header"
// Mock data for messages and announcements
const mockMessages = [
    {
        id: "1",
        type: "received",
        from: {
            id: "student1",
            name: "Nguyễn Văn A",
            email: "nguyenvana@student.edu.vn",
            avatar: "https://i.pravatar.cc/150?img=1",
        },
        subject: "Thắc mắc về bài tập React Hooks",
        content:
            "Thầy ơi, em có thắc mắc về cách sử dụng useEffect trong bài tập. Em không hiểu tại sao component re-render liên tục. Thầy có thể giải thích giúp em được không ạ?",
        timestamp: "2024-03-15T14:30:00.000Z",
        isRead: false,
        course: "Lập Trình Web Nâng Cao",
        priority: "normal",
        hasAttachment: false,
    },
    {
        id: "2",
        type: "sent",
        to: {
            id: "student2",
            name: "Trần Thị B",
            email: "tranthib@student.edu.vn",
            avatar: "https://i.pravatar.cc/150?img=2",
        },
        subject: "Phản hồi về bài nộp",
        content:
            "Chào B, thầy đã xem bài làm của em. Nhìn chung em làm tốt, tuy nhiên cần chú ý thêm về error handling. Thầy đã gửi feedback chi tiết trong hệ thống.",
        timestamp: "2024-03-15T10:15:00.000Z",
        isRead: true,
        course: "Lập Trình Web Nâng Cao",
        priority: "normal",
        hasAttachment: true,
    },
    {
        id: "3",
        type: "received",
        from: {
            id: "student3",
            name: "Lê Văn Cường",
            email: "levancuong@student.edu.vn",
            avatar: "https://i.pravatar.cc/150?img=3",
        },
        subject: "Xin phép nghỉ học",
        content:
            "Thầy ơi, em xin phép nghỉ buổi học ngày mai vì có việc gia đình đột xuất. Em sẽ tự học bài và làm bài tập đầy đủ ạ.",
        timestamp: "2024-03-14T16:45:00.000Z",
        isRead: true,
        course: "Lập Trình Web Nâng Cao",
        priority: "high",
        hasAttachment: false,
    },
    {
        id: "4",
        type: "received",
        from: {
            id: "student4",
            name: "Phạm Thị Dung",
            email: "phamthidung@student.edu.vn",
            avatar: "https://i.pravatar.cc/150?img=4",
        },
        subject: "Hỏi về lịch thi cuối kỳ",
        content: "Thầy cho em hỏi lịch thi cuối kỳ đã được xác định chưa ạ? Em cần sắp xếp thời gian ôn tập.",
        timestamp: "2024-03-13T09:20:00.000Z",
        isRead: false,
        course: "Cơ Sở Dữ Liệu",
        priority: "normal",
        hasAttachment: false,
    },
]

const mockAnnouncements = [
    {
        id: "1",
        title: "Thông báo lịch thi cuối kỳ",
        content:
            "Lịch thi cuối kỳ môn Lập Trình Web Nâng Cao sẽ được tổ chức vào ngày 25/03/2024. Sinh viên cần chuẩn bị đầy đủ tài liệu và laptop cá nhân.",
        type: "important",
        targetAudience: "course-specific",
        courses: ["Lập Trình Web Nâng Cao"],
        createdAt: "2024-03-15T08:00:00.000Z",
        isPublished: true,
        views: 45,
        author: "Nguyễn Văn An",
    },
    {
        id: "2",
        title: "Cập nhật tài liệu học tập",
        content: "Đã cập nhật tài liệu mới về React Hooks trong thư viện. Các em vào xem và download về học nhé.",
        type: "normal",
        targetAudience: "course-specific",
        courses: ["Lập Trình Web Nâng Cao"],
        createdAt: "2024-03-14T14:20:00.000Z",
        isPublished: true,
        views: 32,
        author: "Nguyễn Văn An",
    },
    {
        id: "3",
        title: "Thay đổi lịch học tuần tới",
        content:
            "Do có công tác đột xuất, lịch học tuần tới sẽ được dời từ thứ 3 sang thứ 5 cùng giờ. Mong các em sắp xếp thời gian phù hợp.",
        type: "urgent",
        targetAudience: "all",
        courses: [],
        createdAt: "2024-03-13T16:30:00.000Z",
        isPublished: true,
        views: 67,
        author: "Nguyễn Văn An",
    },
]

const InstructorCommunication = () => {
    const [messages, setMessages] = useState(mockMessages)
    const [announcements, setAnnouncements] = useState(mockAnnouncements)
    const [activeTab, setActiveTab] = useState("messages")
    const [showComposeModal, setShowComposeModal] = useState(false)
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
    const [selectedMessage, setSelectedMessage] = useState(null)
    const [showMessageDetail, setShowMessageDetail] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState("all")
    const [filterPriority, setFilterPriority] = useState("all")

    const [composeForm, setComposeForm] = useState({
        to: "",
        subject: "",
        content: "",
        priority: "normal",
    })

    const [announcementForm, setAnnouncementForm] = useState({
        title: "",
        content: "",
        type: "normal",
        targetAudience: "all",
        courses: [],
    })

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getMessageIcon = (type, priority) => {
        if (type === "received") {
            return priority === "high" ? (
                <AlertCircle size={16} className="text-danger" />
            ) : (
                <Mail size={16} className="text-primary" />
            )
        }
        return <Send size={16} className="text-success" />
    }

    const getAnnouncementBadge = (type) => {
        switch (type) {
            case "urgent":
                return <Badge bg="danger">Khẩn cấp</Badge>
            case "important":
                return <Badge bg="warning">Quan trọng</Badge>
            default:
                return <Badge bg="info">Thông thường</Badge>
        }
    }

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case "high":
                return (
                    <Badge bg="danger" className="small">
                        Cao
                    </Badge>
                )
            case "urgent":
                return (
                    <Badge bg="danger" className="small">
                        Khẩn cấp
                    </Badge>
                )
            default:
                return null
        }
    }

    const unreadCount = messages.filter((m) => m.type === "received" && !m.isRead).length
    const totalMessages = messages.length
    const totalAnnouncements = announcements.length
    const totalViews = announcements.reduce((sum, a) => sum + a.views, 0)

    const filteredMessages = messages.filter((message) => {
        const matchesSearch =
            message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (message.from?.name || message.to?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = filterType === "all" || message.type === filterType
        const matchesPriority = filterPriority === "all" || message.priority === filterPriority
        return matchesSearch && matchesType && matchesPriority
    })

    const handleSendMessage = (e) => {
        e.preventDefault()
        console.log("Sending message:", composeForm)
        setShowComposeModal(false)
        setComposeForm({
            to: "",
            subject: "",
            content: "",
            priority: "normal",
        })
    }

    const handlePublishAnnouncement = (e) => {
        e.preventDefault()
        console.log("Publishing announcement:", announcementForm)
        setShowAnnouncementModal(false)
        setAnnouncementForm({
            title: "",
            content: "",
            type: "normal",
            targetAudience: "all",
            courses: [],
        })
    }

    const markAsRead = (messageId) => {
        setMessages(messages.map((msg) => (msg.id === messageId ? { ...msg, isRead: true } : msg)))
    }

    const handleViewMessage = (message) => {
        setSelectedMessage(message)
        setShowMessageDetail(true)
        if (message.type === "received" && !message.isRead) {
            markAsRead(message.id)
        }
    }

    // Styles matching the course page
    const containerStyle = {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 50%, #8b5cf6 100%)",
        paddingTop: "0",
    }

    const headerStyle = {
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
        padding: "2rem 0",
    }

    const statsBarStyle = {
        background: "#fbbf24",
        color: "#000",
        padding: "1rem 0",
        fontWeight: "600",
    }

    const cardStyle = {
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        border: "none",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        borderRadius: "12px",
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
                                <div className="d-flex align-items-center text-white">
                                    <div
                                        className="p-3 rounded-3 me-4"
                                        style={{ background: "rgba(255, 255, 255, 0.2)", backdropFilter: "blur(10px)" }}
                                    >
                                        <MessageCircle size={32} />
                                    </div>
                                    <div>
                                        <h1 className="mb-1 h2 fw-bold">Giao Tiếp Với Học Sinh</h1>
                                        <p className="mb-0 opacity-75">Quản lý tin nhắn và thông báo với học sinh</p>
                                    </div>
                                </div>
                            </Col>
                            <Col xs="auto">
                                <div className="d-flex gap-3">
                                    <Button variant="light" className="text-dark fw-semibold" onClick={() => setShowComposeModal(true)}>
                                        <MessageCircle size={16} className="me-2" />
                                        Soạn tin nhắn
                                    </Button>
                                    <Button
                                        style={{ background: "#fbbf24", border: "none", color: "#000" }}
                                        className="fw-semibold"
                                        onClick={() => setShowAnnouncementModal(true)}
                                    >
                                        <Megaphone size={16} className="me-2" />
                                        Tạo thông báo
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>

                {/* Stats Bar */}
                <div style={statsBarStyle}>
                    <Container>
                        <Row className="align-items-center">
                            <Col md={3}>
                                <div className="d-flex align-items-center">
                                    <Mail size={20} className="me-2" />
                                    <span>Tổng tin nhắn: {totalMessages}</span>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="d-flex align-items-center">
                                    <AlertCircle size={20} className="me-2" />
                                    <span>Chưa đọc: {unreadCount}</span>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="d-flex align-items-center">
                                    <Megaphone size={20} className="me-2" />
                                    <span>Thông báo: {totalAnnouncements}</span>
                                </div>
                            </Col>
                            <Col md={3} className="text-end">
                                <span>Cập nhật lần cuối: {formatTime(new Date().toISOString())}</span>
                            </Col>
                        </Row>
                    </Container>
                </div>

                {/* Main Content */}
                <Container className="py-4">
                    {/* Search and Filters */}
                    <Row className="mb-4">
                        <Col md={4}>
                            <div className="position-relative">
                                <Search
                                    className="position-absolute text-muted"
                                    size={16}
                                    style={{ left: "12px", top: "50%", transform: "translateY(-50%)" }}
                                />
                                <Form.Control
                                    type="text"
                                    placeholder="Tìm kiếm tin nhắn, thông báo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ paddingLeft: "40px", borderRadius: "8px" }}
                                    className="border-0 shadow-sm"
                                />
                            </div>
                        </Col>
                        <Col md={8}>
                            <div className="d-flex gap-3 justify-content-end">
                                <Form.Select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    style={{ width: "auto", borderRadius: "8px" }}
                                    className="border-0 shadow-sm"
                                >
                                    <option value="all">Tất cả loại</option>
                                    <option value="received">Tin nhắn nhận</option>
                                    <option value="sent">Tin nhắn gửi</option>
                                </Form.Select>
                                <Form.Select
                                    value={filterPriority}
                                    onChange={(e) => setFilterPriority(e.target.value)}
                                    style={{ width: "auto", borderRadius: "8px" }}
                                    className="border-0 shadow-sm"
                                >
                                    <option value="all">Tất cả độ ưu tiên</option>
                                    <option value="normal">Bình thường</option>
                                    <option value="high">Cao</option>
                                    <option value="urgent">Khẩn cấp</option>
                                </Form.Select>
                                <Button variant="outline-light" className="border-0 shadow-sm">
                                    <Filter size={16} />
                                </Button>
                            </div>
                        </Col>
                    </Row>

                    {/* Tabs */}
                    <Card style={cardStyle} className="mb-4">
                        <Card.Header className="border-0 bg-transparent">
                            <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab} className="border-0">
                                <Nav.Item>
                                    <Nav.Link eventKey="messages" className="d-flex align-items-center fw-semibold">
                                        <MessageCircle size={16} className="me-2" />
                                        Tin nhắn
                                        {unreadCount > 0 && (
                                            <Badge bg="danger" className="ms-2">
                                                {unreadCount}
                                            </Badge>
                                        )}
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="announcements" className="d-flex align-items-center fw-semibold">
                                        <Megaphone size={16} className="me-2" />
                                        Thông báo ({totalAnnouncements})
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Card.Header>

                        <Card.Body>
                            <Tab.Content>
                                {/* Messages Tab */}
                                <Tab.Pane active={activeTab === "messages"}>
                                    {filteredMessages.length === 0 ? (
                                        <div className="text-center py-5">
                                            <MessageCircle size={64} className="text-muted mb-3" />
                                            <h5 className="text-muted">Không có tin nhắn nào</h5>
                                            <p className="text-muted">Tin nhắn từ học sinh sẽ xuất hiện ở đây</p>
                                        </div>
                                    ) : (
                                        <div className="d-grid gap-3">
                                            {filteredMessages.map((message, index) => (
                                                <motion.div
                                                    key={message.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                                >
                                                    <Card
                                                        className={`border ${!message.isRead && message.type === "received" ? "border-primary" : "border-light"} hover-shadow`}
                                                        style={{ cursor: "pointer", borderRadius: "8px" }}
                                                        onClick={() => handleViewMessage(message)}
                                                    >
                                                        <Card.Body className="p-3">
                                                            <Row className="align-items-center">
                                                                <Col md={1} className="text-center">
                                                                    {getMessageIcon(message.type, message.priority)}
                                                                </Col>
                                                                <Col md={2}>
                                                                    <div className="d-flex align-items-center">
                                                                        <img
                                                                            src={message.from?.avatar || message.to?.avatar}
                                                                            alt={message.from?.name || message.to?.name}
                                                                            className="rounded-circle me-2"
                                                                            style={{ width: "32px", height: "32px", objectFit: "cover" }}
                                                                        />
                                                                        <div>
                                                                            <div className="fw-medium small">{message.from?.name || message.to?.name}</div>
                                                                            <small className="text-muted">{message.type === "received" ? "Từ" : "Đến"}</small>
                                                                        </div>
                                                                    </div>
                                                                </Col>
                                                                <Col md={4}>
                                                                    <div>
                                                                        <div
                                                                            className={`fw-medium ${!message.isRead && message.type === "received" ? "fw-bold" : ""}`}
                                                                        >
                                                                            {message.subject}
                                                                            {message.hasAttachment && <Paperclip size={14} className="ms-2 text-muted" />}
                                                                        </div>
                                                                        <small className="text-muted">{message.content.substring(0, 60)}...</small>
                                                                    </div>
                                                                </Col>
                                                                <Col md={2}>
                                                                    <div className="d-flex flex-column align-items-center gap-1">
                                                                        <Badge bg="light" text="dark" className="small">
                                                                            {message.course}
                                                                        </Badge>
                                                                        {getPriorityBadge(message.priority)}
                                                                    </div>
                                                                </Col>
                                                                <Col md={2}>
                                                                    <small className="text-muted">{formatTime(message.timestamp)}</small>
                                                                </Col>
                                                                <Col md={1}>
                                                                    <div className="d-flex gap-1">
                                                                        <Button variant="outline-primary" size="sm" title="Trả lời">
                                                                            <Reply size={12} />
                                                                        </Button>
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

                                {/* Announcements Tab */}
                                <Tab.Pane active={activeTab === "announcements"}>
                                    {announcements.length === 0 ? (
                                        <div className="text-center py-5">
                                            <Megaphone size={64} className="text-muted mb-3" />
                                            <h5 className="text-muted">Chưa có thông báo nào</h5>
                                            <p className="text-muted">Tạo thông báo đầu tiên để giao tiếp với học sinh</p>
                                        </div>
                                    ) : (
                                        <div className="d-grid gap-3">
                                            {announcements.map((announcement, index) => (
                                                <motion.div
                                                    key={announcement.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                                >
                                                    <Card className="border-light hover-shadow" style={{ borderRadius: "8px" }}>
                                                        <Card.Body className="p-4">
                                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                                <div className="flex-grow-1">
                                                                    <div className="d-flex align-items-center gap-2 mb-2">
                                                                        <h6 className="fw-bold mb-0">{announcement.title}</h6>
                                                                        {getAnnouncementBadge(announcement.type)}
                                                                        <Badge bg="success">Đã xuất bản</Badge>
                                                                    </div>
                                                                    <p className="text-muted mb-3">{announcement.content}</p>
                                                                    <div className="d-flex align-items-center gap-3 small text-muted">
                                                                        <span>
                                                                            <Clock size={14} className="me-1" />
                                                                            {formatDateTime(announcement.createdAt)}
                                                                        </span>
                                                                        <span>
                                                                            <Eye size={14} className="me-1" />
                                                                            {announcement.views} lượt xem
                                                                        </span>
                                                                        <span>
                                                                            <Users size={14} className="me-1" />
                                                                            {announcement.targetAudience === "all" ? "Tất cả" : "Khóa học cụ thể"}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="d-flex gap-1">
                                                                    <Button variant="outline-primary" size="sm" title="Chỉnh sửa">
                                                                        <Edit size={14} />
                                                                    </Button>
                                                                    <Button variant="outline-success" size="sm" title="Xem chi tiết">
                                                                        <Eye size={14} />
                                                                    </Button>
                                                                    <Button variant="outline-danger" size="sm" title="Xóa">
                                                                        <Trash2 size={14} />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            {announcement.courses.length > 0 && (
                                                                <div className="d-flex flex-wrap gap-1">
                                                                    {announcement.courses.map((course, idx) => (
                                                                        <Badge key={idx} bg="primary" className="small">
                                                                            {course}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            )}
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
                </Container>

                {/* Compose Message Modal */}
                <Modal show={showComposeModal} onHide={() => setShowComposeModal(false)} size="lg" centered>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <MessageCircle size={20} className="me-2" />
                            Soạn tin nhắn mới
                        </Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={handleSendMessage}>
                        <Modal.Body>
                            <Row>
                                <Col md={8} className="mb-3">
                                    <Form.Label>
                                        Người nhận <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Select
                                        value={composeForm.to}
                                        onChange={(e) => setComposeForm({ ...composeForm, to: e.target.value })}
                                        required
                                    >
                                        <option value="">Chọn người nhận</option>
                                        <option value="nguyenvana@student.edu.vn">Nguyễn Văn A</option>
                                        <option value="tranthib@student.edu.vn">Trần Thị B</option>
                                        <option value="levancuong@student.edu.vn">Lê Văn Cường</option>
                                        <option value="phamthidung@student.edu.vn">Phạm Thị Dung</option>
                                    </Form.Select>
                                </Col>
                                <Col md={4} className="mb-3">
                                    <Form.Label>Độ ưu tiên</Form.Label>
                                    <Form.Select
                                        value={composeForm.priority}
                                        onChange={(e) => setComposeForm({ ...composeForm, priority: e.target.value })}
                                    >
                                        <option value="normal">Bình thường</option>
                                        <option value="high">Cao</option>
                                        <option value="urgent">Khẩn cấp</option>
                                    </Form.Select>
                                </Col>
                                <Col md={12} className="mb-3">
                                    <Form.Label>
                                        Tiêu đề <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập tiêu đề tin nhắn"
                                        value={composeForm.subject}
                                        onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                                        required
                                    />
                                </Col>
                                <Col md={12} className="mb-3">
                                    <Form.Label>
                                        Nội dung <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={6}
                                        placeholder="Nhập nội dung tin nhắn..."
                                        value={composeForm.content}
                                        onChange={(e) => setComposeForm({ ...composeForm, content: e.target.value })}
                                        required
                                    />
                                </Col>
                            </Row>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowComposeModal(false)}>
                                Hủy
                            </Button>
                            <Button type="submit" style={{ background: "#fbbf24", border: "none", color: "#000" }}>
                                <Send size={16} className="me-2" />
                                Gửi tin nhắn
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>

                {/* Create Announcement Modal */}
                <Modal show={showAnnouncementModal} onHide={() => setShowAnnouncementModal(false)} size="lg" centered>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <Megaphone size={20} className="me-2" />
                            Tạo thông báo mới
                        </Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={handlePublishAnnouncement}>
                        <Modal.Body>
                            <Row>
                                <Col md={8} className="mb-3">
                                    <Form.Label>
                                        Tiêu đề <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập tiêu đề thông báo"
                                        value={announcementForm.title}
                                        onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                                        required
                                    />
                                </Col>
                                <Col md={4} className="mb-3">
                                    <Form.Label>Loại thông báo</Form.Label>
                                    <Form.Select
                                        value={announcementForm.type}
                                        onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value })}
                                    >
                                        <option value="normal">Thông thường</option>
                                        <option value="important">Quan trọng</option>
                                        <option value="urgent">Khẩn cấp</option>
                                    </Form.Select>
                                </Col>
                                <Col md={12} className="mb-3">
                                    <Form.Label>
                                        Nội dung <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={5}
                                        placeholder="Nhập nội dung thông báo..."
                                        value={announcementForm.content}
                                        onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                                        required
                                    />
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Label>Đối tượng</Form.Label>
                                    <Form.Select
                                        value={announcementForm.targetAudience}
                                        onChange={(e) => setAnnouncementForm({ ...announcementForm, targetAudience: e.target.value })}
                                    >
                                        <option value="all">Tất cả học sinh</option>
                                        <option value="course-specific">Khóa học cụ thể</option>
                                    </Form.Select>
                                </Col>
                                {announcementForm.targetAudience === "course-specific" && (
                                    <Col md={6} className="mb-3">
                                        <Form.Label>Chọn khóa học</Form.Label>
                                        <Form.Select>
                                            <option value="">Chọn khóa học</option>
                                            <option value="Lập Trình Web Nâng Cao">Lập Trình Web Nâng Cao</option>
                                            <option value="Cơ Sở Dữ Liệu">Cơ Sở Dữ Liệu</option>
                                            <option value="Trí Tuệ Nhân Tạo">Trí Tuệ Nhân Tạo</option>
                                        </Form.Select>
                                    </Col>
                                )}
                            </Row>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowAnnouncementModal(false)}>
                                Hủy
                            </Button>
                            <Button type="submit" style={{ background: "#fbbf24", border: "none", color: "#000" }}>
                                <Megaphone size={16} className="me-2" />
                                Xuất bản thông báo
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>

                {/* Message Detail Modal */}
                <Modal show={showMessageDetail} onHide={() => setShowMessageDetail(false)} size="lg" centered>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {selectedMessage?.type === "received" ? (
                                <Mail size={20} className="me-2" />
                            ) : (
                                <Send size={20} className="me-2" />
                            )}
                            Chi tiết tin nhắn
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedMessage && (
                            <div>
                                <div className="d-flex align-items-center mb-3 p-3 bg-light rounded">
                                    <img
                                        src={selectedMessage.from?.avatar || selectedMessage.to?.avatar}
                                        alt={selectedMessage.from?.name || selectedMessage.to?.name}
                                        className="rounded-circle me-3"
                                        style={{ width: "48px", height: "48px", objectFit: "cover" }}
                                    />
                                    <div className="flex-grow-1">
                                        <div className="fw-bold">{selectedMessage.from?.name || selectedMessage.to?.name}</div>
                                        <small className="text-muted">{selectedMessage.from?.email || selectedMessage.to?.email}</small>
                                    </div>
                                    <div className="text-end">
                                        <div className="small text-muted">{formatDateTime(selectedMessage.timestamp)}</div>
                                        {getPriorityBadge(selectedMessage.priority)}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <h6 className="fw-bold">{selectedMessage.subject}</h6>
                                    <Badge bg="light" text="dark" className="small">
                                        {selectedMessage.course}
                                    </Badge>
                                </div>

                                <div className="p-3 bg-light rounded">
                                    <p className="mb-0 lh-lg">{selectedMessage.content}</p>
                                </div>

                                {selectedMessage.hasAttachment && (
                                    <div className="mt-3 p-3 border rounded">
                                        <div className="d-flex align-items-center">
                                            <Paperclip size={16} className="me-2 text-muted" />
                                            <span className="small">File đính kèm</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowMessageDetail(false)}>
                            Đóng
                        </Button>
                        <Button style={{ background: "#fbbf24", border: "none", color: "#000" }}>
                            <Reply size={16} className="me-2" />
                            Trả lời
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    )
}

export default InstructorCommunication
