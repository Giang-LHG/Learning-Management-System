"use client"

import { Button } from "react-bootstrap"

import { Modal, Card, Row, Col, Badge } from "react-bootstrap"
import { CheckCircle, X, User, BarChart3, Award } from "lucide-react"

const QuizResultDetail = ({ show, onHide, result, assignment }) => {
    const formatDateTime = (dateString) => {
        if (!dateString) return "Chưa xác định"
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

    const getGradeColor = (percentage) => {
        if (percentage >= 80) return "success"
        if (percentage >= 60) return "warning"
        return "danger"
    }

    const getGradeLetter = (percentage) => {
        if (percentage >= 80) return "A"
        if (percentage >= 60) return "B"
        if (percentage >= 40) return "C"
        return "D"
    }

    if (!result) return null

    // Use questions prop if provided, otherwise fallback to mockQuestions
    const mockQuestions = [
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
        {
            questionId: "q3",
            text: "Template literals trong ES6 sử dụng ký tự nào?",
            options: [
                { key: "A", text: "Dấu nháy đơn ('')" },
                { key: "B", text: 'Dấu nháy kép ("")' },
                { key: "C", text: "Dấu backtick (``)" },
                { key: "D", text: "Dấu gạch chéo (//)" },
            ],
            correctOption: "C",
            points: 2,
        },
        {
            questionId: "q4",
            text: "Const trong ES6 có đặc điểm gì?",
            options: [
                { key: "A", text: "Không thể thay đổi giá trị sau khi khai báo" },
                { key: "B", text: "Có thể khai báo mà không gán giá trị" },
                { key: "C", text: "Có phạm vi function scope" },
                { key: "D", text: "Có thể hoisting" },
            ],
            correctOption: "A",
            points: 2,
        },
        {
            questionId: "q5",
            text: "Spread operator (...) được sử dụng để làm gì?",
            options: [
                { key: "A", text: "Kết hợp các object" },
                { key: "B", text: "Sao chép array" },
                { key: "C", text: "Truyền tham số cho function" },
                { key: "D", text: "Tất cả các đáp án trên" },
            ],
            correctOption: "D",
            points: 2,
        },
    ]
    const questions = (Array.isArray(assignment?.questions) && assignment.questions.length > 0)
        ? assignment.questions
        : (Array.isArray(result?.questions) && result.questions.length > 0)
            ? result.questions
            : mockQuestions;

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title className="d-flex align-items-center">
                    <CheckCircle size={24} className="me-2" />
                    Quiz Result - {result.studentName}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {/* Student Info & Results Summary */}
                <Card className="mb-4">
                    <Card.Header>
                        <h5 className="mb-0 d-flex align-items-center">
                            <User size={20} className="me-2" />
                            Student Info & Result
                        </h5>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <div className="d-flex align-items-center mb-3">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(result.studentName)}&background=6366f1&color=fff`}
                                        alt={result.studentName}
                                        className="rounded-circle me-3"
                                        style={{ width: "48px", height: "48px", objectFit: "cover" }}
                                    />
                                    <div>
                                        <div className="fw-bold">{result.studentName}</div>
                                        <div className="text-muted small">{result.studentEmail}</div>
                                    </div>
                                </div>
                                <div className="d-grid gap-2">
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted">Completed At:</span>
                                        <span className="fw-medium">{result.completedAt ? formatDateTime(result.completedAt) : "Not specified"}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted">Time Spent:</span>
                                        <span className="fw-medium">{result.timeSpent ?? 0} minutes</span>
                                    </div>
                                </div>
                            </Col>
                            <Col md={6}>
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Card className="text-center bg-light">
                                            <Card.Body className="py-3">
                                                <div className="h3 fw-bold text-primary mb-1">
                                                    {(result.score ?? 0)}/{(result.totalScore ?? 0)}
                                                </div>
                                                <small className="text-muted">Score</small>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={6}>
                                        <Card className="text-center bg-light">
                                            <Card.Body className="py-3">
                                                <div className={`h3 fw-bold text-${getGradeColor(result.percentage ?? 0)} mb-1`}>
                                                    {(result.percentage ?? 0)}%
                                                </div>
                                                <small className="text-muted">Correct Rate</small>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={12}>
                                        <Card className="text-center">
                                            <Card.Body className="py-3">
                                                <Badge bg={getGradeColor(result.percentage ?? 0)} className="fs-5 px-3 py-2">
                                                    <Award size={16} className="me-2" />
                                                    Grade: {getGradeLetter(result.percentage ?? 0)}
                                                </Badge>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Statistics */}
                <Card className="mb-4">
                    <Card.Header>
                        <h5 className="mb-0 d-flex align-items-center">
                            <BarChart3 size={20} className="me-2" />
                            Detailed Statistics
                        </h5>
                    </Card.Header>
                    <Card.Body>
                        <Row className="text-center">
                            <Col md={3}>
                                <div className="p-3">
                                    <div className="h4 fw-bold text-success mb-1">{result.answers ? result.answers.filter((a) => a.isCorrect).length : 0}</div>
                                    <small className="text-muted">Correct</small>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="p-3">
                                    <div className="h4 fw-bold text-danger mb-1">{result.answers ? result.answers.filter((a) => !a.isCorrect).length : 0}</div>
                                    <small className="text-muted">Incorrect</small>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="p-3">
                                    <div className="h4 fw-bold text-primary mb-1">{result.answers ? result.answers.length : 0}</div>
                                    <small className="text-muted">Total</small>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="p-3">
                                    <div className="h4 fw-bold text-info mb-1">
                                        {result.answers ? result.answers.reduce((sum, a) => sum + (Number(a.points) || 0), 0) : 0}
                                    </div>
                                    <small className="text-muted">Total Points</small>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Detailed Answers */}
                <Card>
                    <Card.Header>
                        <h5 className="mb-0">Question Details</h5>
                    </Card.Header>
                    <Card.Body>
                        <div className="d-grid gap-4">
                            {questions.map((question, index) => {
                                const studentAnswer = result.answers.find((a) => a.questionId === question.questionId)
                                const isCorrect = studentAnswer?.isCorrect || false

                                return (
                                    <Card
                                        key={question.questionId}
                                        className={`border-start border-4 border-${isCorrect ? "success" : "danger"}`}
                                    >
                                        <Card.Body>
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <h6 className="fw-semibold mb-0">
                                                    Question {index + 1}: {question.text}
                                                </h6>
                                                <div className="d-flex align-items-center gap-2">
                                                    <Badge bg={isCorrect ? "success" : "danger"}>
                                                        {isCorrect ? (
                                                            <>
                                                                <CheckCircle size={14} className="me-1" />
                                                                Correct
                                                            </>
                                                        ) : (
                                                            <>
                                                                <X size={14} className="me-1" />
                                                                Incorrect
                                                            </>
                                                        )}
                                                    </Badge>
                                                    <Badge bg="info">
                                                        {studentAnswer?.points || 0}/{question.points} points
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="d-grid gap-2">
                                                {question.options.map((option) => {
                                                    const isStudentChoice = studentAnswer?.selectedOption === option.key
                                                    const isCorrectAnswer = question.correctOption === option.key

                                                    let bgClass = ""
                                                    let textClass = ""
                                                    let icon = null

                                                    if (isCorrectAnswer) {
                                                        bgClass = "bg-success bg-opacity-10 border-success"
                                                        textClass = "text-success"
                                                        icon = <CheckCircle size={16} className="text-success" />
                                                    } else if (isStudentChoice && !isCorrectAnswer) {
                                                        bgClass = "bg-danger bg-opacity-10 border-danger"
                                                        textClass = "text-danger"
                                                        icon = <X size={16} className="text-danger" />
                                                    }

                                                    return (
                                                        <div
                                                            key={option.key}
                                                            className={`p-3 border rounded d-flex align-items-center justify-content-between ${bgClass}`}
                                                        >
                                                            <div className="d-flex align-items-center">
                                                                <Badge bg="secondary" className={`me-3 ${textClass}`} style={{ minWidth: "24px" }}>
                                                                    {option.key}
                                                                </Badge>
                                                                <span className={textClass || "text-dark"}>{option.text}</span>
                                                            </div>
                                                            <div className="d-flex align-items-center gap-2">
                                                                {isStudentChoice && (
                                                                    <Badge bg="primary" className="small">
                                                                        Selected
                                                                    </Badge>
                                                                )}
                                                                {icon}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>

                                            {!isCorrect && (
                                                <div className="mt-3 p-3 bg-light rounded">
                                                    <small className="text-muted">
                                                        <strong>Correct Answer:</strong> {question.correctOption} -{" "}
                                                        {question.options.find((opt) => opt.key === question.correctOption)?.text}
                                                    </small>
                                                </div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                )
                            })}
                        </div>
                    </Card.Body>
                </Card>
            </Modal.Body>

            <Modal.Footer>
                <div className="d-flex justify-content-between w-100 align-items-center">
                    <div className="text-muted small">
                        Quiz: {assignment?.title} • Completed at: {result.completedAt ? formatDateTime(result.completedAt) : "Not specified"}
                    </div>
                    <div className="d-flex gap-2">
                        <Button variant="secondary" onClick={onHide}>
                            Close
                        </Button>
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    )
}

export default QuizResultDetail
