"use client"

import { useState, useEffect } from "react"
import { Modal, Form, Button, Row, Col, Card, Badge, Alert } from "react-bootstrap"
import { Save, Plus, Trash2, FileText, CheckCircle } from "lucide-react"

const AssignmentModal = ({
    show,
    onHide,
    onSubmit,
    assignmentData,
    courseStartDate,
    courseEndDate,
    courseTerm,
    isEditing,
}) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "essay", // essay or quiz
        dueDate: "",
        isVisible: true,
        term: [],
        questions: [], // For quiz type
    })

    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (show) {
            if (assignmentData && isEditing) {
                // Edit mode
                setFormData({
                    title: assignmentData.title || "",
                    description: assignmentData.description || "",
                    type: assignmentData.type || "essay",
                    dueDate: assignmentData.dueDate ? formatDateForInput(assignmentData.dueDate) : "",
                    isVisible: assignmentData.isVisible !== undefined ? assignmentData.isVisible : true,
                    term: assignmentData.term || courseTerm || [],
                    questions: assignmentData.questions || [],
                })
            } else {
                // Add mode
                setFormData({
                    title: "",
                    description: "",
                    type: "essay",
                    dueDate: "",
                    isVisible: true,
                    term: courseTerm || [],
                    questions: [],
                })
            }
            setErrors({})
        }
    }, [show, assignmentData, isEditing, courseTerm])

    const formatDateForInput = (dateString) => {
        if (!dateString) return ""
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return ""
            return date.toISOString().slice(0, 16) // Format for datetime-local input
        } catch (error) {
            console.error("Error formatting date for input:", error)
            return ""
        }
    }

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: "",
            }))
        }
    }

    const handleTypeChange = (newType) => {
        setFormData((prev) => ({
            ...prev,
            type: newType,
            questions: newType === "quiz" ? (prev.questions.length > 0 ? prev.questions : [createNewQuestion()]) : [],
        }))
    }

    const createNewQuestion = () => ({
        questionId: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        text: "",
        options: [
            { key: "A", text: "" },
            { key: "B", text: "" },
            { key: "C", text: "" },
            { key: "D", text: "" },
        ],
        correctOption: "A",
        points: 1,
    })

    const addQuestion = () => {
        setFormData((prev) => ({
            ...prev,
            questions: [...prev.questions, createNewQuestion()],
        }))
    }

    const removeQuestion = (questionIndex) => {
        if (formData.questions.length > 1) {
            setFormData((prev) => ({
                ...prev,
                questions: prev.questions.filter((_, i) => i !== questionIndex),
            }))
        }
    }

    const updateQuestion = (questionIndex, field, value) => {
        const newQuestions = [...formData.questions]
        newQuestions[questionIndex] = {
            ...newQuestions[questionIndex],
            [field]: value,
        }
        setFormData((prev) => ({
            ...prev,
            questions: newQuestions,
        }))
    }

    const updateQuestionOption = (questionIndex, optionKey, value) => {
        const newQuestions = [...formData.questions]
        const optionIndex = newQuestions[questionIndex].options.findIndex((opt) => opt.key === optionKey)
        if (optionIndex >= 0) {
            newQuestions[questionIndex].options[optionIndex].text = value
            setFormData((prev) => ({
                ...prev,
                questions: newQuestions,
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.title.trim()) {
            newErrors.title = "Tên bài tập là bắt buộc"
        }

        if (!formData.description.trim()) {
            newErrors.description = "Mô tả bài tập là bắt buộc"
        }

        if (!formData.dueDate) {
            newErrors.dueDate = "Hạn nộp là bắt buộc"
        }

        // Validate due date is within course period
        if (formData.dueDate && courseStartDate && courseEndDate) {
            const dueDate = new Date(formData.dueDate)
            const startDate = new Date(courseStartDate)
            const endDate = new Date(courseEndDate)

            if (dueDate < startDate) {
                newErrors.dueDate = "Hạn nộp không thể trước ngày bắt đầu khóa học"
            } else if (dueDate > endDate) {
                newErrors.dueDate = "Hạn nộp không thể sau ngày kết thúc khóa học"
            }
        }

        // Validate quiz questions
        if (formData.type === "quiz") {
            if (formData.questions.length === 0) {
                newErrors.questions = "Bài tập trắc nghiệm phải có ít nhất 1 câu hỏi"
            } else {
                formData.questions.forEach((question, index) => {
                    if (!question.text.trim()) {
                        newErrors[`question_${index}_text`] = "Câu hỏi không được để trống"
                    }

                    const hasEmptyOptions = question.options.some((opt) => !opt.text.trim())
                    if (hasEmptyOptions) {
                        newErrors[`question_${index}_options`] = "Tất cả các lựa chọn phải được điền"
                    }

                    if (question.points <= 0) {
                        newErrors[`question_${index}_points`] = "Điểm số phải lớn hơn 0"
                    }
                })
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 500))

            // Process form data
            const assignmentData = {
                ...formData,
                dueDate: new Date(formData.dueDate).toISOString(),
                questions: formData.type === "quiz" ? formData.questions.filter((q) => q.text.trim()) : undefined,
            }

            onSubmit(assignmentData)
            handleClose()
        } catch (error) {
            console.error("Error saving assignment:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        setFormData({
            title: "",
            description: "",
            type: "essay",
            dueDate: "",
            isVisible: true,
            term: [],
            questions: [],
        })
        setErrors({})
        onHide()
    }

    return (
        <Modal show={show} onHide={handleClose} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {formData.type === "quiz" ? (
                        <CheckCircle size={24} className="me-2" />
                    ) : (
                        <FileText size={24} className="me-2" />
                    )}
                    {isEditing ? "Chỉnh sửa bài tập" : "Thêm bài tập mới"}
                </Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                    {/* Basic Information */}
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">Thông tin cơ bản</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={12} className="mb-3">
                                    <Form.Label>
                                        Tên bài tập <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập tên bài tập"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange("title", e.target.value)}
                                        isInvalid={!!errors.title}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                                </Col>

                                <Col md={12} className="mb-3">
                                    <Form.Label>
                                        Mô tả bài tập <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Nhập mô tả chi tiết về bài tập"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange("description", e.target.value)}
                                        isInvalid={!!errors.description}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                                </Col>

                                <Col md={6} className="mb-3">
                                    <Form.Label>
                                        Loại bài tập <span className="text-danger">*</span>
                                    </Form.Label>
                                    <div className="d-flex gap-3">
                                        <Form.Check
                                            type="radio"
                                            id="type-essay"
                                            name="assignmentType"
                                            label="Tự luận"
                                            checked={formData.type === "essay"}
                                            onChange={() => handleTypeChange("essay")}
                                        />
                                        <Form.Check
                                            type="radio"
                                            id="type-quiz"
                                            name="assignmentType"
                                            label="Trắc nghiệm"
                                            checked={formData.type === "quiz"}
                                            onChange={() => handleTypeChange("quiz")}
                                        />
                                    </div>
                                </Col>

                                <Col md={6} className="mb-3">
                                    <Form.Label>
                                        Hạn nộp <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        value={formData.dueDate}
                                        onChange={(e) => handleInputChange("dueDate", e.target.value)}
                                        isInvalid={!!errors.dueDate}
                                        min={courseStartDate ? new Date(courseStartDate).toISOString().slice(0, 16) : undefined}
                                        max={courseEndDate ? new Date(courseEndDate).toISOString().slice(0, 16) : undefined}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.dueDate}</Form.Control.Feedback>
                                    <Form.Text className="text-muted">
                                        {courseStartDate && courseEndDate && (
                                            <>
                                                Hạn nộp phải trong khoảng thời gian khóa học (
                                                {new Date(courseStartDate).toLocaleDateString("vi-VN")} -{" "}
                                                {new Date(courseEndDate).toLocaleDateString("vi-VN")})
                                            </>
                                        )}
                                    </Form.Text>
                                </Col>

                                <Col md={12} className="mb-3">
                                    <Form.Check
                                        type="switch"
                                        id="assignment-visible"
                                        label="Hiển thị bài tập cho học sinh"
                                        checked={formData.isVisible}
                                        onChange={(e) => handleInputChange("isVisible", e.target.checked)}
                                    />
                                    <Form.Text className="text-muted">
                                        Bạn có thể tạo bài tập ở chế độ ẩn và hiển thị sau khi hoàn thiện
                                    </Form.Text>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Quiz Questions */}
                    {formData.type === "quiz" && (
                        <Card>
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Câu hỏi trắc nghiệm</h5>
                                <Button variant="success" size="sm" onClick={addQuestion}>
                                    <Plus size={16} className="me-1" />
                                    Thêm câu hỏi
                                </Button>
                            </Card.Header>
                            <Card.Body>
                                {errors.questions && (
                                    <Alert variant="danger" className="mb-3">
                                        {errors.questions}
                                    </Alert>
                                )}

                                {formData.questions.length === 0 ? (
                                    <div className="text-center py-4">
                                        <CheckCircle size={48} className="text-muted mb-3" />
                                        <h6 className="text-muted">Chưa có câu hỏi nào</h6>
                                        <p className="text-muted small">Thêm câu hỏi đầu tiên cho bài tập trắc nghiệm</p>
                                        <Button variant="success" onClick={addQuestion}>
                                            <Plus size={16} className="me-2" />
                                            Thêm câu hỏi đầu tiên
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="d-grid gap-4">
                                        {formData.questions.map((question, questionIndex) => (
                                            <Card key={question.questionId} className="border">
                                                <Card.Header className="d-flex justify-content-between align-items-center">
                                                    <h6 className="mb-0">Câu hỏi {questionIndex + 1}</h6>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => removeQuestion(questionIndex)}
                                                        disabled={formData.questions.length === 1}
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </Card.Header>
                                                <Card.Body>
                                                    <Row>
                                                        <Col md={8} className="mb-3">
                                                            <Form.Label>
                                                                Nội dung câu hỏi <span className="text-danger">*</span>
                                                            </Form.Label>
                                                            <Form.Control
                                                                as="textarea"
                                                                rows={2}
                                                                placeholder="Nhập nội dung câu hỏi"
                                                                value={question.text}
                                                                onChange={(e) => updateQuestion(questionIndex, "text", e.target.value)}
                                                                isInvalid={!!errors[`question_${questionIndex}_text`]}
                                                            />
                                                            <Form.Control.Feedback type="invalid">
                                                                {errors[`question_${questionIndex}_text`]}
                                                            </Form.Control.Feedback>
                                                        </Col>
                                                        <Col md={4} className="mb-3">
                                                            <Form.Label>
                                                                Điểm số <span className="text-danger">*</span>
                                                            </Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                min="0.5"
                                                                max="10"
                                                                step="0.5"
                                                                value={question.points}
                                                                onChange={(e) =>
                                                                    updateQuestion(questionIndex, "points", Number.parseFloat(e.target.value) || 1)
                                                                }
                                                                isInvalid={!!errors[`question_${questionIndex}_points`]}
                                                            />
                                                            <Form.Control.Feedback type="invalid">
                                                                {errors[`question_${questionIndex}_points`]}
                                                            </Form.Control.Feedback>
                                                        </Col>
                                                    </Row>

                                                    <div className="mb-3">
                                                        <Form.Label>
                                                            Các lựa chọn <span className="text-danger">*</span>
                                                        </Form.Label>
                                                        {errors[`question_${questionIndex}_options`] && (
                                                            <div className="text-danger small mb-2">
                                                                {errors[`question_${questionIndex}_options`]}
                                                            </div>
                                                        )}
                                                        <div className="d-grid gap-2">
                                                            {question.options.map((option) => (
                                                                <div key={option.key} className="d-flex align-items-center gap-2">
                                                                    <Form.Check
                                                                        type="radio"
                                                                        name={`correct-${questionIndex}`}
                                                                        checked={question.correctOption === option.key}
                                                                        onChange={() => updateQuestion(questionIndex, "correctOption", option.key)}
                                                                        title="Đáp án đúng"
                                                                    />
                                                                    <Badge bg="secondary" className="px-2">
                                                                        {option.key}
                                                                    </Badge>
                                                                    <Form.Control
                                                                        type="text"
                                                                        placeholder={`Nhập lựa chọn ${option.key}`}
                                                                        value={option.text}
                                                                        onChange={(e) => updateQuestionOption(questionIndex, option.key, e.target.value)}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <Form.Text className="text-muted">
                                                            Chọn radio button bên trái để đánh dấu đáp án đúng
                                                        </Form.Text>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    )}

                    {Object.keys(errors).length > 0 && (
                        <Alert variant="danger" className="mt-3">
                            <strong>Vui lòng kiểm tra lại:</strong>
                            <ul className="mb-0 mt-2">
                                {Object.values(errors).map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </Alert>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <div className="d-flex justify-content-between w-100 align-items-center">
                        <div className="text-muted small">
                            {formData.type === "quiz" ? (
                                <>
                                    Trắc nghiệm • {formData.questions.length} câu hỏi • Tổng điểm:{" "}
                                    {formData.questions.reduce((total, q) => total + q.points, 0)}
                                </>
                            ) : (
                                "Bài tập tự luận"
                            )}
                        </div>
                        <div className="d-flex gap-2">
                            <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                                Hủy
                            </Button>
                            <Button type="submit" variant="primary" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} className="me-1" />
                                        {isEditing ? "Cập nhật bài tập" : "Tạo bài tập"}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}

export default AssignmentModal
