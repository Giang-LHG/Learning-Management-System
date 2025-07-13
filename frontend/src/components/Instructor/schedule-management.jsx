"use client"

import { useState } from "react"
import { Container, Row, Col, Card, Button, Modal, Form, Badge } from "react-bootstrap"
import {
    Calendar,
    Clock,
    Plus,
    Edit,
    Trash2,
    Users,
    Video,
    MapPin,
    Bell,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    CheckCircle,
    AlertTriangle,
} from "lucide-react"
import { motion } from "framer-motion"

// Mock schedule data
const mockEvents = [
    {
        id: "1",
        title: "Lập Trình Web Nâng Cao - Bài 5",
        type: "class", // class, meeting, deadline, event
        startTime: "2024-03-18T09:00:00.000Z",
        endTime: "2024-03-18T11:30:00.000Z",
        location: "Phòng A101",
        isOnline: false,
        course: "Lập Trình Web Nâng Cao",
        attendees: 25,
        description: "Học về React Hooks và State Management",
        status: "scheduled", // scheduled, completed, cancelled
        meetingLink: "",
        reminders: [15, 60], // minutes before
    },
    {
        id: "2",
        title: "Tư vấn học tập - Nguyễn Văn A",
        type: "meeting",
        startTime: "2024-03-18T14:00:00.000Z",
        endTime: "2024-03-18T14:30:00.000Z",
        location: "Online",
        isOnline: true,
        course: "",
        attendees: 1,
        description: "Tư vấn về hướng học tập và career path",
        status: "scheduled",
        meetingLink: "https://meet.google.com/abc-defg-hij",
        reminders: [15],
    },
    {
        id: "3",
        title: "Hạn nộp bài tập React Components",
        type: "deadline",
        startTime: "2024-03-20T23:59:00.000Z",
        endTime: "2024-03-20T23:59:00.000Z",
        location: "",
        isOnline: false,
        course: "Lập Trình Web Nâng Cao",
        attendees: 25,
        description: "Deadline nộp bài tập về React Components",
        status: "scheduled",
        meetingLink: "",
        reminders: [1440, 60], // 1 day and 1 hour before
    },
    {
        id: "4",
        title: "JavaScript Cơ Bản - Bài 3",
        type: "class",
        startTime: "2024-03-19T13:30:00.000Z",
        endTime: "2024-03-19T16:00:00.000Z",
        location: "Phòng B203",
        isOnline: false,
        course: "JavaScript Cơ Bản",
        attendees: 20,
        description: "Functions và Scope trong JavaScript",
        status: "scheduled",
        meetingLink: "",
        reminders: [30],
    },
    {
        id: "5",
        title: "Họp phụ huynh trực tuyến",
        type: "event",
        startTime: "2024-03-22T19:00:00.000Z",
        endTime: "2024-03-22T20:30:00.000Z",
        location: "Online",
        isOnline: true,
        course: "",
        attendees: 15,
        description: "Họp báo cáo tình hình học tập của các em",
        status: "scheduled",
        meetingLink: "https://zoom.us/j/123456789",
        reminders: [60, 1440],
    },
]

