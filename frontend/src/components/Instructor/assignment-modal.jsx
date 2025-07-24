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
            newErrors.title = "Assignment title is required"
        }

        // Chỉ bắt buộc mô tả nếu là quiz
        if (formData.type === "quiz" && !formData.description.trim()) {
            newErrors.description = "Assignment description is required for quiz type"
        }

        if (!formData.dueDate) {
            newErrors.dueDate = "Due date is required"
        }

        // Validate due date is within course period
        if (formData.dueDate && courseStartDate && courseEndDate) {
            const dueDate = new Date(formData.dueDate)
            const startDate = new Date(courseStartDate)
            const endDate = new Date(courseEndDate)

            if (dueDate < startDate) {
                newErrors.dueDate = "Due date cannot be before the course start date"
            } else if (dueDate > endDate) {
                newErrors.dueDate = "Due date cannot be after the course end date"
            }
        }

        // Validate quiz questions
        if (formData.type === "quiz") {
            if (formData.questions.length === 0) {
                newErrors.questions = "Quiz must have at least 1 question"
            } else {
                formData.questions.forEach((question, index) => {
                    if (!question.text.trim()) {
                        newErrors[`question_${index}_text`] = "Question cannot be empty"
                    }

                    const hasEmptyOptions = question.options.some((opt) => !opt.text.trim())
                    if (hasEmptyOptions) {
                        newErrors[`question_${index}_options`] = "All options must be filled"
                    }

                    if (question.points <= 0) {
                        newErrors[`question_${index}_points`] = "Points must be greater than 0"
                    }
                })
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // ✅ FIX: Prevent event bubbling và đổi tên function
    const handleAssignmentSubmit = async (e) => {
        e.preventDefault()
        e.stopPropagation() // ✅ Ngăn event bubble lên form cha

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

    // ✅ FIX: Tách riêng hàm xử lý button click (không dùng form submit)
    const handleSaveButtonClick = async () => {
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
        setErrors({}) // Clear errors khi đóng modal
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
                    {isEditing ? "Edit Assignment" : "Add New Assignment"}
                </Modal.Title>
            </Modal.Header>

            {/* ✅ FIX: Loại bỏ form wrapper hoặc prevent submit */}
            <div onSubmit={handleAssignmentSubmit}>
                <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                    {/* Basic Information */}
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">Basic Information</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={12} className="mb-3">
                                    <Form.Label>
                                        Assignment Title <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter assignment title"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange("title", e.target.value)}
                                        isInvalid={!!errors.title}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                                </Col>

                                <Col md={12} className="mb-3">
                                    <Form.Label>
                                        Assignment Description <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Enter detailed assignment description"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange("description", e.target.value)}
                                        isInvalid={!!errors.description}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                                </Col>

                                <Col md={6} className="mb-3">
                                    <Form.Label>
                                        Assignment Type <span className="text-danger">*</span>
                                    </Form.Label>
                                    <div className="d-flex gap-3">
                                        <Form.Check
                                            type="radio"
                                            id="type-essay"
                                            name="assignmentType"
                                            label="Essay"
                                            checked={formData.type === "essay"}
                                            onChange={() => handleTypeChange("essay")}
                                        />
                                        <Form.Check
                                            type="radio"
                                            id="type-quiz"
                                            name="assignmentType"
                                            label="Quiz"
                                            checked={formData.type === "quiz"}
                                            onChange={() => handleTypeChange("quiz")}
                                        />
                                    </div>
                                </Col>

                                <Col md={6} className="mb-3">
                                    <Form.Label>
                                        Due Date <span className="text-danger">*</span>
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
                                                Due date must be within the course period (
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
                                        label="Show assignment to students"
                                        checked={formData.isVisible}
                                        onChange={(e) => handleInputChange("isVisible", e.target.checked)}
                                    />
                                    <Form.Text className="text-muted">
                                        You can create the assignment as hidden and show it after completion.
                                    </Form.Text>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Quiz Questions */}
                    {formData.type === "quiz" && (
                        <Card>
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Quiz Questions</h5>
                                <Button variant="success" size="sm" onClick={addQuestion}>
                                    <Plus size={16} className="me-1" />
                                    Add Question
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
                                        <h6 className="text-muted">No questions yet</h6>
                                        <p className="text-muted small">Add the first question for the quiz</p>
                                        <Button variant="success" onClick={addQuestion}>
                                            <Plus size={16} className="me-2" />
                                            Add the first question
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="d-grid gap-4">
                                        {formData.questions.map((question, questionIndex) => (
                                            <Card key={question.questionId} className="border">
                                                <Card.Header className="d-flex justify-content-between align-items-center">
                                                    <h6 className="mb-0">Question {questionIndex + 1}</h6>
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
                                                                Question Content <span className="text-danger">*</span>
                                                            </Form.Label>
                                                            <Form.Control
                                                                as="textarea"
                                                                rows={2}
                                                                placeholder="Enter question content"
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
                                                                Points <span className="text-danger">*</span>
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
                                                            Options <span className="text-danger">*</span>
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
                                                                        title="Correct Answer"
                                                                    />
                                                                    <Badge bg="secondary" className="px-2">
                                                                        {option.key}
                                                                    </Badge>
                                                                    <Form.Control
                                                                        type="text"
                                                                        placeholder={`Enter option ${option.key}`}
                                                                        value={option.text}
                                                                        onChange={(e) => updateQuestionOption(questionIndex, option.key, e.target.value)}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <Form.Text className="text-muted">
                                                            Select the radio button on the left to mark the correct answer
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
                            <strong>Please check again:</strong>
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
                                    Quiz • {formData.questions.length} questions • Total Points:{" "}
                                    {formData.questions.reduce((total, q) => total + q.points, 0)}
                                </>
                            ) : (
                                "Essay Assignment"
                            )}
                        </div>
                        <div className="d-flex gap-2 w-100 justify-content-start">
                            <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            {/* ✅ FIX: Dùng onClick thay vì type="submit" */}
                            <Button 
                                variant="primary" 
                                disabled={isSubmitting}
                                onClick={handleSaveButtonClick}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} className="me-1" />
                                        {isEditing ? "Update Assignment" : "Create Assignment"}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </Modal.Footer>
            </div>
        </Modal>
    )
}

export default AssignmentModal