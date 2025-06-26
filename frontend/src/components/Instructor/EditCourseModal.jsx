"use client"

import { useState, useEffect } from "react"
import { Modal, Form, Button, Row, Col, Alert, Card, Accordion, Badge } from "react-bootstrap"
import { Edit, Save, Plus, Trash2, BookOpen, Eye, EyeOff } from "lucide-react"

const EditCourseModal = ({ show, onHide, onSubmit, courseData, isLoading = false }) => {
    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        credits: 0,
        term: [],
        modules: [],
    })

    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Initialize form when modal opens or courseData changes
    useEffect(() => {
        if (show && courseData) {
            setEditForm({
                title: courseData.title || "",
                description: courseData.description || "",
                startDate: courseData.startDate || "",
                endDate: courseData.endDate || "",
                credits: courseData.credits || 0,
                term: Array.isArray(courseData.term) ? [...courseData.term] : [],
                modules: courseData.modules ? [...courseData.modules] : [],
            })
            setErrors({})
        }
    }, [show, courseData])

    const formatDateForInput = (dateString) => {
        if (!dateString) return ""
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) {
                return ""
            }
            return date.toISOString().split("T")[0]
        } catch (error) {
            console.error("Error formatting date for input:", error)
            return ""
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!editForm.title.trim()) {
            newErrors.title = "Tên khóa học là bắt buộc"
        }

        if (!editForm.startDate) {
            newErrors.startDate = "Ngày bắt đầu là bắt buộc"
        }

        if (!editForm.endDate) {
            newErrors.endDate = "Ngày kết thúc là bắt buộc"
        }

        if (editForm.startDate && editForm.endDate && new Date(editForm.startDate) >= new Date(editForm.endDate)) {
            newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu"
        }

        if (editForm.credits <= 0) {
            newErrors.credits = "Số tín chỉ phải lớn hơn 0"
        }

        // Validate modules
        editForm.modules.forEach((module, moduleIndex) => {
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
            await onSubmit(editForm)
            handleClose()
        } catch (error) {
            console.error("Error updating course:", error)
            setErrors({ general: error.message || "Có lỗi xảy ra khi cập nhật khóa học" })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        setEditForm({
            title: "",
            description: "",
            startDate: "",
            endDate: "",
            credits: 0,
            term: [],
            modules: [],
        })
        setErrors({})
        onHide()
    }

    // Module management functions
    const addModule = () => {
        const newModule = {
            moduleId: Date.now().toString(),
            title: "Chương mới",
            isVisible: true,
            lessons: [],
        }
        setEditForm({
            ...editForm,
            modules: [...editForm.modules, newModule],
        })
    }

    const updateModule = (moduleIndex, field, value) => {
        const updatedModules = [...editForm.modules]
        updatedModules[moduleIndex] = {
            ...updatedModules[moduleIndex],
            [field]: value,
        }
        setEditForm({
            ...editForm,
            modules: updatedModules,
        })
    }

    const removeModule = (moduleIndex) => {
        const updatedModules = editForm.modules.filter((_, index) => index !== moduleIndex)
        setEditForm({
            ...editForm,
            modules: updatedModules,
        })
    }

    const addLesson = (moduleIndex) => {
        const newLesson = {
            lessonId: Date.now().toString(),
            title: "Bài học mới",
            content: "",
            isVisible: true,
        }
        const updatedModules = [...editForm.modules]
        updatedModules[moduleIndex].lessons.push(newLesson)
        setEditForm({
            ...editForm,
            modules: updatedModules,
        })
    }

    const updateLesson = (moduleIndex, lessonIndex, field, value) => {
        const updatedModules = [...editForm.modules]
        updatedModules[moduleIndex].lessons[lessonIndex] = {
            ...updatedModules[moduleIndex].lessons[lessonIndex],
            [field]: value,
        }
        setEditForm({
            ...editForm,
            modules: updatedModules,
        })
    }

    const removeLesson = (moduleIndex, lessonIndex) => {
        const updatedModules = [...editForm.modules]
        updatedModules[moduleIndex].lessons = updatedModules[moduleIndex].lessons.filter(
            (_, index) => index !== lessonIndex,
        )
        setEditForm({
            ...editForm,
            modules: updatedModules,
        })
    }

    if (!courseData) {
        return null
    }

    return (
        <Modal show={show} onHide={handleClose} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title className="d-flex align-items-center">
                    <Edit size={20} className="me-2" />
                    Chỉnh sửa khóa học - {courseData.title}
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
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">Thông tin cơ bản</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={12} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>
                                            Tên khóa học <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={editForm.title}
                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                            placeholder="Nhập tên khóa học"
                                            isInvalid={!!errors.title}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={12} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>Mô tả khóa học</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={4}
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            placeholder="Nhập mô tả khóa học"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>
                                            Số tín chỉ <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={editForm.credits}
                                            onChange={(e) => setEditForm({ ...editForm, credits: Number.parseInt(e.target.value) || 0 })}
                                            isInvalid={!!errors.credits}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.credits}</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={4} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>
                                            Ngày bắt đầu <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={formatDateForInput(editForm.startDate)}
                                            onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                                            isInvalid={!!errors.startDate}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.startDate}</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={4} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>
                                            Ngày kết thúc <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={formatDateForInput(editForm.endDate)}
                                            onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                                            isInvalid={!!errors.endDate}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.endDate}</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Modules Management */}
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Quản lý chương học</h5>
                            <Button variant="success" size="sm" onClick={addModule}>
                                <Plus size={16} className="me-1" />
                                Thêm chương
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            {editForm.modules.length === 0 ? (
                                <div className="text-center py-4">
                                    <BookOpen size={48} className="text-muted mb-3" />
                                    <h6 className="text-muted">Chưa có chương học nào</h6>
                                    <p className="text-muted small">Nhấn "Thêm chương" để bắt đầu tạo nội dung khóa học</p>
                                </div>
                            ) : (
                                <Accordion>
                                    {editForm.modules.map((module, moduleIndex) => (
                                        <Accordion.Item key={module.moduleId} eventKey={moduleIndex.toString()}>
                                            <Accordion.Header>
                                                <div className="d-flex align-items-center justify-content-between w-100 me-3">
                                                    <span>
                                                        Chương {moduleIndex + 1}: {module.title}
                                                    </span>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <Badge bg={module.isVisible ? "success" : "secondary"}>
                                                            {module.isVisible ? "Hiển thị" : "Ẩn"}
                                                        </Badge>
                                                        <Badge bg="info">{module.lessons.length} bài học</Badge>
                                                    </div>
                                                </div>
                                            </Accordion.Header>
                                            <Accordion.Body>
                                                <Row className="mb-3">
                                                    <Col md={8}>
                                                        <Form.Group>
                                                            <Form.Label>
                                                                Tên chương <span className="text-danger">*</span>
                                                            </Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                value={module.title}
                                                                onChange={(e) => updateModule(moduleIndex, "title", e.target.value)}
                                                                placeholder="Nhập tên chương"
                                                                isInvalid={!!errors[`module_${moduleIndex}_title`]}
                                                            />
                                                            <Form.Control.Feedback type="invalid">
                                                                {errors[`module_${moduleIndex}_title`]}
                                                            </Form.Control.Feedback>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={2}>
                                                        <Form.Group>
                                                            <Form.Label>Hiển thị</Form.Label>
                                                            <Form.Check
                                                                type="switch"
                                                                checked={module.isVisible}
                                                                onChange={(e) => updateModule(moduleIndex, "isVisible", e.target.checked)}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={2} className="d-flex align-items-end">
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => removeModule(moduleIndex)}
                                                            className="w-100"
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </Col>
                                                </Row>

                                                <hr />

                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <h6 className="mb-0">Bài học</h6>
                                                    <Button variant="outline-primary" size="sm" onClick={() => addLesson(moduleIndex)}>
                                                        <Plus size={14} className="me-1" />
                                                        Thêm bài học
                                                    </Button>
                                                </div>

                                                {module.lessons.length === 0 ? (
                                                    <div className="text-center py-3" style={{ background: "#f8f9fa" }}>
                                                        <p className="text-muted small mb-0">Chưa có bài học nào trong chương này</p>
                                                    </div>
                                                ) : (
                                                    <div className="d-grid gap-3">
                                                        {module.lessons.map((lesson, lessonIndex) => (
                                                            <div key={lesson.lessonId} className="p-3 border rounded">
                                                                <Row>
                                                                    <Col md={6}>
                                                                        <Form.Group className="mb-2">
                                                                            <Form.Label className="small">
                                                                                Tên bài học <span className="text-danger">*</span>
                                                                            </Form.Label>
                                                                            <Form.Control
                                                                                type="text"
                                                                                size="sm"
                                                                                value={lesson.title}
                                                                                onChange={(e) =>
                                                                                    updateLesson(moduleIndex, lessonIndex, "title", e.target.value)
                                                                                }
                                                                                placeholder="Nhập tên bài học"
                                                                                isInvalid={!!errors[`lesson_${moduleIndex}_${lessonIndex}_title`]}
                                                                            />
                                                                            <Form.Control.Feedback type="invalid">
                                                                                {errors[`lesson_${moduleIndex}_${lessonIndex}_title`]}
                                                                            </Form.Control.Feedback>
                                                                        </Form.Group>
                                                                    </Col>
                                                                    <Col md={4}>
                                                                        <Form.Group className="mb-2">
                                                                            <Form.Label className="small">Hiển thị</Form.Label>
                                                                            <div className="d-flex align-items-center">
                                                                                <Form.Check
                                                                                    type="switch"
                                                                                    checked={lesson.isVisible}
                                                                                    onChange={(e) =>
                                                                                        updateLesson(moduleIndex, lessonIndex, "isVisible", e.target.checked)
                                                                                    }
                                                                                />
                                                                                {lesson.isVisible ? (
                                                                                    <Eye size={16} className="ms-2 text-success" />
                                                                                ) : (
                                                                                    <EyeOff size={16} className="ms-2 text-muted" />
                                                                                )}
                                                                            </div>
                                                                        </Form.Group>
                                                                    </Col>
                                                                    <Col md={2} className="d-flex align-items-start">
                                                                        <Button
                                                                            variant="outline-danger"
                                                                            size="sm"
                                                                            onClick={() => removeLesson(moduleIndex, lessonIndex)}
                                                                            className="w-100"
                                                                        >
                                                                            <Trash2 size={12} />
                                                                        </Button>
                                                                    </Col>
                                                                    <Col md={12}>
                                                                        <Form.Group>
                                                                            <Form.Label className="small">Nội dung bài học</Form.Label>
                                                                            <Form.Control
                                                                                as="textarea"
                                                                                rows={2}
                                                                                size="sm"
                                                                                value={lesson.content}
                                                                                onChange={(e) =>
                                                                                    updateLesson(moduleIndex, lessonIndex, "content", e.target.value)
                                                                                }
                                                                                placeholder="Nhập nội dung bài học"
                                                                            />
                                                                        </Form.Group>
                                                                    </Col>
                                                                </Row>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    ))}
                                </Accordion>
                            )}
                        </Card.Body>
                    </Card>

                    {Object.keys(errors).length > 0 && (
                        <Alert variant="danger" className="mt-3">
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
                    <div className="d-flex justify-content-between w-100 align-items-center">
                        <div className="text-muted small">
                            {editForm.modules.length} chương •{" "}
                            {editForm.modules.reduce((total, module) => total + module.lessons.length, 0)} bài học
                        </div>
                        <div className="d-flex gap-2">
                            <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                style={{ background: "#fbbf24", border: "none", color: "#000" }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="spinner-border spinner-border-sm me-2" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} className="me-2" />
                                        Lưu thay đổi
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

export default EditCourseModal