const ScheduleManagement = () => {
    const [events, setEvents] = useState(mockEvents)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [viewMode, setViewMode] = useState("week") // week, month, day
    const [showEventModal, setShowEventModal] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [isEditing, setIsEditing] = useState(false)

    const [eventForm, setEventForm] = useState({
        title: "",
        type: "class",
        startTime: "",
        endTime: "",
        location: "",
        isOnline: false,
        course: "",
        description: "",
        meetingLink: "",
        reminders: [15],
    })

    const getEventTypeIcon = (type) => {
        switch (type) {
            case "class":
                return <BookOpen size={16} className="text-primary" />
            case "meeting":
                return <Users size={16} className="text-success" />
            case "deadline":
                return <AlertTriangle size={16} className="text-danger" />
            case "event":
                return <Calendar size={16} className="text-info" />
            default:
                return <Calendar size={16} className="text-muted" />
        }
    }

    const getEventTypeBadge = (type) => {
        switch (type) {
            case "class":
                return <Badge bg="primary">Lớp học</Badge>
            case "meeting":
                return <Badge bg="success">Cuộc họp</Badge>
            case "deadline":
                return <Badge bg="danger">Deadline</Badge>
            case "event":
                return <Badge bg="info">Sự kiện</Badge>
            default:
                return <Badge bg="secondary">Khác</Badge>
        }
    }

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
        return new Date(dateString).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const isToday = (date) => {
        const today = new Date()
        const eventDate = new Date(date)
        return eventDate.toDateString() === today.toDateString()
    }

    const isUpcoming = (date) => {
        const now = new Date()
        const eventDate = new Date(date)
        return eventDate > now
    }

    const getWeekEvents = () => {
        const startOfWeek = new Date(currentDate)
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)

        return events
            .filter((event) => {
                const eventDate = new Date(event.startTime)
                return eventDate >= startOfWeek && eventDate <= endOfWeek
            })
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    }

    const getTodayEvents = () => {
        return events
            .filter((event) => isToday(event.startTime))
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    }

    const getUpcomingEvents = () => {
        return events
            .filter((event) => isUpcoming(event.startTime))
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
            .slice(0, 5)
    }

    const handleAddEvent = () => {
        setSelectedEvent(null)
        setIsEditing(false)
        setEventForm({
            title: "",
            type: "class",
            startTime: "",
            endTime: "",
            location: "",
            isOnline: false,
            course: "",
            description: "",
            meetingLink: "",
            reminders: [15],
        })
        setShowEventModal(true)
    }

    const handleEditEvent = (event) => {
        setSelectedEvent(event)
        setIsEditing(true)
        setEventForm({
            title: event.title,
            type: event.type,
            startTime: new Date(event.startTime).toISOString().slice(0, 16),
            endTime: new Date(event.endTime).toISOString().slice(0, 16),
            location: event.location,
            isOnline: event.isOnline,
            course: event.course,
            description: event.description,
            meetingLink: event.meetingLink,
            reminders: event.reminders,
        })
        setShowEventModal(true)
    }

    const handleSaveEvent = (e) => {
        e.preventDefault()
        // Handle save event logic
        console.log("Saving event:", eventForm)
        setShowEventModal(false)
    }

    const handleDeleteEvent = (eventId) => {
        setEvents(events.filter((e) => e.id !== eventId))
    }

    const navigateWeek = (direction) => {
        const newDate = new Date(currentDate)
        newDate.setDate(currentDate.getDate() + direction * 7)
        setCurrentDate(newDate)
    }

    const weekEvents = getWeekEvents()
    const todayEvents = getTodayEvents()
    const upcomingEvents = getUpcomingEvents()

    return (
        <Container fluid className="py-4">
            {/* Header */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="fw-bold mb-1">Quản lý Lịch trình</h2>
                            <p className="text-muted mb-0">Lên lịch và theo dõi các hoạt động giảng dạy</p>
                        </div>
                        <Button style={{ background: "#fbbf24", border: "none", color: "#000" }} onClick={handleAddEvent}>
                            <Plus size={16} className="me-2" />
                            Thêm sự kiện
                        </Button>
                    </div>
                </Col>
            </Row>

            {/* Stats Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <div className="d-flex align-items-center justify-content-center mb-2">
                                <Calendar size={24} className="text-primary" />
                            </div>
                            <div className="h3 fw-bold text-primary mb-1">{todayEvents.length}</div>
                            <small className="text-muted">Sự kiện hôm nay</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <div className="d-flex align-items-center justify-content-center mb-2">
                                <BookOpen size={24} className="text-success" />
                            </div>
                            <div className="h3 fw-bold text-success mb-1">{events.filter((e) => e.type === "class").length}</div>
                            <small className="text-muted">Lớp học tuần này</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <div className="d-flex align-items-center justify-content-center mb-2">
                                <Users size={24} className="text-warning" />
                            </div>
                            <div className="h3 fw-bold text-warning mb-1">{events.filter((e) => e.type === "meeting").length}</div>
                            <small className="text-muted">Cuộc họp</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <div className="d-flex align-items-center justify-content-center mb-2">
                                <AlertTriangle size={24} className="text-danger" />
                            </div>
                            <div className="h3 fw-bold text-danger mb-1">{events.filter((e) => e.type === "deadline").length}</div>
                            <small className="text-muted">Deadline</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                {/* Calendar View */}
                <Col lg={8}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Lịch tuần</h5>
                            <div className="d-flex align-items-center gap-2">
                                <Button variant="outline-primary" size="sm" onClick={() => navigateWeek(-1)}>
                                    <ChevronLeft size={16} />
                                </Button>
                                <span className="fw-medium">{formatDate(currentDate)}</span>
                                <Button variant="outline-primary" size="sm" onClick={() => navigateWeek(1)}>
                                    <ChevronRight size={16} />
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {weekEvents.length === 0 ? (
                                <div className="text-center py-5">
                                    <Calendar size={64} className="text-muted mb-3" />
                                    <h5 className="text-muted">Không có sự kiện nào trong tuần</h5>
                                    <p className="text-muted">Thêm sự kiện mới để quản lý lịch trình</p>
                                </div>
                            ) : (
                                <div className="d-grid gap-3">
                                    {weekEvents.map((event, index) => (
                                        <motion.div
                                            key={event.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                        >
                                            <Card
                                                className={`border-start border-4 ${event.type === "class"
                                                        ? "border-primary"
                                                        : event.type === "meeting"
                                                            ? "border-success"
                                                            : event.type === "deadline"
                                                                ? "border-danger"
                                                                : "border-info"
                                                    }`}
                                            >
                                                <Card.Body>
                                                    <Row className="align-items-center">
                                                        <Col md={1}>{getEventTypeIcon(event.type)}</Col>
                                                        <Col md={5}>
                                                            <div>
                                                                <h6 className="fw-semibold mb-1">{event.title}</h6>
                                                                <small className="text-muted">{event.description}</small>
                                                            </div>
                                                        </Col>
                                                        <Col md={2}>
                                                            <div className="text-center">
                                                                <div className="fw-medium">{formatTime(event.startTime)}</div>
                                                                <small className="text-muted">{event.endTime && formatTime(event.endTime)}</small>
                                                            </div>
                                                        </Col>
                                                        <Col md={2}>
                                                            <div className="d-flex align-items-center gap-1">
                                                                {event.isOnline ? (
                                                                    <Video size={14} className="text-success" />
                                                                ) : (
                                                                    <MapPin size={14} className="text-primary" />
                                                                )}
                                                                <small>{event.isOnline ? "Online" : event.location}</small>
                                                            </div>
                                                        </Col>
                                                        <Col md={1}>{getEventTypeBadge(event.type)}</Col>
                                                        <Col md={1}>
                                                            <div className="d-flex gap-1">
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    title="Chỉnh sửa"
                                                                    onClick={() => handleEditEvent(event)}
                                                                >
                                                                    <Edit size={12} />
                                                                </Button>
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    title="Xóa"
                                                                    onClick={() => handleDeleteEvent(event.id)}
                                                                >
                                                                    <Trash2 size={12} />
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
                        </Card.Body>
                    </Card>
                </Col>

                {/* Sidebar */}
                <Col lg={4}>
                    {/* Today's Events */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header>
                            <h6 className="mb-0 d-flex align-items-center">
                                <Clock size={16} className="me-2" />
                                Hôm nay ({todayEvents.length})
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            {todayEvents.length === 0 ? (
                                <div className="text-center py-3">
                                    <CheckCircle size={32} className="text-success mb-2" />
                                    <p className="text-muted small mb-0">Không có sự kiện nào hôm nay</p>
                                </div>
                            ) : (
                                <div className="d-grid gap-2">
                                    {todayEvents.map((event) => (
                                        <div key={event.id} className="d-flex align-items-center p-2 rounded bg-light">
                                            {getEventTypeIcon(event.type)}
                                            <div className="ms-2 flex-grow-1">
                                                <div className="fw-medium small">{event.title}</div>
                                                <small className="text-muted">{formatTime(event.startTime)}</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Upcoming Events */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header>
                            <h6 className="mb-0 d-flex align-items-center">
                                <Bell size={16} className="me-2" />
                                Sắp tới
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-grid gap-2">
                                {upcomingEvents.map((event) => (
                                    <div key={event.id} className="d-flex align-items-start p-2 border rounded">
                                        <div className="me-2 mt-1">{getEventTypeIcon(event.type)}</div>
                                        <div className="flex-grow-1">
                                            <div className="fw-medium small">{event.title}</div>
                                            <small className="text-muted d-block">{formatDateTime(event.startTime)}</small>
                                            {event.course && (
                                                <Badge bg="light" text="dark" className="small mt-1">
                                                    {event.course}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="border-0 shadow-sm">
                        <Card.Header>
                            <h6 className="mb-0">Thao tác nhanh</h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-grid gap-2">
                                <Button variant="outline-primary" size="sm" onClick={handleAddEvent}>
                                    <BookOpen size={14} className="me-2" />
                                    Thêm lớp học
                                </Button>
                                <Button variant="outline-success" size="sm" onClick={handleAddEvent}>
                                    <Users size={14} className="me-2" />
                                    Đặt lịch họp
                                </Button>
                                <Button variant="outline-warning" size="sm" onClick={handleAddEvent}>
                                    <AlertTriangle size={14} className="me-2" />
                                    Thêm deadline
                                </Button>
                                <Button variant="outline-info" size="sm" onClick={handleAddEvent}>
                                    <Calendar size={14} className="me-2" />
                                    Tạo sự kiện
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Event Modal */}
            <Modal show={showEventModal} onHide={() => setShowEventModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <Calendar size={20} className="me-2" />
                        {isEditing ? "Chỉnh sửa sự kiện" : "Thêm sự kiện mới"}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSaveEvent}>
                    <Modal.Body>
                        <Row>
                            <Col md={8} className="mb-3">
                                <Form.Label>
                                    Tiêu đề <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Nhập tiêu đề sự kiện"
                                    value={eventForm.title}
                                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                                    required
                                />
                            </Col>
                            <Col md={4} className="mb-3">
                                <Form.Label>Loại sự kiện</Form.Label>
                                <Form.Select
                                    value={eventForm.type}
                                    onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                                >
                                    <option value="class">Lớp học</option>
                                    <option value="meeting">Cuộc họp</option>
                                    <option value="deadline">Deadline</option>
                                    <option value="event">Sự kiện</option>
                                </Form.Select>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Label>
                                    Thời gian bắt đầu <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    value={eventForm.startTime}
                                    onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                                    required
                                />
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Label>Thời gian kết thúc</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    value={eventForm.endTime}
                                    onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                                />
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Label>Địa điểm</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Nhập địa điểm"
                                    value={eventForm.location}
                                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                                    disabled={eventForm.isOnline}
                                />
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Label>Khóa học</Form.Label>
                                <Form.Select
                                    value={eventForm.course}
                                    onChange={(e) => setEventForm({ ...eventForm, course: e.target.value })}
                                >
                                    <option value="">Chọn khóa học</option>
                                    <option value="Lập Trình Web Nâng Cao">Lập Trình Web Nâng Cao</option>
                                    <option value="JavaScript Cơ Bản">JavaScript Cơ Bản</option>
                                    <option value="React Native">React Native</option>
                                </Form.Select>
                            </Col>
                            <Col md={12} className="mb-3">
                                <Form.Check
                                    type="switch"
                                    label="Sự kiện trực tuyến"
                                    checked={eventForm.isOnline}
                                    onChange={(e) => setEventForm({ ...eventForm, isOnline: e.target.checked })}
                                />
                            </Col>
                            {eventForm.isOnline && (
                                <Col md={12} className="mb-3">
                                    <Form.Label>Link cuộc họp</Form.Label>
                                    <Form.Control
                                        type="url"
                                        placeholder="https://meet.google.com/..."
                                        value={eventForm.meetingLink}
                                        onChange={(e) => setEventForm({ ...eventForm, meetingLink: e.target.value })}
                                    />
                                </Col>
                            )}
                            <Col md={12} className="mb-3">
                                <Form.Label>Mô tả</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Nhập mô tả sự kiện..."
                                    value={eventForm.description}
                                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                                />
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEventModal(false)}>
                            Hủy
                        </Button>
                        <Button type="submit" style={{ background: "#fbbf24", border: "none", color: "#000" }}>
                            <Calendar size={16} className="me-2" />
                            {isEditing ? "Cập nhật" : "Tạo sự kiện"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    )
}

export default ScheduleManagement
