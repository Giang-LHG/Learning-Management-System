"use client"

import { useState } from "react"
import { Container, Row, Col, Card, Button, Modal, Form, Badge, Table, Tab, Nav } from "react-bootstrap"
import {
    Users,
    Search,
    Filter,
    Plus,
    Edit,
    Mail,
    Award,
    MessageCircle,
    UserCheck,
    Download,
    BarChart3,
} from "lucide-react"
import { motion } from "framer-motion"

// Mock student data
const mockStudents = [
    {
        id: "1",
        username: "nguyenvana",
        email: "nguyenvana@student.edu.vn",
        profile: {
            fullName: "Nguyễn Văn A",
            avatarUrl: "https://i.pravatar.cc/150?img=1",
            phone: "0123456789",
            dateOfBirth: "2002-05-15",
            address: "123 Đường ABC, Quận 1, TP.HCM",
            parentIds: ["parent1"],
        },
        enrolledCourses: [
            { courseId: "course1", courseName: "Lập Trình Web Nâng Cao", enrolledAt: "2024-02-01", progress: 75 },
            { courseId: "course2", courseName: "JavaScript Cơ Bản", enrolledAt: "2024-01-15", progress: 90 },
        ],
        performance: {
            totalAssignments: 12,
            completedAssignments: 10,
            averageGrade: 8.5,
            attendanceRate: 92,
            lastActive: "2024-03-15T14:30:00.000Z",
        },
        status: "active", // active, inactive, suspended
        joinedAt: "2024-01-10T08:00:00.000Z",
        notes: "Học sinh tích cực, có khả năng lập trình tốt",
    },
    {
        id: "2",
        username: "tranthib",
        email: "tranthib@student.edu.vn",
        profile: {
            fullName: "Trần Thị B",
            avatarUrl: "https://i.pravatar.cc/150?img=2",
            phone: "0987654321",
            dateOfBirth: "2001-08-22",
            address: "456 Đường XYZ, Quận 3, TP.HCM",
            parentIds: ["parent2"],
        },
        enrolledCourses: [
            { courseId: "course1", courseName: "Lập Trình Web Nâng Cao", enrolledAt: "2024-02-03", progress: 60 },
        ],
        performance: {
            totalAssignments: 8,
            completedAssignments: 6,
            averageGrade: 7.2,
            attendanceRate: 85,
            lastActive: "2024-03-14T10:15:00.000Z",
        },
        status: "active",
        joinedAt: "2024-01-20T09:30:00.000Z",
        notes: "Cần hỗ trợ thêm về JavaScript",
    },
    {
        id: "3",
        username: "levancuong",
        email: "levancuong@student.edu.vn",
        profile: {
            fullName: "Lê Văn Cường",
            avatarUrl: "https://i.pravatar.cc/150?img=3",
            phone: "0369852147",
            dateOfBirth: "2002-12-03",
            address: "789 Đường DEF, Quận 7, TP.HCM",
            parentIds: [],
        },
        enrolledCourses: [
            { courseId: "course1", courseName: "Lập Trình Web Nâng Cao", enrolledAt: "2024-02-05", progress: 85 },
            { courseId: "course3", courseName: "React Native", enrolledAt: "2024-02-10", progress: 70 },
        ],
        performance: {
            totalAssignments: 15,
            completedAssignments: 14,
            averageGrade: 9.1,
            attendanceRate: 98,
            lastActive: "2024-03-15T16:45:00.000Z",
        },
        status: "active",
        joinedAt: "2024-01-05T07:45:00.000Z",
        notes: "Học sinh xuất sắc, có thể làm mentor cho các bạn khác",
    },
]

