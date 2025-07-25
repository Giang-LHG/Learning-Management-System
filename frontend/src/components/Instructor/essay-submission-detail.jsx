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
        setIsGrading(true);
        // Use score and feedback from new structure if available
        const score = (submission.grade && (typeof submission.grade.score === 'number' || typeof submission.grade.score === 'string')) ? submission.grade.score : submission.grade || '';
        const fb = (submission.grade && submission.grade.feedback) ? submission.grade.feedback : submission.feedback || '';
        setGrade(score?.toString() || "");
        setFeedback(fb);
        setErrors({});
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
            newErrors.grade = "Score is required"
        } else {
            const gradeNum = Number.parseFloat(grade)
            if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 10) {
                newErrors.grade = "Score must be between 0 and 10"
            }
        }

        if (!feedback.trim()) {
            newErrors.feedback = "Feedback is required"
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

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    if (!submission) return null

    // Extract student info and grade info from submission (support both new and old structure)
    const studentName = submission.studentId?.profile?.fullName || submission.studentName || '';
    const studentEmail = submission.studentId?.email || submission.studentEmail || '';
    const submittedAt = submission.submittedAt;
    const gradeScore = (submission.grade && (typeof submission.grade.score === 'number' || typeof submission.grade.score === 'string')) ? submission.grade.score : submission.grade || null;
    const feedbackValue = (submission.grade && submission.grade.feedback) ? submission.grade.feedback : submission.feedback || '';
    const gradedBy = (submission.grade && submission.grade.gradedBy) ? submission.grade.gradedBy : submission.gradedBy || '';
    const gradedAt = (submission.grade && submission.grade.gradedAt) ? submission.grade.gradedAt : submission.gradedAt || '';

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title className="d-flex align-items-center">
                    <FileText size={24} className="me-2" />
                    Submission Details - {studentName}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {/* Student Info */}
                <Card className="mb-4">
                    <Card.Header>
                        <h5 className="mb-0 d-flex align-items-center">
                            <User size={20} className="me-2" />
                          Student Information
                        </h5>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <div className="d-flex align-items-center mb-3">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=6366f1&color=fff`}
                                        alt={studentName}
                                        className="rounded-circle me-3"
                                        style={{ width: "48px", height: "48px", objectFit: "cover" }}
                                    />
                                    <div>
                                        <div className="fw-bold">{studentName}</div>
                                        <div className="text-muted small">{studentEmail}</div>
                                    </div>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="d-grid gap-2">
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted">Date submission:</span>
                                        <span className="fw-medium">{formatDateTime(submittedAt)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted">Graded:</span>
                                        <Badge bg={gradeScore !== null && gradeScore !== undefined ? "success" : "warning"}>
                                            {gradeScore !== null && gradeScore !== undefined ? "Graded" : "Pending"}
                                        </Badge>
                                    </div>
                                    {gradeScore !== null && gradeScore !== undefined && (
                                        <>
                                            <div className="d-flex justify-content-between">
                                                <span className="text-muted">Score:</span>
                                                <span className="fw-bold text-primary">{gradeScore}/10</span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span className="text-muted">Graded by:</span>
                                                <span className="fw-medium">{gradedBy}</span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span className="text-muted">Date graded:</span>
                                                <span className="fw-medium">{formatDateTime(gradedAt)}</span>
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
                        <h5 className="mb-0">Submission Content</h5>
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
                            <h5 className="mb-0">Attachments ({submission.attachments.length})</h5>
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
                                            Download
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
                            Grading
                        </h5>
                        {!isGrading && gradeScore === null && (
                            <Button variant="primary" onClick={handleStartGrading}>
                                <Edit3 size={16} className="me-1" />
                                Start Grading
                            </Button>
                        )}
                        {!isGrading && gradeScore !== null && (
                            <Button variant="outline-primary" onClick={handleStartGrading}>
                                <Edit3 size={16} className="me-1" />
                                Edit Grade
                            </Button>
                        )}
                    </Card.Header>
                    <Card.Body>
                        {!isGrading ? (
                            // Display existing grade/feedback
                            gradeScore !== null && gradeScore !== undefined ? (
                                <div>
                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <div className="text-center p-3 bg-light rounded">
                                                <div className="h2 fw-bold text-primary mb-1">{gradeScore}/10</div>
                                                <small className="text-muted">Score</small>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="text-center p-3 bg-light rounded">
                                                <div className="h2 fw-bold text-success mb-1">
                                                    {gradeScore >= 8
                                                        ? "A"
                                                        : gradeScore >= 6.5
                                                            ? "B"
                                                            : gradeScore >= 5
                                                                ? "C"
                                                                : "D"}
                                                </div>
                                                <small className="text-muted">Grade</small>
                                            </div>
                                        </Col>
                                    </Row>
                                    <div>
                                        <h6 className="fw-semibold mb-2">Instructor Feedback:</h6>
                                        <div className="bg-light p-3 rounded">
                                            <p className="mb-0 lh-lg">{feedbackValue}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <Star size={48} className="text-muted mb-3" />
                                    <h6 className="text-muted">This submission has not been graded yet</h6>
                                    <p className="text-muted mb-3">Click "Start Grading" to grade this submission</p>
                                </div>
                            )
                        ) : (
                            // Grading form
                            <Form>
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Label>
                                            Score <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            placeholder="Enter score (0-10)"
                                            value={grade}
                                            onChange={(e) => setGrade(e.target.value)}
                                            isInvalid={!!errors.grade}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.grade}</Form.Control.Feedback>
                                        <Form.Text className="text-muted">Score from 0 to 10, decimals allowed</Form.Text>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Label>Expected Grade</Form.Label>
                                        <div className="p-2 bg-light rounded text-center">
                                            <span className="h5 fw-bold">
                                                {grade
                                                    ? Number.parseFloat(grade) >= 8
                                                        ? "A (Excellent)"
                                                        : Number.parseFloat(grade) >= 6.5
                                                            ? "B (Good)"
                                                            : Number.parseFloat(grade) >= 5
                                                                ? "C (Average)"
                                                                : "D (Poor)"
                                                    : "-"}
                                            </span>
                                        </div>
                                    </Col>
                                </Row>
                                <div className="mb-3">
                                    <Form.Label>
                                        Feedback <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        placeholder="Enter detailed feedback for the student's submission..."
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        isInvalid={!!errors.feedback}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.feedback}</Form.Control.Feedback>
                                    <Form.Text className="text-muted">Please provide detailed feedback to help the student improve</Form.Text>
                                </div>

                                {Object.keys(errors).length > 0 && (
                                    <Alert variant="danger">
                                        <strong>Please check the following:</strong>
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
                                        Save Grade
                                    </Button>
                                    <Button variant="outline-secondary" onClick={handleCancelGrading}>
                                        Cancel
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
                        Assignment: {assignment?.title} • Due: {formatDateTime(assignment?.dueDate)}
                    </div>
                    <Button variant="secondary" onClick={onHide}>
                        Close
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    )
}

export default EssaySubmissionDetail
