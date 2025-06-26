"use client"

import { useState, useEffect } from "react"
import { Modal, Form, Button, Row, Col, Alert, Spinner } from "react-bootstrap"
import { Calendar, BookOpen, FileText, Plus, Trash2 } from "lucide-react"
import { subjectAPI, userAPI, courseAPI } from "../../services/api"

const AddCourseModal = ({ show, onHide, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        subjectId: "",
        instructorId: "",
        startDate: "",
        endDate: "",
        credits: 0,
        term: [""],
        modules: [
            {
                title: "",
                isVisible: true,
                lessons: [
                    {
                        title: "",
                        content: "",
                        isVisible: true,
                    },
                ],
            },
        ],
    })

    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [subjects, setSubjects] = useState([])
    const [instructors, setInstructors] = useState([])

    // Load subjects và instructors khi modal mở
    useEffect(() => {
        if (show) {
            loadInitialData()
        }
    }, [show])

    const loadInitialData = async () => {
        setIsLoading(true)
        try {
            const [subjectsResponse, instructorsResponse] = await Promise.all([
                subjectAPI.getAllSubjects(),
                userAPI.getAllInstructors(),
            ])

            setSubjects(subjectsResponse.data || [])
            setInstructors(instructorsResponse.data || [])
        } catch (error) {
            console.error("Error loading initial data:", error)
            setErrors({ general: "Không thể tải dữ liệu. Vui lòng thử lại." })
        } finally {
            setIsLoading(false)
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

    const handleTermChange = (index, value) => {
        const newTerms = [...formData.term]
        newTerms[index] = value
        setFormData((prev) => ({
            ...prev,
            term: newTerms,
        }))
    }

    const addTerm = () => {
        setFormData((prev) => ({
            ...prev,
            term: [...prev.term, ""],
        }))
    }

    const removeTerm = (index) => {
        if (formData.term.length > 1) {
            const newTerms = formData.term.filter((_, i) => i !== index)
            setFormData((prev) => ({
                ...prev,
                term: newTerms,
            }))
        }
    }

    const handleModuleChange = (moduleIndex, field, value) => {
        const newModules = [...formData.modules]
        newModules[moduleIndex] = {
            ...newModules[moduleIndex],
            [field]: value,
        }
        setFormData((prev) => ({
            ...prev,
            modules: newModules,
        }))
    }

    const handleLessonChange = (moduleIndex, lessonIndex, field, value) => {
        const newModules = [...formData.modules]
        newModules[moduleIndex].lessons[lessonIndex] = {
            ...newModules[moduleIndex].lessons[lessonIndex],
            [field]: value,
        }
        setFormData((prev) => ({
            ...prev,
            modules: newModules,
        }))
    }

    const addModule = () => {
        setFormData((prev) => ({
            ...prev,
            modules: [
                ...prev.modules,
                {
                    title: "",
                    isVisible: true,
                    lessons: [
                        {
                            title: "",
                            content: "",
                            isVisible: true,
                        },
                    ],
                },
            ],
        }))
    }

    const removeModule = (moduleIndex) => {
        if (formData.modules.length > 1) {
            const newModules = formData.modules.filter((_, i) => i !== moduleIndex)
            setFormData((prev) => ({
                ...prev,
                modules: newModules,
            }))
        }
    }

    const addLesson = (moduleIndex) => {
        const newModules = [...formData.modules]
        newModules[moduleIndex].lessons.push({
            title: "",
            content: "",
            isVisible: true,
        })
        setFormData((prev) => ({
            ...prev,
            modules: newModules,
        }))
    }

    const removeLesson = (moduleIndex, lessonIndex) => {
        const newModules = [...formData.modules]
        if (newModules[moduleIndex].lessons.length > 1) {
            newModules[moduleIndex].lessons = newModules[moduleIndex].lessons.filter((_, i) => i !== lessonIndex)
            setFormData((prev) => ({
                ...prev,
                modules: newModules,
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.title.trim()) {
            newErrors.title = "Tên khóa học là bắt buộc"
        }

        if (!formData.subjectId) {
            newErrors.subjectId = "Vui lòng chọn môn học"
        }

        if (!formData.instructorId) {
            newErrors.instructorId = "Vui lòng chọn giảng viên"
        }

        if (!formData.startDate) {
            newErrors.startDate = "Ngày bắt đầu là bắt buộc"
        }

        if (!formData.endDate) {
            newErrors.endDate = "Ngày kết thúc là bắt buộc"
        }

        if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
            newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu"
        }

        if (formData.credits <= 0) {
            newErrors.credits = "Số tín chỉ phải lớn hơn 0"
        }

        if (formData.term.some((term) => !term.trim())) {
            newErrors.term = "Tất cả học kỳ phải được điền"
        }

        // Validate modules
        formData.modules.forEach((module, moduleIndex) => {
            if (!module.title.trim()) {
                newErrors[`module_${moduleIndex}_title`] = "Tên chương là bắt buộc"
            }

            module.lessons.forEach((lesson, lessonIndex) => {
                if (!lesson.title.trim()) {
                    newErrors[`lesson_${moduleIndex}_${lessonIndex}_title`] = "Tên bài học là bắt buộc"
                }
            })
        })

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
            // Process form data
            const courseData = {
                ...formData,
                term: formData.term.filter((term) => term.trim()),
                modules: formData.modules.map((module) => ({
                    ...module,
                    lessons: module.lessons.filter((lesson) => lesson.title.trim()),
                })),
            }

            // Call API to create course
            const response = await courseAPI.createCourse(courseData)

            if (response.success) {
                onSubmit(response.data)
                handleClose()
            } else {
                setErrors({ general: response.message || "Có lỗi xảy ra khi tạo khóa học" })
            }
        } catch (error) {
            console.error("Error creating course:", error)
            setErrors({ general: error.message || "Có lỗi xảy ra khi tạo khóa học" })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        setFormData({
            title: "",
            description: "",
            subjectId: "",
            instructorId: "",
            startDate: "",
            endDate: "",
            credits: 0,
            term: [""],
            modules: [
                {
                    title: "",
                    isVisible: true,
                    lessons: [
                        {
                            title: "",
                            content: "",
                            isVisible: true,
                        },
                    ],
                },
            ],
        })
        setErrors({})
        onHide()
    }

    if (isLoading) {
        return (
            <Modal show={show} onHide={handleClose} size="xl" centered>
                <Modal.Body className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Đang tải dữ liệu...</p>
                </Modal.Body>
            </Modal>
        )
    }

    return (
        <Modal show={show} onHide={handleClose} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <BookOpen size={24} className="me-2" />
                    Thêm Khóa Học Mới
                </Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                    {errors.general && (
                        <Alert variant="danger" className="mb-3">
                            {errors.general}
                        </Alert>
                    )}

                    {/* Basic Information */}
                    <div className="mb-4">
                        <h5 className="fw-bold text-primary mb-3">
                            <FileText size={20} className="me-2" />
                            Thông tin cơ bản
                        </h5>

                        <Row>
                            <Col md={12} className="mb-3">
                                <Form.Label>
                                    Tên khóa học <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Nhập tên khóa học"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange("title", e.target.value)}
                                    isInvalid={!!errors.title}
                                />
                                <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                            </Col>

                            <Col md={12} className="mb-3">
                                <Form.Label>Mô tả khóa học</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Nhập mô tả chi tiết về khóa học"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                />
                            </Col>

                            <Col md={6} className="mb-3">
                                <Form.Label>
                                    Môn học <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Select
                                    value={formData.subjectId}
                                    onChange={(e) => handleInputChange("subjectId", e.target.value)}
                                    isInvalid={!!errors.subjectId}
                                >
                                    <option value="">Chọn môn học</option>
                                    {subjects.map((subject) => (
                                        <option key={subject._id} value={subject._id}>
                                            {subject.code} - {subject.name}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{errors.subjectId}</Form.Control.Feedback>
                            </Col>

                            <Col md={6} className="mb-3">
                                <Form.Label>
                                    Giảng viên <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Select
                                    value={formData.instructorId}
                                    onChange={(e) => handleInputChange("instructorId", e.target.value)}
                                    isInvalid={!!errors.instructorId}
                                >
                                    <option value="">Chọn giảng viên</option>
                                    {instructors.map((instructor) => (
                                        <option key={instructor._id} value={instructor._id}>
                                            {instructor.profile?.fullName || instructor.username}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{errors.instructorId}</Form.Control.Feedback>
                            </Col>

                            <Col md={4} className="mb-3">
                                <Form.Label>
                                    Ngày bắt đầu <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                                    isInvalid={!!errors.startDate}
                                />
                                <Form.Control.Feedback type="invalid">{errors.startDate}</Form.Control.Feedback>
                            </Col>

                            <Col md={4} className="mb-3">
                                <Form.Label>
                                    Ngày kết thúc <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                                    isInvalid={!!errors.endDate}
                                />
                                <Form.Control.Feedback type="invalid">{errors.endDate}</Form.Control.Feedback>
                            </Col>

                            <Col md={4} className="mb-3">
                                <Form.Label>
                                    Số tín chỉ <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={formData.credits}
                                    onChange={(e) => handleInputChange("credits", Number.parseInt(e.target.value) || 0)}
                                    isInvalid={!!errors.credits}
                                />
                                <Form.Control.Feedback type="invalid">{errors.credits}</Form.Control.Feedback>
                            </Col>
                        </Row>
                    </div>

                    {/* Terms */}
                    <div className="mb-4">
                        <h5 className="fw-bold text-primary mb-3">
                            <Calendar size={20} className="me-2" />
                            Học kỳ
                        </h5>
                        {formData.term.map((term, index) => (
                            <Row key={index} className="mb-2">
                                <Col md={10}>
                                    <Form.Control
                                        type="text"
                                        placeholder={`Học kỳ ${index + 1} (VD: Học kỳ 1 - 2023-2024)`}
                                        value={term}
                                        onChange={(e) => handleTermChange(index, e.target.value)}
                                    />
                                </Col>
                                <Col md={2}>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => removeTerm(index)}
                                        disabled={formData.term.length === 1}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </Col>
                            </Row>
                        ))}
                        <Button variant="outline-primary" size="sm" onClick={addTerm}>
                            <Plus size={16} className="me-1" />
                            Thêm học kỳ
                        </Button>
                        {errors.term && <div className="text-danger small mt-1">{errors.term}</div>}
                    </div>

                    {/* Modules */}
                    <div className="mb-4">
                        <h5 className="fw-bold text-primary mb-3">
                            <BookOpen size={20} className="me-2" />
                            Chương học
                        </h5>
                        {formData.modules.map((module, moduleIndex) => (
                            <div key={moduleIndex} className="border rounded p-3 mb-3" style={{ backgroundColor: "#f8f9fa" }}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="fw-bold mb-0">Chương {moduleIndex + 1}</h6>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => removeModule(moduleIndex)}
                                        disabled={formData.modules.length === 1}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>

                                <Row className="mb-3">
                                    <Col md={10}>
                                        <Form.Label>
                                            Tên chương <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Nhập tên chương"
                                            value={module.title}
                                            onChange={(e) => handleModuleChange(moduleIndex, "title", e.target.value)}
                                            isInvalid={!!errors[`module_${moduleIndex}_title`]}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors[`module_${moduleIndex}_title`]}
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Label>Hiển thị</Form.Label>
                                        <Form.Check
                                            type="switch"
                                            checked={module.isVisible}
                                            onChange={(e) => handleModuleChange(moduleIndex, "isVisible", e.target.checked)}
                                        />
                                    </Col>
                                </Row>

                                {/* Lessons */}
                                <div className="ms-3">
                                    <h6 className="fw-semibold mb-2">Bài học</h6>
                                    {module.lessons.map((lesson, lessonIndex) => (
                                        <div key={lessonIndex} className="border rounded p-2 mb-2" style={{ backgroundColor: "#ffffff" }}>
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <small className="fw-semibold">Bài học {lessonIndex + 1}</small>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => removeLesson(moduleIndex, lessonIndex)}
                                                    disabled={module.lessons.length === 1}
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>

                                            <Row>
                                                <Col md={8} className="mb-2">
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Tên bài học"
                                                        value={lesson.title}
                                                        onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, "title", e.target.value)}
                                                        isInvalid={!!errors[`lesson_${moduleIndex}_${lessonIndex}_title`]}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors[`lesson_${moduleIndex}_${lessonIndex}_title`]}
                                                    </Form.Control.Feedback>
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Check
                                                        type="switch"
                                                        label="Hiển thị"
                                                        checked={lesson.isVisible}
                                                        onChange={(e) =>
                                                            handleLessonChange(moduleIndex, lessonIndex, "isVisible", e.target.checked)
                                                        }
                                                    />
                                                </Col>
                                                <Col md={12}>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={2}
                                                        placeholder="Nội dung bài học (tùy chọn)"
                                                        value={lesson.content}
                                                        onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, "content", e.target.value)}
                                                    />
                                                </Col>
                                            </Row>
                                        </div>
                                    ))}
                                    <Button variant="outline-secondary" size="sm" onClick={() => addLesson(moduleIndex)} className="mt-2">
                                        <Plus size={14} className="me-1" />
                                        Thêm bài học
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline-primary" onClick={addModule}>
                            <Plus size={16} className="me-1" />
                            Thêm chương
                        </Button>
                    </div>

                    {Object.keys(errors).length > 0 && (
                        <Alert variant="danger">
                            <strong>Vui lòng kiểm tra lại:</strong>
                            <ul className="mb-0 mt-2">
                                {Object.entries(errors)
                                    .filter(([key]) => key !== "general")
                                    .map(([key, error], index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                            </ul>
                        </Alert>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Đang tạo...
                            </>
                        ) : (
                            <>
                                <Plus size={16} className="me-1" />
                                Tạo khóa học
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}

export default AddCourseModal