const StudentManagement = () => {
    const [students, setStudents] = useState(mockStudents)
    const [selectedStudent, setSelectedStudent] = useState(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showMessageModal, setShowMessageModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("all")
    const [filterCourse, setFilterCourse] = useState("all")
    const [activeTab, setActiveTab] = useState("overview")

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
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

    const getStatusBadge = (status) => {
        switch (status) {
            case "active":
                return <Badge bg="success">Đang học</Badge>
            case "inactive":
                return <Badge bg="secondary">Tạm nghỉ</Badge>
            case "suspended":
                return <Badge bg="danger">Đình chỉ</Badge>
            default:
                return <Badge bg="secondary">Không xác định</Badge>
        }
    }

    const getPerformanceColor = (grade) => {
        if (grade >= 8.5) return "success"
        if (grade >= 7.0) return "warning"
        return "danger"
    }

    const filteredStudents = students.filter((student) => {
        const matchesSearch =
            student.profile.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.username.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === "all" || student.status === filterStatus
        const matchesCourse =
            filterCourse === "all" || student.enrolledCourses.some((course) => course.courseName === filterCourse)

        return matchesSearch && matchesStatus && matchesCourse
    })

    const handleViewDetail = (student) => {
        setSelectedStudent(student)
        setShowDetailModal(true)
    }

    const handleSendMessage = (student) => {
        setSelectedStudent(student)
        setShowMessageModal(true)
    }

    const totalStudents = students.length
    const activeStudents = students.filter((s) => s.status === "active").length
    const averageGrade = students.reduce((sum, s) => sum + s.performance.averageGrade, 0) / students.length
    const averageAttendance = students.reduce((sum, s) => sum + s.performance.attendanceRate, 0) / students.length

    return (
        <Container fluid className="py-4">
            {/* Header */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="fw-bold mb-1">Quản lý Học sinh</h2>
                            <p className="text-muted mb-0">Theo dõi tiến độ và quản lý thông tin học sinh</p>
                        </div>
                        <div className="d-flex gap-2">
                            <Button variant="outline-primary">
                                <Download size={16} className="me-2" />
                                Xuất danh sách
                            </Button>
                            <Button
                                style={{ background: "#fbbf24", border: "none", color: "#000" }}
                                onClick={() => setShowAddModal(true)}
                            >
                                <Plus size={16} className="me-2" />
                                Thêm học sinh
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Stats Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <div className="d-flex align-items-center justify-content-center mb-2">
                                <Users size={24} className="text-primary" />
                            </div>
                            <div className="h3 fw-bold text-primary mb-1">{totalStudents}</div>
                            <small className="text-muted">Tổng học sinh</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <div className="d-flex align-items-center justify-content-center mb-2">
                                <UserCheck size={24} className="text-success" />
                            </div>
                            <div className="h3 fw-bold text-success mb-1">{activeStudents}</div>
                            <small className="text-muted">Đang học</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <div className="d-flex align-items-center justify-content-center mb-2">
                                <Award size={24} className="text-warning" />
                            </div>
                            <div className="h3 fw-bold text-warning mb-1">{averageGrade.toFixed(1)}</div>
                            <small className="text-muted">Điểm TB</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <div className="d-flex align-items-center justify-content-center mb-2">
                                <BarChart3 size={24} className="text-info" />
                            </div>
                            <div className="h3 fw-bold text-info mb-1">{averageAttendance.toFixed(0)}%</div>
                            <small className="text-muted">Tỷ lệ tham gia</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Search and Filters */}
            <Card className="mb-4 border-0 shadow-sm">
                <Card.Body>
                    <Row className="align-items-center">
                        <Col md={4}>
                            <div className="position-relative">
                                <Search
                                    className="position-absolute text-muted"
                                    size={16}
                                    style={{ left: "12px", top: "50%", transform: "translateY(-50%)" }}
                                />
                                <Form.Control
                                    type="text"
                                    placeholder="Tìm kiếm học sinh..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ paddingLeft: "40px" }}
                                />
                            </div>
                        </Col>
                        <Col md={3}>
                            <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Đang học</option>
                                <option value="inactive">Tạm nghỉ</option>
                                <option value="suspended">Đình chỉ</option>
                            </Form.Select>
                        </Col>
                        <Col md={3}>
                            <Form.Select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
                                <option value="all">Tất cả khóa học</option>
                                <option value="Lập Trình Web Nâng Cao">Lập Trình Web Nâng Cao</option>
                                <option value="JavaScript Cơ Bản">JavaScript Cơ Bản</option>
                                <option value="React Native">React Native</option>
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Button variant="outline-primary" className="w-100">
                                <Filter size={16} className="me-2" />
                                Lọc
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Students Table */}
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>Học sinh</th>
                                <th>Khóa học</th>
                                <th>Tiến độ</th>
                                <th>Điểm TB</th>
                                <th>Tham gia</th>
                                <th>Hoạt động cuối</th>
                                <th>Trạng thái</th>
                                <th className="text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student, index) => (
                                <motion.tr
                                    key={student.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <img
                                                src={student.profile.avatarUrl || "/placeholder.svg"}
                                                alt={student.profile.fullName}
                                                className="rounded-circle me-3"
                                                style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                            />
                                            <div>
                                                <div className="fw-semibold">{student.profile.fullName}</div>
                                                <small className="text-muted">{student.email}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            {student.enrolledCourses.map((course, idx) => (
                                                <Badge key={idx} bg="primary" className="me-1 mb-1 small">
                                                    {course.courseName}
                                                </Badge>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            {student.enrolledCourses.map((course, idx) => (
                                                <div key={idx} className="mb-1">
                                                    <div className="d-flex align-items-center">
                                                        <div className="progress me-2" style={{ width: "60px", height: "6px" }}>
                                                            <div
                                                                className="progress-bar"
                                                                style={{
                                                                    width: `${course.progress}%`,
                                                                    backgroundColor:
                                                                        course.progress >= 80 ? "#16a34a" : course.progress >= 60 ? "#eab308" : "#dc2626",
                                                                }}
                                                            />
                                                        </div>
                                                        <small>{course.progress}%</small>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <Badge bg={getPerformanceColor(student.performance.averageGrade)} className="fs-6">
                                            {student.performance.averageGrade.toFixed(1)}
                                        </Badge>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className="progress me-2" style={{ width: "50px", height: "6px" }}>
                                                <div
                                                    className="progress-bar bg-info"
                                                    style={{ width: `${student.performance.attendanceRate}%` }}
                                                />
                                            </div>
                                            <small>{student.performance.attendanceRate}%</small>
                                        </div>
                                    </td>
                                    <td>
                                        <small className="text-muted">{formatDateTime(student.performance.lastActive)}</small>
                                    </td>
                                    <td>{getStatusBadge(student.status)}</td>
                                    <td className="text-center">
                                        <div className="d-flex gap-1 justify-content-center">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                title="Xem chi tiết"
                                                onClick={() => handleViewDetail(student)}
                                            >
                                                <Users size={14} />
                                            </Button>
                                            <Button
                                                variant="outline-success"
                                                size="sm"
                                                title="Gửi tin nhắn"
                                                onClick={() => handleSendMessage(student)}
                                            >
                                                <MessageCircle size={14} />
                                            </Button>
                                            <Button variant="outline-warning" size="sm" title="Chỉnh sửa">
                                                <Edit size={14} />
                                            </Button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Student Detail Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <Users size={20} className="me-2" />
                        Chi tiết học sinh - {selectedStudent?.profile.fullName}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                    {selectedStudent && (
                        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                            <Nav variant="tabs" className="mb-4">
                                <Nav.Item>
                                    <Nav.Link eventKey="overview">Tổng quan</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="performance">Kết quả học tập</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="courses">Khóa học</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="notes">Ghi chú</Nav.Link>
                                </Nav.Item>
                            </Nav>

                            <Tab.Content>
                                <Tab.Pane eventKey="overview">
                                    <Row>
                                        <Col md={4}>
                                            <Card className="text-center">
                                                <Card.Body>
                                                    <img
                                                        src={selectedStudent.profile.avatarUrl || "/placeholder.svg"}
                                                        alt={selectedStudent.profile.fullName}
                                                        className="rounded-circle mb-3"
                                                        style={{ width: "100px", height: "100px", objectFit: "cover" }}
                                                    />
                                                    <h5 className="fw-bold">{selectedStudent.profile.fullName}</h5>
                                                    <p className="text-muted">@{selectedStudent.username}</p>
                                                    {getStatusBadge(selectedStudent.status)}
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={8}>
                                            <Card>
                                                <Card.Header>
                                                    <h6 className="mb-0">Thông tin cá nhân</h6>
                                                </Card.Header>
                                                <Card.Body>
                                                    <Row>
                                                        <Col md={6} className="mb-3">
                                                            <strong>Email:</strong>
                                                            <div>{selectedStudent.email}</div>
                                                        </Col>
                                                        <Col md={6} className="mb-3">
                                                            <strong>Số điện thoại:</strong>
                                                            <div>{selectedStudent.profile.phone}</div>
                                                        </Col>
                                                        <Col md={6} className="mb-3">
                                                            <strong>Ngày sinh:</strong>
                                                            <div>{formatDate(selectedStudent.profile.dateOfBirth)}</div>
                                                        </Col>
                                                        <Col md={6} className="mb-3">
                                                            <strong>Ngày tham gia:</strong>
                                                            <div>{formatDate(selectedStudent.joinedAt)}</div>
                                                        </Col>
                                                        <Col md={12} className="mb-3">
                                                            <strong>Địa chỉ:</strong>
                                                            <div>{selectedStudent.profile.address}</div>
                                                        </Col>
                                                    </Row>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                </Tab.Pane>

                                <Tab.Pane eventKey="performance">
                                    <Row>
                                        <Col md={3}>
                                            <Card className="text-center bg-primary text-white">
                                                <Card.Body>
                                                    <div className="h3 fw-bold">{selectedStudent.performance.totalAssignments}</div>
                                                    <small>Tổng bài tập</small>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={3}>
                                            <Card className="text-center bg-success text-white">
                                                <Card.Body>
                                                    <div className="h3 fw-bold">{selectedStudent.performance.completedAssignments}</div>
                                                    <small>Đã hoàn thành</small>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={3}>
                                            <Card className="text-center bg-warning text-white">
                                                <Card.Body>
                                                    <div className="h3 fw-bold">{selectedStudent.performance.averageGrade}</div>
                                                    <small>Điểm trung bình</small>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={3}>
                                            <Card className="text-center bg-info text-white">
                                                <Card.Body>
                                                    <div className="h3 fw-bold">{selectedStudent.performance.attendanceRate}%</div>
                                                    <small>Tỷ lệ tham gia</small>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                </Tab.Pane>

                                <Tab.Pane eventKey="courses">
                                    <div className="d-grid gap-3">
                                        {selectedStudent.enrolledCourses.map((course, index) => (
                                            <Card key={index}>
                                                <Card.Body>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <h6 className="fw-bold mb-1">{course.courseName}</h6>
                                                            <small className="text-muted">Tham gia từ: {formatDate(course.enrolledAt)}</small>
                                                        </div>
                                                        <div className="text-end">
                                                            <div className="d-flex align-items-center mb-2">
                                                                <div className="progress me-2" style={{ width: "100px", height: "8px" }}>
                                                                    <div
                                                                        className="progress-bar"
                                                                        style={{
                                                                            width: `${course.progress}%`,
                                                                            backgroundColor:
                                                                                course.progress >= 80
                                                                                    ? "#16a34a"
                                                                                    : course.progress >= 60
                                                                                        ? "#eab308"
                                                                                        : "#dc2626",
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span className="fw-bold">{course.progress}%</span>
                                                            </div>
                                                            <Badge bg="primary">Đang học</Badge>
                                                        </div>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        ))}
                                    </div>
                                </Tab.Pane>

                                <Tab.Pane eventKey="notes">
                                    <Card>
                                        <Card.Header>
                                            <h6 className="mb-0">Ghi chú về học sinh</h6>
                                        </Card.Header>
                                        <Card.Body>
                                            <Form.Control
                                                as="textarea"
                                                rows={6}
                                                value={selectedStudent.notes}
                                                placeholder="Thêm ghi chú về học sinh..."
                                            />
                                            <div className="mt-3">
                                                <Button variant="primary" size="sm">
                                                    Lưu ghi chú
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Tab.Pane>
                            </Tab.Content>
                        </Tab.Container>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Message Modal */}
            <Modal show={showMessageModal} onHide={() => setShowMessageModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <MessageCircle size={20} className="me-2" />
                        Gửi tin nhắn - {selectedStudent?.profile.fullName}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tiêu đề</Form.Label>
                            <Form.Control type="text" placeholder="Nhập tiêu đề tin nhắn" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Nội dung</Form.Label>
                            <Form.Control as="textarea" rows={4} placeholder="Nhập nội dung tin nhắn..." />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowMessageModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="primary">
                        <Mail size={16} className="me-2" />
                        Gửi tin nhắn
                    </Button>
                </Modal.Footer>
            </Modal>

            {filteredStudents.length === 0 && (
                <div className="text-center py-5">
                    <Users size={64} className="text-muted mb-3" />
                    <h5 className="text-muted">Không tìm thấy học sinh nào</h5>
                    <p className="text-muted">Thử thay đổi bộ lọc hoặc thêm học sinh mới</p>
                </div>
            )}
        </Container>
    )
}

export default StudentManagement
