"use client"

import { useState, useEffect } from "react"
import { Modal, Tab, Nav, Card, Table, Button, Badge, Row, Col, Form, InputGroup } from "react-bootstrap"
import { FileText, CheckCircle, Users, Clock, Star, Eye, BarChart3 } from "lucide-react"
import EssaySubmissionDetail from "./essay-submission-detail"
import QuizResultDetail from "./quiz-result-detail"
import api from '../../utils/api';

const AssignmentDetailModal = ({ show, onHide, assignment }) => {
    const [activeTab, setActiveTab] = useState("overview")
    const [submissions, setSubmissions] = useState([])
    const [studentsSubmitted, setStudentsSubmitted] = useState([])
    const [studentsNotSubmitted, setStudentsNotSubmitted] = useState([])
    const [selectedSubmission, setSelectedSubmission] = useState(null)
    const [showSubmissionDetail, setShowSubmissionDetail] = useState(false)
    const [showGradeModal, setShowGradeModal] = useState(false)
    const [gradingStudent, setGradingStudent] = useState(null)
    const [gradeValue, setGradeValue] = useState('')
    const [gradeLoading, setGradeLoading] = useState(false)
    const [gradeError, setGradeError] = useState('')
    const [quizResults, setQuizResults] = useState([])
    const [selectedQuizResult, setSelectedQuizResult] = useState(null)
    const [showQuizDetail, setShowQuizDetail] = useState(false)

    // Mock data for essay submissions
    const mockEssaySubmissions = [
        {
            _id: "sub1",
            studentId: "64f8a1b2c3d4e5f6a7b8c9e1",
            studentName: "Nguyễn Văn A",
            studentEmail: "nguyenvana@student.edu.vn",
            submittedAt: "2024-03-14T15:30:00.000Z",
            content:
                "Đây là nội dung bài làm của học sinh. Học sinh đã trình bày khá chi tiết về React Components và cách sử dụng chúng trong ứng dụng thực tế. Bài làm thể hiện sự hiểu biết tốt về JSX, props, và state management.",
            attachments: [
                { name: "react-app.zip", size: "2.5MB", url: "#" },
                { name: "screenshot.png", size: "1.2MB", url: "#" },
            ],
            grade: 8.5,
            feedback: "Bài làm tốt, có thể cải thiện thêm về error handling.",
            gradedAt: "2024-03-15T10:00:00.000Z",
            gradedBy: "Nguyễn Văn An",
        },
        {
            _id: "sub2",
            studentId: "64f8a1b2c3d4e5f6a7b8c9e2",
            studentName: "Trần Thị B",
            studentEmail: "tranthib@student.edu.vn",
            submittedAt: "2024-03-13T20:45:00.000Z",
            content:
                "Bài làm về React Components. Em đã tạo được một ứng dụng Todo đơn giản với các component như TodoList, TodoItem, và AddTodo. Ứng dụng có thể thêm, xóa và đánh dấu hoàn thành các task.",
            attachments: [{ name: "todo-app.zip", size: "3.1MB", url: "#" }],
            grade: null, // Chưa chấm
            feedback: null,
            gradedAt: null,
            gradedBy: null,
        },
        {
            _id: "sub3",
            studentId: "64f8a1b2c3d4e5f6a7b8c9e3",
            studentName: "Lê Văn Cường",
            studentEmail: "levancuong@student.edu.vn",
            submittedAt: "2024-03-15T09:15:00.000Z",
            content:
                "Trong bài này, em đã nghiên cứu về React Hooks, đặc biệt là useState và useEffect. Em đã xây dựng một ứng dụng weather app nhỏ để demo việc sử dụng các hooks này.",
            attachments: [],
            grade: 9.0,
            feedback: "Excellent work! Hiểu rất rõ về React Hooks.",
            gradedAt: "2024-03-15T14:20:00.000Z",
            gradedBy: "Nguyễn Văn An",
        },
    ]

    // Mock data for quiz results
    const mockQuizResults = [
        {
            _id: "quiz1",
            studentId: "64f8a1b2c3d4e5f6a7b8c9e1",
            studentName: "Nguyễn Văn A",
            studentEmail: "nguyenvana@student.edu.vn",
            completedAt: "2024-03-19T14:30:00.000Z",
            score: 8,
            totalScore: 10,
            percentage: 80,
            timeSpent: 15, // minutes
            answers: [
                {
                    questionId: "q1",
                    selectedOption: "A",
                    isCorrect: true,
                    points: 2,
                },
                {
                    questionId: "q2",
                    selectedOption: "B",
                    isCorrect: true,
                    points: 2,
                },
                {
                    questionId: "q3",
                    selectedOption: "C",
                    isCorrect: false,
                    points: 0,
                },
                {
                    questionId: "q4",
                    selectedOption: "A",
                    isCorrect: true,
                    points: 2,
                },
                {
                    questionId: "q5",
                    selectedOption: "D",
                    isCorrect: true,
                    points: 2,
                },
            ],
        },
        {
            _id: "quiz2",
            studentId: "64f8a1b2c3d4e5f6a7b8c9e2",
            studentName: "Trần Thị B",
            studentEmail: "tranthib@student.edu.vn",
            completedAt: "2024-03-20T10:15:00.000Z",
            score: 6,
            totalScore: 10,
            percentage: 60,
            timeSpent: 20,
            answers: [
                {
                    questionId: "q1",
                    selectedOption: "A",
                    isCorrect: true,
                    points: 2,
                },
                {
                    questionId: "q2",
                    selectedOption: "A",
                    isCorrect: false,
                    points: 0,
                },
                {
                    questionId: "q3",
                    selectedOption: "C",
                    isCorrect: false,
                    points: 0,
                },
                {
                    questionId: "q4",
                    selectedOption: "A",
                    isCorrect: true,
                    points: 2,
                },
                {
                    questionId: "q5",
                    selectedOption: "D",
                    isCorrect: true,
                    points: 2,
                },
            ],
        },
    ]

    useEffect(() => {
        if (show && assignment) {
            // Gọi API lấy danh sách đã nộp/chưa nộp
            api.get(`/instructor/submissions/assignment/${assignment._id}/submission-status`)
                .then(res => {
                    setStudentsSubmitted(res.data.data.submitted || [])
                    setStudentsNotSubmitted(res.data.data.notSubmitted || [])
                })
                .catch(() => {
                    setStudentsSubmitted([])
                    setStudentsNotSubmitted([])
                })
            // Gọi API lấy submissions
            api.get(`/instructor/submissions/assignment/${assignment._id}`)
                .then(res => {
                    setSubmissions(res.data.data || [])
                })
                .catch(() => setSubmissions([]))
            setActiveTab(assignment.type === 'essay' ? 'submissions' : 'results')
        }
    }, [show, assignment])

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
            return "Thời gian không hợp lệ"
        }
    }

    const getSubmissionStats = () => {
        if (assignment?.type === "essay") {
            const totalStudents = studentsSubmitted.length + studentsNotSubmitted.length; // Total students in the assignment
            const submittedCount = studentsSubmitted.length;
            const gradedCount = studentsSubmitted.filter((sub) => sub.grade !== null).length;
            const avgGrade =
                studentsSubmitted.filter((sub) => sub.grade !== null).reduce((sum, sub) => sum + sub.grade, 0) / (gradedCount || 1)

            return {
                totalStudents,
                submittedCount,
                gradedCount,
                avgGrade: gradedCount > 0 ? avgGrade.toFixed(1) : 0,
                submissionRate: totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0,
            }
        } else if (assignment?.type === "quiz") {
            const totalStudents = studentsSubmitted.length + studentsNotSubmitted.length; // Total students in the assignment
            const completedCount = studentsSubmitted.length;
            const avgScore = studentsSubmitted.reduce((sum, result) => sum + result.percentage, 0) / (completedCount || 1)

            return {
                totalStudents,
                completedCount,
                avgScore: completedCount > 0 ? avgScore.toFixed(1) : 0,
                completionRate: totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0,
            }
        }
        return {}
    }

    const handleViewSubmission = (submission) => {
        setSelectedSubmission(submission)
        setShowSubmissionDetail(true)
    }

    const handleViewQuizResult = (result) => {
        setSelectedQuizResult(result)
        setShowQuizDetail(true)
    }

    // Chấm điểm học sinh chưa nộp bài tự luận
    const handleOpenGradeModal = (student) => {
        setGradingStudent(student)
        setGradeValue('')
        setGradeError('')
        setShowGradeModal(true)
    }
    const handleGradeStudent = async () => {
        if (!gradeValue || isNaN(gradeValue) || gradeValue < 0 || gradeValue > 10) {
            setGradeError('Điểm phải là số từ 0 đến 10')
            return
        }
        setGradeLoading(true)
        setGradeError('')
        try {
            await api.post(`/instructor/submissions/assignment/${assignment._id}/grade-student`, {
                studentId: gradingStudent._id,
                score: Number(gradeValue),
                content: ''
            })
            setShowGradeModal(false)
            // Refresh lại danh sách
            const [statusRes, subRes] = await Promise.all([
                api.get(`/instructor/submissions/assignment/${assignment._id}/submission-status`),
                api.get(`/instructor/submissions/assignment/${assignment._id}`)
            ])
            setStudentsSubmitted(statusRes.data.data.submitted || [])
            setStudentsNotSubmitted(statusRes.data.data.notSubmitted || [])
            setSubmissions(subRes.data.data || [])
        } catch (err) {
            setGradeError('Chấm điểm thất bại')
        } finally {
            setGradeLoading(false)
        }
    }

    const stats = getSubmissionStats()

    if (!assignment) return null

    return (
        <>
            <Modal show={show} onHide={onHide} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title className="d-flex align-items-center">
                        {assignment.type === "quiz" ? (
                            <CheckCircle size={24} className="me-2 text-info" />
                        ) : (
                            <FileText size={24} className="me-2 text-primary" />
                        )}
                        Chi tiết bài tập: {assignment.title}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                    {/* Assignment Info */}
                    <Card className="mb-4">
                        <Card.Body>
                            <Row>
                                <Col md={8}>
                                    <h5 className="fw-bold mb-2">{assignment.title}</h5>
                                    <p className="text-muted mb-3">{assignment.description}</p>
                                    <div className="d-flex gap-3 small text-muted">
                                        <span className="d-flex align-items-center">
                                            <Clock size={14} className="me-1" />
                                            Hạn nộp: {formatDateTime(assignment.dueDate)}
                                        </span>
                                        <Badge bg={assignment.type === "quiz" ? "info" : "primary"}>
                                            {assignment.type === "quiz" ? "Trắc nghiệm" : "Tự luận"}
                                        </Badge>
                                        <Badge bg={assignment.isVisible ? "success" : "secondary"}>
                                            {assignment.isVisible ? "Hiển thị" : "Ẩn"}
                                        </Badge>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <Card className="bg-light">
                                        <Card.Body className="text-center">
                                            <div className="d-flex justify-content-around">
                                                <div>
                                                    <div className="h4 fw-bold text-primary mb-0">
                                                        {assignment.type === "essay" ? stats.submittedCount : stats.completedCount}
                                                    </div>
                                                    <small className="text-muted">{assignment.type === "essay" ? "Đã nộp" : "Đã làm"}</small>
                                                </div>
                                                <div>
                                                    <div className="h4 fw-bold text-success mb-0">
                                                        {assignment.type === "essay" ? `${stats.submissionRate}%` : `${stats.completionRate}%`}
                                                    </div>
                                                    <small className="text-muted">Tỷ lệ</small>
                                                </div>
                                                <div>
                                                    <div className="h4 fw-bold text-warning mb-0">
                                                        {assignment.type === "essay" ? stats.avgGrade : `${stats.avgScore}%`}
                                                    </div>
                                                    <small className="text-muted">{assignment.type === "essay" ? "Điểm TB" : "Điểm TB"}</small>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Tabs */}
                    <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
                        <Nav.Item>
                            <Nav.Link eventKey="overview" className="d-flex align-items-center">
                                <BarChart3 size={16} className="me-2" />
                                Tổng quan
                            </Nav.Link>
                        </Nav.Item>
                        {assignment.type === "essay" && (
                            <Nav.Item>
                                <Nav.Link eventKey="submissions" className="d-flex align-items-center">
                                    <FileText size={16} className="me-2" />
                                    Bài nộp ({studentsSubmitted.length})
                                </Nav.Link>
                            </Nav.Item>
                        )}
                        {assignment.type === "quiz" && (
                            <Nav.Item>
                                <Nav.Link eventKey="results" className="d-flex align-items-center">
                                    <CheckCircle size={16} className="me-2" />
                                    Kết quả ({studentsSubmitted.length})
                                </Nav.Link>
                            </Nav.Item>
                        )}
                    </Nav>

                    <Tab.Content>
                        {/* Overview Tab */}
                        <Tab.Pane active={activeTab === "overview"}>
                            <Row>
                                <Col md={6}>
                                    <Card className="mb-4">
                                        <Card.Header>
                                            <h6 className="mb-0">Thống kê chung</h6>
                                        </Card.Header>
                                        <Card.Body>
                                            <div className="d-grid gap-3">
                                                <div className="d-flex justify-content-between">
                                                    <span>Tổng số học sinh:</span>
                                                    <span className="fw-bold">{stats.totalStudents}</span>
                                                </div>
                                                <div className="d-flex justify-content-between">
                                                    <span>{assignment.type === "essay" ? "Đã nộp bài:" : "Đã hoàn thành:"}</span>
                                                    <span className="fw-bold text-success">
                                                        {assignment.type === "essay" ? stats.submittedCount : stats.completedCount}
                                                    </span>
                                                </div>
                                                <div className="d-flex justify-content-between">
                                                    <span>Chưa làm:</span>
                                                    <span className="fw-bold text-danger">
                                                        {stats.totalStudents -
                                                            (assignment.type === "essay" ? stats.submittedCount : stats.completedCount)}
                                                    </span>
                                                </div>
                                                {assignment.type === "essay" && (
                                                    <div className="d-flex justify-content-between">
                                                        <span>Đã chấm điểm:</span>
                                                        <span className="fw-bold text-info">{stats.gradedCount}</span>
                                                    </div>
                                                )}
                                                <hr />
                                                <div className="d-flex justify-content-between">
                                                    <span>Điểm trung bình:</span>
                                                    <span className="fw-bold text-primary">
                                                        {assignment.type === "essay" ? `${stats.avgGrade}/10` : `${stats.avgScore}%`}
                                                    </span>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <Card className="mb-4">
                                        <Card.Header>
                                            <h6 className="mb-0">Học sinh chưa làm bài</h6>
                                        </Card.Header>
                                        <Card.Body style={{ maxHeight: "300px", overflowY: "auto" }}>
                                            {studentsNotSubmitted.length === 0 ? (
                                                <div className="text-center text-muted py-3">
                                                    <Users size={32} className="mb-2" />
                                                    <p className="mb-0">Tất cả học sinh đã hoàn thành bài tập</p>
                                                </div>
                                            ) : (
                                                <div className="d-grid gap-2">
                                                    {studentsNotSubmitted.map((student) => (
                                                        <div key={student._id} className="d-flex align-items-center p-2 border rounded justify-content-between">
                                                            <div className="d-flex align-items-center">
                                                                <img
                                                                    src={
                                                                        student.profile?.avatarUrl ||
                                                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(student.profile?.fullName || '')}&background=6366f1&color=fff`
                                                                    }
                                                                    alt={student.profile?.fullName}
                                                                    className="rounded-circle me-3"
                                                                    style={{ width: "32px", height: "32px", objectFit: "cover" }}
                                                                />
                                                                <div>
                                                                    <div className="fw-medium small">{student.profile?.fullName}</div>
                                                                    <div className="text-muted small">{student.email}</div>
                                                                </div>
                                                            </div>
                                                            {assignment.type === 'essay' && (
                                                                <Button size="sm" variant="outline-primary" onClick={() => handleOpenGradeModal(student)}>
                                                                    Chấm điểm
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Tab.Pane>

                        {/* Essay Submissions Tab */}
                        {assignment.type === "essay" && (
                            <Tab.Pane active={activeTab === "submissions"}>
                                {submissions.length === 0 ? (
                                    <div className="text-center py-5">
                                        <FileText size={48} className="text-muted mb-3" />
                                        <h5 className="text-muted">Chưa có bài nộp nào</h5>
                                        <p className="text-muted">Các bài nộp của học sinh sẽ xuất hiện ở đây</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <Table hover>
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Học sinh</th>
                                                    <th>Thời gian nộp</th>
                                                    <th>Trạng thái</th>
                                                    <th>Điểm</th>
                                                    <th className="text-center">Hành động</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {submissions.map((submission) => (
                                                    <tr key={submission._id}>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <img
                                                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(submission.studentId?.profile?.fullName || '')}&background=6366f1&color=fff`}
                                                                    alt={submission.studentId?.profile?.fullName}
                                                                    className="rounded-circle me-3"
                                                                    style={{ width: "32px", height: "32px", objectFit: "cover" }}
                                                                />
                                                                <div>
                                                                    <div className="fw-medium">{submission.studentId?.profile?.fullName}</div>
                                                                    <small className="text-muted">{submission.studentId?.email}</small>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="small">{formatDateTime(submission.submittedAt)}</div>
                                                        </td>
                                                        <td>
                                                            {submission.grade?.score !== null && submission.grade?.score !== undefined ? (
                                                                <Badge bg="success">Đã chấm</Badge>
                                                            ) : (
                                                                <Badge bg="warning">Chờ chấm</Badge>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {submission.grade?.score !== null && submission.grade?.score !== undefined ? (
                                                                <div className="d-flex align-items-center">
                                                                    <Star size={16} className="text-warning me-1" />
                                                                    <span className="fw-bold">{submission.grade.score}/10</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted">-</span>
                                                            )}
                                                        </td>
                                                        <td className="text-center">
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={() => setSelectedSubmission(submission)}
                                                            >
                                                                <Eye size={14} className="me-1" />
                                                                {submission.grade?.score !== null && submission.grade?.score !== undefined ? "Xem chi tiết" : "Chấm điểm"}
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </Tab.Pane>
                        )}

                        {/* Quiz Results Tab */}
                        {assignment.type === "quiz" && (
                            <Tab.Pane active={activeTab === "results"}>
                                {studentsSubmitted.length === 0 ? (
                                    <div className="text-center py-5">
                                        <CheckCircle size={48} className="text-muted mb-3" />
                                        <h5 className="text-muted">Chưa có kết quả nào</h5>
                                        <p className="text-muted">Kết quả bài trắc nghiệm sẽ xuất hiện ở đây</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <Table hover>
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Học sinh</th>
                                                    <th>Thời gian hoàn thành</th>
                                                    <th>Thời gian làm bài</th>
                                                    <th>Điểm</th>
                                                    <th>Tỷ lệ đúng</th>
                                                    <th className="text-center">Hành động</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {studentsSubmitted.map((result) => (
                                                    <tr key={result._id}>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <img
                                                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(result.studentName)}&background=6366f1&color=fff`}
                                                                    alt={result.studentName}
                                                                    className="rounded-circle me-3"
                                                                    style={{ width: "32px", height: "32px", objectFit: "cover" }}
                                                                />
                                                                <div>
                                                                    <div className="fw-medium">{result.studentName}</div>
                                                                    <small className="text-muted">{result.studentEmail}</small>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="small">{formatDateTime(result.completedAt)}</div>
                                                        </td>
                                                        <td>
                                                            <span className="small">{result.timeSpent} phút</span>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <Star size={16} className="text-warning me-1" />
                                                                <span className="fw-bold">
                                                                    {result.score}/{result.totalScore}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <Badge
                                                                bg={
                                                                    result.percentage >= 80 ? "success" : result.percentage >= 60 ? "warning" : "danger"
                                                                }
                                                            >
                                                                {result.percentage}%
                                                            </Badge>
                                                        </td>
                                                        <td className="text-center">
                                                            <Button variant="outline-primary" size="sm" onClick={() => handleViewQuizResult(result)}>
                                                                <Eye size={14} className="me-1" />
                                                                Xem chi tiết
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </Tab.Pane>
                        )}
                    </Tab.Content>
                </Modal.Body>

                <Modal.Footer>
                    <div className="d-flex justify-content-between w-100 align-items-center">
                        <div className="text-muted small">
                            {assignment.type === "essay"
                                ? `${submissions.length} bài nộp • ${stats.gradedCount} đã chấm • Điểm TB: ${stats.avgGrade}/10`
                                : `${studentsSubmitted.length} kết quả • Điểm TB: ${stats.avgScore}%`}
                        </div>
                        <Button variant="secondary" onClick={onHide}>
                            Đóng
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>

            {/* Essay Submission Detail Modal */}
            <EssaySubmissionDetail
                show={showSubmissionDetail}
                onHide={() => setShowSubmissionDetail(false)}
                submission={selectedSubmission}
                assignment={assignment}
                onGradeUpdate={() => {}} // This prop is no longer needed as grading is handled by API
            />

            {/* Quiz Result Detail Modal */}
            <QuizResultDetail
                show={showQuizDetail}
                onHide={() => setShowQuizDetail(false)}
                result={selectedQuizResult}
                assignment={assignment}
            />

            {/* Modal chấm điểm học sinh chưa nộp */}
            <Modal show={showGradeModal} onHide={() => setShowGradeModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Chấm điểm cho học sinh</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        <strong>Học sinh:</strong> {gradingStudent?.profile?.fullName} <br />
                        <strong>Email:</strong> {gradingStudent?.email}
                    </div>
                    <Form.Group>
                        <Form.Label>Điểm (0-10)</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type="number"
                                min={0}
                                max={10}
                                step={0.1}
                                value={gradeValue}
                                onChange={e => setGradeValue(e.target.value)}
                                disabled={gradeLoading}
                            />
                        </InputGroup>
                        {gradeError && <div className="text-danger small mt-2">{gradeError}</div>}
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowGradeModal(false)} disabled={gradeLoading}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleGradeStudent} disabled={gradeLoading}>
                        {gradeLoading ? 'Đang lưu...' : 'Lưu điểm'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default AssignmentDetailModal
