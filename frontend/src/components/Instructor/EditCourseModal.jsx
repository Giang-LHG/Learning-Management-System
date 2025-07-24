"use client"

import { useState, useEffect } from "react"
import { Modal, Form, Button, Card, Row, Col, Badge, Accordion, Nav, Tab } from "react-bootstrap"
import { Save, Plus, Trash2, Eye, EyeOff, BookOpen, Edit, FileText, CheckCircle } from "lucide-react"
import AssignmentManager from "./assignment-manager"

const EditCourseModal = ({ show, onHide, onSubmit, courseData }) => {
    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        credits: 0,
        term: [],
        modules: [],
        assignments: [], // Thêm assignments
    })

    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [activeTab, setActiveTab] = useState("basic") // Tab navigation

    useEffect(() => {
        if (courseData && show) {
            setEditForm({
                title: courseData.title || "",
                description: courseData.description || "",
                startDate: courseData.startDate || "",
                endDate: courseData.endDate || "",
                credits: courseData.credits || 0,
                term: courseData.term || [],
                modules: courseData.modules ? [...courseData.modules] : [],
                assignments: courseData.assignments ? [...courseData.assignments] : [],
            })
            setErrors({})
            setActiveTab("basic")
        }
    }, [courseData, show])

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

        // Validate assignments
        editForm.assignments.forEach((assignment, assignmentIndex) => {
            if (!assignment.title.trim()) {
                newErrors[`assignment_${assignmentIndex}_title`] = "Tên bài tập là bắt buộc"
            }
            if (!assignment.dueDate) {
                newErrors[`assignment_${assignmentIndex}_dueDate`] = "Hạn nộp là bắt buộc"
            }
            if (assignment.type === "quiz" && (!assignment.questions || assignment.questions.length === 0)) {
                newErrors[`assignment_${assignmentIndex}_questions`] = "Bài tập trắc nghiệm phải có ít nhất 1 câu hỏi"
            }
        })

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSave = async () => {
        if (!validateForm()) {
            return
        }

        setIsLoading(true)
        try {
            await onSubmit(editForm)
            onHide()
        } catch (error) {
            console.error("Error saving course:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const addModule = () => {
        const newModule = {
            moduleId: Date.now().toString(),
            title: "New module",
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
            title: "New lesson",
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

    // Assignment handlers
    const handleAssignmentsChange = (assignments) => {
        setEditForm((prev) => ({
            ...prev,
            assignments: assignments,
        }))
    }

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title className="d-flex align-items-center">
                    <Edit size={20} className="me-2" />
                    Edit course - {courseData?.title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {/* Tab Navigation */}
                <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
                    <Nav.Item>
                        <Nav.Link eventKey="basic" className="d-flex align-items-center">
                            <FileText size={16} className="me-2" />
                            Basic information
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="content" className="d-flex align-items-center">
                            <BookOpen size={16} className="me-2" />
                            Detail information of course
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="assignments" className="d-flex align-items-center">
                            <CheckCircle size={16} className="me-2" />
                         Assigment ({editForm.assignments.length})
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                <Form>
                    <Tab.Content>
                        {/* Basic Information Tab */}
                        <Tab.Pane active={activeTab === "basic"}>
                            <Card className="mb-4">
                                <Card.Header>
                                    <h5 className="mb-0">Basic information</h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col md={12} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Course Name *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={editForm.title}
                                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                                    placeholder="Enter course name"
                                                    isInvalid={!!errors.title}
                                                />
                                                <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={12} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Course Description</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={4}
                                                    value={editForm.description}
                                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                    placeholder="Enter course description"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Credits *</Form.Label>
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
                                                <Form.Label>Starts Date*</Form.Label>
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
                                                <Form.Label>End Date *</Form.Label>
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
                        </Tab.Pane>

                        {/* Content Tab */}
                        <Tab.Pane active={activeTab === "content"}>
                            <Card>
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">Manage Module</h5>
                                    <Button variant="success" size="sm" onClick={addModule}>
                                        <Plus size={16} className="me-1" />
                                      Add module
                                    </Button>
                                </Card.Header>
                                <Card.Body>
                                    {editForm.modules.length === 0 ? (
                                        <div className="text-center py-4">
                                            <BookOpen size={48} className="text-muted mb-3" />
                                            <h6 className="text-muted">No module</h6>
                                            <p className="text-muted small">CLick "Add module" to create module of course</p>
                                        </div>
                                    ) : (
                                        <Accordion>
                                            {editForm.modules.map((module, moduleIndex) => (
                                                <Accordion.Item key={module.moduleId} eventKey={moduleIndex.toString()}>
                                                    <Accordion.Header>
                                                        <div className="d-flex align-items-center justify-content-between w-100 me-3">
                                                            <span>
                                                                Module {moduleIndex + 1}: {module.title}
                                                            </span>
                                                            <div className="d-flex align-items-center gap-2">
                                                                <Badge bg={module.isVisible ? "success" : "secondary"}>
                                                                    {module.isVisible ? "Hiển thị" : "Ẩn"}
                                                                </Badge>
                                                                <Badge bg="info">{module.lessons.length} lesson</Badge>
                                                            </div>
                                                        </div>
                                                    </Accordion.Header>
                                                    <Accordion.Body>
                                                        <Row className="mb-3">
                                                            <Col md={8}>
                                                                <Form.Group>
                                                                    <Form.Label>Name of module *</Form.Label>
                                                                    <Form.Control
                                                                        type="text"
                                                                        value={module.title}
                                                                        onChange={(e) => updateModule(moduleIndex, "title", e.target.value)}
                                                                        placeholder="Enter name module"
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={2}>
                                                                <Form.Group>
                                                                    <Form.Label>Show</Form.Label>
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
                                                            <h6 className="mb-0">Lessons</h6>
                                                            <Button variant="outline-primary" size="sm" onClick={() => addLesson(moduleIndex)}>
                                                                <Plus size={14} className="me-1" />
                                                                Add lesson
                                                            </Button>
                                                        </div>

                                                        {module.lessons.length === 0 ? (
                                                            <div className="text-center py-3" style={{ background: "#f8f9fa" }}>
                                                                <p className="text-muted small mb-0">No lessons</p>
                                                            </div>
                                                        ) : (
                                                            <div className="d-grid gap-3">
                                                                {module.lessons.map((lesson, lessonIndex) => (
                                                                    <div key={lesson.lessonId} className="p-3 border rounded">
                                                                        <Row>
                                                                            <Col md={6}>
                                                                                <Form.Group className="mb-2">
                                                                                    <Form.Label className="small">Name of lesson *</Form.Label>
                                                                                    <Form.Control
                                                                                        type="text"
                                                                                        size="sm"
                                                                                        value={lesson.title}
                                                                                        onChange={(e) =>
                                                                                            updateLesson(moduleIndex, lessonIndex, "title", e.target.value)
                                                                                        }
                                                                                        placeholder="Nhập tên bài học"
                                                                                    />
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={4}>
                                                                                <Form.Group className="mb-2">
                                                                                    <Form.Label className="small">Show</Form.Label>
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
                                                                                    <Form.Label className="small">Lesson Detail</Form.Label>
                                                                                    <Form.Control
                                                                                        as="textarea"
                                                                                        rows={2}
                                                                                        size="sm"
                                                                                        value={lesson.content}
                                                                                        onChange={(e) =>
                                                                                            updateLesson(moduleIndex, lessonIndex, "content", e.target.value)
                                                                                        }
                                                                                        placeholder="Enter Lesson"
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
                        </Tab.Pane>

                        {/* Assignments Tab */}
                        <Tab.Pane active={activeTab === "assignments"}>
                            <AssignmentManager
                                assignments={editForm.assignments}
                                onChange={handleAssignmentsChange}
                                errors={errors}
                                courseStartDate={editForm.startDate}
                                courseEndDate={editForm.endDate}
                                courseTerm={editForm.term}
                            />
                        </Tab.Pane>
                    </Tab.Content>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <div className="d-flex justify-content-between w-100 align-items-center">
                    <div className="text-muted small">
                        {editForm.modules.length} lesson •{" "}
                        {editForm.modules.reduce((total, module) => total + module.lessons.length, 0)} bài học •{" "}
                        {editForm.assignments.length} lesson
                    </div>
                    <div className="d-flex gap-2">
                        <Button variant="secondary" onClick={onHide} disabled={isLoading}>
                            Delete
                        </Button>
                        <Button
                            style={{ background: "#fbbf24", border: "none", color: "#000" }}
                            onClick={handleSave}
                            disabled={isLoading}
                        >
                            <Save size={16} className="me-2" />
                            {isLoading ? "Saving..." : "Saved"}
                        </Button>
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    )
}

export default EditCourseModal
