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
        if (!dateString) return "Not specified"
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
        } catch (error) {
            return "Invalid time"
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
        console.log('DEBUG selectedSubmission:', submission);
        setSelectedSubmission(submission);
        setShowSubmissionDetail(true);
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
            setGradeError('Score must be between 0 and 10')
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
            setGradeError('Failed to grade')
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
                        Assignment Details: {assignment.title}
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
                                            Due Date: {formatDateTime(assignment.dueDate)}
                                        </span>
                                        <Badge bg={assignment.type === "quiz" ? "info" : "primary"}>
                                            {assignment.type === "quiz" ? "Quiz" : "Essay"}
                                        </Badge>
                                        <Badge bg={assignment.isVisible ? "success" : "secondary"}>
                                            {assignment.isVisible ? "Visible" : "Hidden"}
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
                                                    <small className="text-muted">{assignment.type === "essay" ? "Submitted" : "Completed"}</small>
                                                </div>
                                                <div>
                                                    <div className="h4 fw-bold text-success mb-0">
                                                        {assignment.type === "essay" ? `${stats.submissionRate}%` : `${stats.completionRate}%`}
                                                    </div>
                                                    <small className="text-muted">Rate</small>
                                                </div>
                                                <div>
                                                    <div className="h4 fw-bold text-warning mb-0">
                                                        {assignment.type === "essay" ? stats.avgGrade : `${stats.avgScore}%`}
                                                    </div>
                                                    <small className="text-muted">{assignment.type === "essay" ? "Avg Grade" : "Avg Score"}</small>
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
                                Overview
                            </Nav.Link>
                        </Nav.Item>
                        {assignment.type === "essay" && (
                            <Nav.Item>
                                <Nav.Link eventKey="submissions" className="d-flex align-items-center">
                                    <FileText size={16} className="me-2" />
                                    Submissions ({studentsSubmitted.length})
                                </Nav.Link>
                            </Nav.Item>
                        )}
                        {assignment.type === "quiz" && (
                            <Nav.Item>
                                <Nav.Link eventKey="results" className="d-flex align-items-center">
                                    <CheckCircle size={16} className="me-2" />
                                    Results ({studentsSubmitted.length})
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
                                            <h6 className="mb-0">General Statistics</h6>
                                        </Card.Header>
                                        <Card.Body>
                                            <div className="d-grid gap-3">
                                                <div className="d-flex justify-content-between">
                                                    <span>Total Students:</span>
                                                    <span className="fw-bold">{stats.totalStudents}</span>
                                                </div>
                                                <div className="d-flex justify-content-between">
                                                    <span>{assignment.type === "essay" ? "Submitted:" : "Completed:"}</span>
                                                    <span className="fw-bold text-success">
                                                        {assignment.type === "essay" ? stats.submittedCount : stats.completedCount}
                                                    </span>
                                                </div>
                                                <div className="d-flex justify-content-between">
                                                    <span>Not submitted:</span>
                                                    <span className="fw-bold text-danger">
                                                        {stats.totalStudents -
                                                            (assignment.type === "essay" ? stats.submittedCount : stats.completedCount)}
                                                    </span>
                                                </div>
                                                {assignment.type === "essay" && (
                                                    <div className="d-flex justify-content-between">
                                                        <span>Graded:</span>
                                                        <span className="fw-bold text-info">{stats.gradedCount}</span>
                                                    </div>
                                                )}
                                                <hr />
                                                <div className="d-flex justify-content-between">
                                                    <span>Average Score:</span>
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
                                            <h6 className="mb-0">Students not submitted</h6>
                                        </Card.Header>
                                        <Card.Body style={{ maxHeight: "300px", overflowY: "auto" }}>
                                            {studentsNotSubmitted.length === 0 ? (
                                                <div className="text-center text-muted py-3">
                                                    <Users size={32} className="mb-2" />
                                                    <p className="mb-0">All students have completed the assignment</p>
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
                                                                    Grade
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
                                        <h5 className="text-muted">No submissions yet</h5>
                                        <p className="text-muted">Student submissions will appear here</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <Table hover>
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Student</th>
                                                    <th>Submission Time</th>
                                                    <th>Status</th>
                                                    <th>Grade</th>
                                                    <th className="text-center">Actions</th>
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
                                                                <Badge bg="success">Graded</Badge>
                                                            ) : (
                                                                <Badge bg="warning">Pending Grade</Badge>
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
                                                                onClick={() => handleViewSubmission(submission)}
                                                            >
                                                                <Eye size={14} className="me-1" />
                                                                {submission.grade?.score !== null && submission.grade?.score !== undefined ? "View Details" : "Grade"}
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
                                        <h5 className="text-muted">No results yet</h5>
                                        <p className="text-muted">Quiz results will appear here</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <Table hover>
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Student</th>
                                                    <th>Completion Time</th>
                                                    <th>Time Spent</th>
                                                    <th>Score</th>
                                                    <th>Correct Rate</th>
                                                    <th className="text-center">Actions</th>
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
                                                            <span className="small">{result.timeSpent} minutes</span>
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
                                                                View Details
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
                                ? `${submissions.length} submissions • ${stats.gradedCount} graded • Avg Grade: ${stats.avgGrade}/10`
                                : `${studentsSubmitted.length} results • Avg Score: ${stats.avgScore}%`}
                        </div>
                        <Button variant="secondary" onClick={onHide}>
                            Close
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>

            {/* Essay Submission Detail Modal */}
            {selectedSubmission && (
                <EssaySubmissionDetail
                    show={showSubmissionDetail}
                    onHide={() => setShowSubmissionDetail(false)}
                    submission={selectedSubmission}
                    assignment={assignment}
                    onGradeUpdate={async (submissionId, score, feedback) => {
                        if (!selectedSubmission) return;
                        try {
                            await api.post(`/instructor/submissions/assignment/${assignment._id}/grade-student`, {
                                studentId: selectedSubmission.studentId?._id || selectedSubmission.studentId,
                                score,
                                content: feedback
                            });
                            // Reload submissions
                            const [statusRes, subRes] = await Promise.all([
                                api.get(`/instructor/submissions/assignment/${assignment._id}/submission-status`),
                                api.get(`/instructor/submissions/assignment/${assignment._id}`)
                            ]);
                            setStudentsSubmitted(statusRes.data.data.submitted || []);
                            setStudentsNotSubmitted(statusRes.data.data.notSubmitted || []);
                            setSubmissions(subRes.data.data || []);
                            // Update selectedSubmission with new grade/feedback
                            const updated = (subRes.data.data || []).find(s => s._id === submissionId);
                            if (updated) setSelectedSubmission(updated);
                        } catch (err) {
                            // Optionally: show error notification
                        }
                    }}
                />
            )}

            {/* Quiz Result Detail Modal */}
            <QuizResultDetail
                show={showQuizDetail}
                onHide={() => setShowQuizDetail(false)}
                result={selectedQuizResult}
                assignment={assignment}
                questions={assignment.questions || []}
            />

            {/* Modal chấm điểm học sinh chưa nộp */}
            <Modal show={showGradeModal} onHide={() => setShowGradeModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Grade Student</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        <strong>Student:</strong> {gradingStudent?.profile?.fullName} <br />
                        <strong>Email:</strong> {gradingStudent?.email}
                    </div>
                    <Form.Group>
                        <Form.Label>Score (0-10)</Form.Label>
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
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleGradeStudent} disabled={gradeLoading}>
                        {gradeLoading ? 'Saving...' : 'Save Grade'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default AssignmentDetailModal
