"use client"

import { useState } from "react"
import { Modal, Card, Button, Form, Row, Col, Badge, Alert } from "react-bootstrap"
import { FileText, Download, Star, Save, Edit3, User } from "lucide-react"

const EssaySubmissionDetail = ({ show, onHide, submission, assignment, onGradeUpdate }) => {
    const [isGrading, setIsGrading] = useState(false)
    const [grade, setGrade] = useState("")
    const [feedback, setFeedback] = useState("")
    const [errors, setErrors] = useState({})

    const handleStartGrading = () => {
        setIsGrading(true)
        setGrade(submission?.grade?.toString() || "")
        setFeedback(submission?.feedback || "")
        setErrors({})
    }

    const handleCancelGrading = () => {
        setIsGrading(false)
        setGrade("")
        setFeedback("")
        setErrors({})
    }

    const validateGrade = () => {
        const newErrors = {}

        if (!grade.trim()) {
            newErrors.grade = "Điểm số là bắt buộc"
        } else {
            const gradeNum = Number.parseFloat(grade)
            if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 10) {
                newErrors.grade = "grade between 0 and 10"
            }
        }

        if (!feedback.trim()) {
            newErrors.feedback = "feedback is required"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSaveGrade = () => {
        if (!validateGrade()) {
            return
        }

        onGradeUpdate(submission._id, Number.parseFloat(grade), feedback)
        setIsGrading(false)
        setGrade("")
        setFeedback("")
    }

    const formatDateTime = (dateString) => {
        if (!dateString) return "No specified"
        try {
            return new Date(dateString).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
        } catch (error) {
            return "Thời gian không hợp lệ"
        }
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    if (!submission) return null

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title className="d-flex align-items-center">
                    <FileText size={24} className="me-2" />
                    Detail submission - {submission.studentName}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {/* Student Info */}
                <Card className="mb-4">
                    <Card.Header>
                        <h5 className="mb-0 d-flex align-items-center">
                            <User size={20} className="me-2" />
                          Student information
                        </h5>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <div className="d-flex align-items-center mb-3">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(submission.studentName)}&background=6366f1&color=fff`}
                                        alt={submission.studentName}
                                        className="rounded-circle me-3"
                                        style={{ width: "48px", height: "48px", objectFit: "cover" }}
                                    />
                                    <div>
                                        <div className="fw-bold">{submission.studentName}</div>
                                        <div className="text-muted small">{submission.studentEmail}</div>
                                    </div>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="d-grid gap-2">
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted">Date submission:</span>
                                        <span className="fw-medium">{formatDateTime(submission.submittedAt)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted">Graded:</span>
                                        <Badge bg={submission.grade !== null ? "success" : "warning"}>
                                            {submission.grade !== null ? "Đã chấm" : "Chờ chấm"}
                                        </Badge>
                                    </div>
                                    {submission.grade !== null && (
                                        <>
                                            <div className="d-flex justify-content-between">
                                                <span className="text-muted">Score:</span>
                                                <span className="fw-bold text-primary">{submission.grade}/10</span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span className="text-muted">Graded by:</span>
                                                <span className="fw-medium">{submission.gradedBy}</span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span className="text-muted">Date graded:</span>
                                                <span className="fw-medium">{formatDateTime(submission.gradedAt)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Assignment Content */}
                <Card className="mb-4">
                    <Card.Header>
                        <h5 className="mb-0">Nội dung bài làm</h5>
                    </Card.Header>
                    <Card.Body>
                        <div className="bg-light p-3 rounded" style={{ minHeight: "200px" }}>
                            <p className="mb-0 lh-lg" style={{ whiteSpace: "pre-wrap" }}>
                                {submission.content}
                            </p>
                        </div>
                    </Card.Body>
                </Card>

                {/* Attachments */}
                {submission.attachments && submission.attachments.length > 0 && (
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">File đính kèm ({submission.attachments.length})</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-grid gap-2">
                                {submission.attachments.map((file, index) => (
                                    <div key={index} className="d-flex align-items-center justify-content-between p-3 border rounded">
                                        <div className="d-flex align-items-center">
                                            <FileText size={20} className="text-primary me-3" />
                                            <div>
                                                <div className="fw-medium">{file.name}</div>
                                                <small className="text-muted">{file.size}</small>
                                            </div>
                                        </div>
                                        <Button variant="outline-primary" size="sm">
                                            <Download size={14} className="me-1" />
                                            Tải xuống
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {/* Grading Section */}
                <Card>
                    <Card.Header className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 d-flex align-items-center">
                            <Star size={20} className="me-2" />
                            Chấm điểm
                        </h5>
                        {!isGrading && submission.grade === null && (
                            <Button variant="primary" onClick={handleStartGrading}>
                                <Edit3 size={16} className="me-1" />
                                Bắt đầu chấm
                            </Button>
                        )}
                        {!isGrading && submission.grade !== null && (
                            <Button variant="outline-primary" onClick={handleStartGrading}>
                                <Edit3 size={16} className="me-1" />
                                Chỉnh sửa điểm
                            </Button>
                        )}
                    </Card.Header>
                    <Card.Body>
                        {!isGrading ? (
                            // Display existing grade/feedback
                            submission.grade !== null ? (
                                <div>
                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <div className="text-center p-3 bg-light rounded">
                                                <div className="h2 fw-bold text-primary mb-1">{submission.grade}/10</div>
                                                <small className="text-muted">Điểm số</small>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="text-center p-3 bg-light rounded">
                                                <div className="h2 fw-bold text-success mb-1">
                                                    {submission.grade >= 8
                                                        ? "A"
                                                        : submission.grade >= 6.5
                                                            ? "B"
                                                            : submission.grade >= 5
                                                                ? "C"
                                                                : "D"}
                                                </div>
                                                <small className="text-muted">Xếp loại</small>
                                            </div>
                                        </Col>
                                    </Row>
                                    <div>
                                        <h6 className="fw-semibold mb-2">Nhận xét của giảng viên:</h6>
                                        <div className="bg-light p-3 rounded">
                                            <p className="mb-0 lh-lg">{submission.feedback}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <Star size={48} className="text-muted mb-3" />
                                    <h6 className="text-muted">Bài làm chưa được chấm điểm</h6>
                                    <p className="text-muted mb-3">Nhấn "Bắt đầu chấm" để chấm điểm cho bài làm này</p>
                                </div>
                            )
                        ) : (
                            // Grading form
                            <Form>
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Label>
                                            Điểm số <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            placeholder="Nhập điểm (0-10)"
                                            value={grade}
                                            onChange={(e) => setGrade(e.target.value)}
                                            isInvalid={!!errors.grade}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.grade}</Form.Control.Feedback>
                                        <Form.Text className="text-muted">Điểm từ 0 đến 10, có thể nhập số thập phân</Form.Text>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Label>Xếp loại dự kiến</Form.Label>
                                        <div className="p-2 bg-light rounded text-center">
                                            <span className="h5 fw-bold">
                                                {grade
                                                    ? Number.parseFloat(grade) >= 8
                                                        ? "A (Xuất sắc)"
                                                        : Number.parseFloat(grade) >= 6.5
                                                            ? "B (Khá)"
                                                            : Number.parseFloat(grade) >= 5
                                                                ? "C (Trung bình)"
                                                                : "D (Yếu)"
                                                    : "-"}
                                            </span>
                                        </div>
                                    </Col>
                                </Row>
                                <div className="mb-3">
                                    <Form.Label>
                                        Nhận xét <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        placeholder="Nhập nhận xét chi tiết về bài làm của học sinh..."
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        isInvalid={!!errors.feedback}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.feedback}</Form.Control.Feedback>
                                    <Form.Text className="text-muted">Hãy đưa ra nhận xét chi tiết để giúp học sinh cải thiện</Form.Text>
                                </div>

                                {Object.keys(errors).length > 0 && (
                                    <Alert variant="danger">
                                        <strong>Vui lòng kiểm tra lại:</strong>
                                        <ul className="mb-0 mt-2">
                                            {Object.values(errors).map((error, index) => (
                                                <li key={index}>{error}</li>
                                            ))}
                                        </ul>
                                    </Alert>
                                )}

                                <div className="d-flex gap-2">
                                    <Button variant="success" onClick={handleSaveGrade}>
                                        <Save size={16} className="me-1" />
                                        Lưu điểm
                                    </Button>
                                    <Button variant="outline-secondary" onClick={handleCancelGrading}>
                                        Hủy
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Card.Body>
                </Card>
            </Modal.Body>

            <Modal.Footer>
                <div className="d-flex justify-content-between w-100 align-items-center">
                    <div className="text-muted small">
                        Bài tập: {assignment?.title} • Hạn nộp: {formatDateTime(assignment?.dueDate)}
                    </div>
                    <Button variant="secondary" onClick={onHide}>
                        Đóng
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    )
}

export default EssaySubmissionDetail
