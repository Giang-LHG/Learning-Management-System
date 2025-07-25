"use client"

import { useState, useEffect } from "react"
import { Modal, Form, Button, Row, Col, Card, Badge, Alert, Table } from "react-bootstrap"
import { Save, Plus, Trash2, FileText, CheckCircle, Clock, Eye, User, Calendar, Info } from "lucide-react"
import api from '../../utils/api';
import { Star } from "lucide-react";

const AssignmentModal = ({
    show,
    onHide,
    onSubmit,
    assignmentData,
    courseStartDate,
    courseEndDate,
    courseTerm,
    isEditing,
    courseId,
    mode = "add", // "add", "edit", "view"
}) => {
    const isViewMode = mode === "view";
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
    const token = localStorage.getItem("token");

    // Thêm state cho tính năng xem/chấm điểm
    const [studentsSubmitted, setStudentsSubmitted] = useState([])
    const [studentsNotSubmitted, setStudentsNotSubmitted] = useState([])
    const [submissions, setSubmissions] = useState([])
    const [showGradeModal, setShowGradeModal] = useState(false)
    const [gradingStudent, setGradingStudent] = useState(null)
    const [gradeValue, setGradeValue] = useState('')
    const [gradeLoading, setGradeLoading] = useState(false)
    const [gradeError, setGradeError] = useState('')

    useEffect(() => {
        if (show) {
            if (assignmentData && (isEditing || mode === "view")) {
                // Edit or view mode
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
    }, [show, assignmentData, isEditing, courseTerm, mode])

    useEffect(() => {
        if (show && isViewMode && assignmentData && assignmentData._id) {
            // Gọi API lấy danh sách đã nộp/chưa nộp
            api.get(`/instructor/submissions/assignment/${assignmentData._id}/submission-status`)
                .then(res => {
                    setStudentsSubmitted(res.data.data.submitted || [])
                    setStudentsNotSubmitted(res.data.data.notSubmitted || [])
                })
                .catch(() => {
                    setStudentsSubmitted([])
                    setStudentsNotSubmitted([])
                })
            // Gọi API lấy submissions
            api.get(`/instructor/submissions/assignment/${assignmentData._id}`)
                .then(res => {
                    setSubmissions(res.data.data || [])
                })
                .catch(() => setSubmissions([]))
        }
    }, [show, isViewMode, assignmentData])

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

    // API call to create new assignment
    const createAssignmentAPI = async (assignmentData) => {
        try {
            const response = await fetch(`/api/instructor/assignments/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...assignmentData,
                    courseId: courseId
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to create assignment')
            }

            return await response.json()
        } catch (error) {
            console.error('Error creating assignment:', error)
            throw error
        }
    }

    // API call to update assignment due date (new term)
    const updateAssignmentDueDateAPI = async (assignmentId, dueDate) => {
        try {
            const response = await fetch(`/api/instructor/assignments/${assignmentId}/new-term`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ dueDate }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to update assignment due date')
            }

            return await response.json()
        } catch (error) {
            console.error('Error updating assignment due date:', error)
            throw error
        }
    }

    // Handle save button click with API integration
    const handleSaveButtonClick = async () => {
        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        try {
            if (courseId) {
                // If courseId is provided, use API endpoints
                if (isEditing && assignmentData._id) {
                    // Update existing assignment - only update due date
                    const result = await updateAssignmentDueDateAPI(
                        assignmentData._id, 
                        new Date(formData.dueDate).toISOString()
                    )
                    
                    // Update the assignment data with the response
                    const updatedAssignment = {
                        ...assignmentData,
                        dueDate: result.data.dueDate,
                        term: result.data.term,
                        updatedAt: new Date().toISOString()
                    }
                    
                    onSubmit(updatedAssignment)
                } else {
                    // Create new assignment
                    const assignmentData = {
                        ...formData,
                        dueDate: new Date(formData.dueDate).toISOString(),
                        questions: formData.type === "quiz" ? formData.questions.filter((q) => q.text.trim()) : undefined,
                    }

                    const result = await createAssignmentAPI(assignmentData)
                    onSubmit(result.data)
                }
            } else {
                // If no courseId, use the original local handling
                const assignmentData = {
                    ...formData,
                    dueDate: new Date(formData.dueDate).toISOString(),
                    questions: formData.type === "quiz" ? formData.questions.filter((q) => q.text.trim()) : undefined,
                }

                onSubmit(assignmentData)
            }

            handleClose()
        } catch (error) {
            console.error("Error saving assignment:", error)
            // You can add error state handling here
            setErrors({
                general: error.message || 'An error occurred while saving the assignment'
            })
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

    // Determine if this is a due date update mode
    const isDueDateUpdateMode = courseId && isEditing && assignmentData._id && mode === "edit"

    const getModalTitle = () => {
        if (isViewMode) {
            return "Assignment Details"
        }
        if (isDueDateUpdateMode) {
            return "Update Assignment Due Date When Course Term Changes"
        }
        return isEditing ? "Edit Assignment" : "Add New Assignment"
    }

    const getTotalQuizPoints = () => {
        if (formData.type === "quiz" && formData.questions.length > 0) {
            return formData.questions.reduce((total, q) => total + q.points, 0)
        }
        return 0
    }

    const renderAssignmentDetails = () => {
        if (!isViewMode || !assignmentData) return null

        return (
            <Card className="mb-4">
                <Card.Header>
                    <h5 className="mb-0">Assignment Overview</h5>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <div className="mb-3">
                                <label className="fw-semibold text-muted small">Assignment Title</label>
                                <div className="d-flex align-items-center mt-1">
                                    {assignmentData.type === "quiz" ? (
                                        <CheckCircle size={18} className="text-info me-2" />
                                    ) : (
                                        <FileText size={18} className="text-primary me-2" />
                                    )}
                                    <span className="fw-semibold">{assignmentData.title}</span>
                                </div>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="mb-3">
                                <label className="fw-semibold text-muted small">Assignment Type</label>
                                <div className="mt-1">
                                    <Badge bg={assignmentData.type === "quiz" ? "info" : "primary"}>
                                        {assignmentData.type === "quiz" ? "Trắc nghiệm" : "Tự luận"}
                                    </Badge>
                                </div>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="mb-3">
                                <label className="fw-semibold text-muted small">Due Date</label>
                                <div className="d-flex align-items-center mt-1">
                                    <Clock size={16} className="text-warning me-2" />
                                    <span>{formatDateTime(assignmentData.dueDate)}</span>
                                </div>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="mb-3">
                                <label className="fw-semibold text-muted small">Visibility</label>
                                <div className="mt-1">
                                    <Badge bg={assignmentData.isVisible ? "success" : "secondary"}>
                                        {assignmentData.isVisible ? "Visible to Students" : "Hidden"}
                                    </Badge>
                                </div>
                            </div>
                        </Col>
                        <Col md={12}>
                            <div className="mb-3">
                                <label className="fw-semibold text-muted small">Description</label>
                                <div className="mt-1 p-3 bg-light rounded">
                                    {assignmentData.description || "No description provided"}
                                </div>
                            </div>
                        </Col>
                        {assignmentData.type === "quiz" && (
                            <>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <label className="fw-semibold text-muted small">Total Questions</label>
                                        <div className="d-flex align-items-center mt-1">
                                            <FileText size={16} className="text-info me-2" />
                                            <span className="fw-semibold">{formData.questions.length} questions</span>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <label className="fw-semibold text-muted small">Total Points</label>
                                        <div className="d-flex align-items-center mt-1">
                                            <CheckCircle size={16} className="text-success me-2" />
                                            <span className="fw-semibold">{getTotalQuizPoints()} points</span>
                                        </div>
                                    </div>
                                </Col>
                            </>
                        )}
                        {assignmentData.createdAt && (
                            <Col md={6}>
                                <div className="mb-3">
                                    <label className="fw-semibold text-muted small">Created At</label>
                                    <div className="d-flex align-items-center mt-1">
                                        <Calendar size={16} className="text-muted me-2" />
                                        <span>{formatDateTime(assignmentData.createdAt)}</span>
                                    </div>
                                </div>
                            </Col>
                        )}
                        {assignmentData.updatedAt && (
                            <Col md={6}>
                                <div className="mb-3">
                                    <label className="fw-semibold text-muted small">Last Updated</label>
                                    <div className="d-flex align-items-center mt-1">
                                        <Calendar size={16} className="text-muted me-2" />
                                        <span>{formatDateTime(assignmentData.updatedAt)}</span>
                                    </div>
                                </div>
                            </Col>
                        )}
                    </Row>
                </Card.Body>
            </Card>
        )
    }

    const renderQuizQuestionsDetails = () => {
        if (!isViewMode || formData.type !== "quiz" || formData.questions.length === 0) return null

        return (
            <Card>
                <Card.Header>
                    <h5 className="mb-0">Quiz Questions ({formData.questions.length})</h5>
                </Card.Header>
                <Card.Body>
                    <div className="d-grid gap-4">
                        {formData.questions.map((question, index) => (
                            <Card key={index} className="border">
                                <Card.Header className="bg-light">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0">Question {index + 1}</h6>
                                        <Badge bg="primary">{question.points} point{question.points > 1 ? 's' : ''}</Badge>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <div className="mb-3">
                                        <p className="fw-semibold mb-2">{question.text}</p>
                                    </div>
                                    <div>
                                        <label className="fw-semibold text-muted small mb-2">Options:</label>
                                        <div className="d-grid gap-2">
                                            {question.options.map((option) => (
                                                <div 
                                                    key={option.key} 
                                                    className={`d-flex align-items-center p-2 rounded ${
                                                        question.correctOption === option.key 
                                                            ? 'bg-success bg-opacity-10 border border-success' 
                                                            : 'bg-light'
                                                    }`}
                                                >
                                                    <Badge 
                                                        bg={question.correctOption === option.key ? "success" : "secondary"} 
                                                        className="me-2"
                                                    >
                                                        {option.key}
                                                    </Badge>
                                                    <span>{option.text}</span>
                                                    {question.correctOption === option.key && (
                                                        <CheckCircle size={16} className="text-success ms-auto" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                </Card.Body>
            </Card>
        )
    }

    // Thêm UI hiển thị danh sách đã nộp/chưa nộp ở chế độ view
    const renderSubmissionStatus = () => {
        if (!isViewMode || !assignmentData) return null
        return (
            <Row>
                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h6 className="mb-0">Học sinh đã nộp bài</h6>
                        </Card.Header>
                        <Card.Body style={{ maxHeight: "300px", overflowY: "auto" }}>
                            {submissions.length === 0 ? (
                                <div className="text-center text-muted py-3">
                                    <User size={32} className="mb-2" />
                                    <p className="mb-0">Chưa có bài nộp nào</p>
                                </div>
                            ) : (
                                <Table hover size="sm">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Học sinh</th>
                                            <th>Thời gian nộp</th>
                                            <th>Điểm</th>
                                            <th>Hành động</th>
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
                                                            className="rounded-circle me-2"
                                                            style={{ width: "28px", height: "28px", objectFit: "cover" }}
                                                        />
                                                        <span>{submission.studentId?.profile?.fullName}</span>
                                                    </div>
                                                </td>
                                                <td>{formatDateTime(submission.submittedAt)}</td>
                                                <td>
                                                    {submission.grade?.score !== null && submission.grade?.score !== undefined ? (
                                                        <span className="fw-bold text-success"><Star size={14} className="text-warning me-1" />{submission.grade.score}/10</span>
                                                    ) : (
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <Button size="sm" variant="outline-primary">
                                                        <Eye size={14} className="me-1" />
                                                        {submission.grade?.score !== null && submission.grade?.score !== undefined ? "Xem chi tiết" : "Chấm điểm"}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h6 className="mb-0">Học sinh chưa nộp bài</h6>
                        </Card.Header>
                        <Card.Body style={{ maxHeight: "300px", overflowY: "auto" }}>
                            {studentsNotSubmitted.length === 0 ? (
                                <div className="text-center text-muted py-3">
                                    <User size={32} className="mb-2" />
                                    <p className="mb-0">Tất cả học sinh đã nộp bài</p>
                                </div>
                            ) : (
                                <div className="d-grid gap-2">
                                    {studentsNotSubmitted.map((student) => (
                                        <div key={student._id} className="d-flex align-items-center justify-content-between p-2 border rounded">
                                            <div className="d-flex align-items-center">
                                                <img
                                                    src={
                                                        student.profile?.avatarUrl ||
                                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(student.profile?.fullName || '')}&background=6366f1&color=fff`
                                                    }
                                                    alt={student.profile?.fullName}
                                                    className="rounded-circle me-2"
                                                    style={{ width: "28px", height: "28px", objectFit: "cover" }}
                                                />
                                                <span>{student.profile?.fullName}</span>
                                            </div>
                                            {assignmentData.type === 'essay' && (
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
        )
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
            await api.post(`/instructor/submissions/assignment/${assignmentData._id}/grade-student`, {
                studentId: gradingStudent._id,
                score: Number(gradeValue),
                content: ''
            })
            setShowGradeModal(false)
            // Refresh lại danh sách
            const [statusRes, subRes] = await Promise.all([
                api.get(`/instructor/submissions/assignment/${assignmentData._id}/submission-status`),
                api.get(`/instructor/submissions/assignment/${assignmentData._id}`)
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

    return (
        <Modal show={show} onHide={handleClose} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {formData.type === "quiz" ? (
                        <CheckCircle size={24} className="me-2" />
                    ) : (
                        <FileText size={24} className="me-2" />
                    )}
                    {getModalTitle()}
                </Modal.Title>
            </Modal.Header>

            <div>
                <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                    {/* Show general error if exists */}
                    {errors.general && (
                        <Alert variant="danger" className="mb-3">
                            {errors.general}
                        </Alert>
                    )}

                    {/* View Mode - Show  */}
                    {isViewMode && renderAssignmentDetails()}

                    {/* View Mode - Show Quiz Questions Details */}
                    {isViewMode && renderQuizQuestionsDetails()}

                    {/* Thêm bảng xem/chấm điểm ở view mode */}
                    {isViewMode && renderSubmissionStatus()}

                    {/* Edit/Add Mode - Basic Information */}
                    {!isViewMode && (
                        <Card className="mb-4">
                            <Card.Header>
                                <h5 className="mb-0">
                                    {isDueDateUpdateMode ? "Update Due Date" : "Basic Information"}
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    {/* Show all fields for non-due-date-update mode */}
                                    {!isDueDateUpdateMode && (
                                        <>
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
                                        </>
                                    )}

                                    {/* Due Date field - always shown in edit/add mode */}
                                    <Col md={isDueDateUpdateMode ? 12 : 6} className="mb-3">
                                        <Form.Label>
                                            {isDueDateUpdateMode ? "New Due Date" : "Due Date"} 
                                            <span className="text-danger">*</span>
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

                                    {/* Visibility toggle - only for non-due-date-update mode */}
                                    {!isDueDateUpdateMode && (
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
                                    )}
                                </Row>
                            </Card.Body>
                        </Card>
                    )}

                    {/* Quiz Questions - only show for non-due-date-update mode and quiz type and not view mode */}
                    {!isDueDateUpdateMode && !isViewMode && formData.type === "quiz" && (
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

                                {formData.questions.length === 0 && !courseId ? (
                                    <div className="text-center py-4">
                                        <CheckCircle size={48} className="text-muted mb-3" />
                                        <h6 className="text-muted">No questions in add form yet</h6>
                                        <p className="text-muted small">Add the first question for the assigment</p>
                                        <Button variant="success" onClick={addQuestion}>
                                            <Plus size={16} className="me-2" />
                                            Add  question
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="d-grid gap-4">
                                        {formData.questions.map((question, questionIndex) => (
                                            <Card key={questionIndex} className="border">
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

                    {Object.keys(errors).length > 0 && !errors.general && !isViewMode && (
                        <Alert variant="danger" className="mt-3">
                            <strong>Please check again:</strong>
                            <ul className="mb-0 mt-2">
                                {Object.entries(errors)
                                    .filter(([key]) => key !== 'general')
                                    .map(([key, error]) => (
                                        <li key={key}>{error}</li>
                                    ))
                                }
                            </ul>
                        </Alert>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <div className="d-flex justify-content-between w-100 align-items-center">
                        <div className="text-muted small">
                            {isViewMode ? (
                                `Viewing: ${assignmentData?.title || 'Assignment'}`
                            ) : isDueDateUpdateMode ? (
                                `Update due date for: ${assignmentData?.title || 'Assignment'}`
                            ) : formData.type === "quiz" ? (
                                <>
                                    Quiz • {formData.questions.length} questions • Total Points:{" "}
                                    {formData.questions.reduce((total, q) => total + q.points, 0)}
                                </>
                            ) : (
                                "Essay Assignment"
                            )}
                        </div>
                        <div className="d-flex gap-2">
                            <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                                {isViewMode ? "Close" : "Cancel"}
                            </Button>
                            {!isViewMode && (
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
                                            {isDueDateUpdateMode 
                                                ? "Update Due Date" 
                                                : isEditing 
                                                    ? "Update Assignment" 
                                                    : "Create Assignment"
                                            }
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </Modal.Footer>
            </div>
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
                        <Form.Control
                            type="number"
                            min={0}
                            max={10}
                            step={0.1}
                            value={gradeValue}
                            onChange={e => setGradeValue(e.target.value)}
                            disabled={gradeLoading}
                        />
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
        </Modal>
    )
}

export default AssignmentModal