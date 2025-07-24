// AddCourseModal.js - Fixed version

import { useState, useEffect } from "react"
import { Modal, Form, Button, Row, Col, Alert, Nav, Tab } from "react-bootstrap"
import { Calendar, BookOpen, FileText, Plus, Trash2, CheckCircle } from "lucide-react"
import AssignmentManager from "./assignment-manager"
import api from '../../utils/api'
import { useSelector } from 'react-redux';
import courseService from "../../services/courseService"
import assignmentService from "../../services/assignmentService"

const AddCourseModal = ({ show, onHide, onSubmit }) => {
    // Lấy user hiện tại từ redux hoặc localStorage
    const user = useSelector(state => state.auth.user) || JSON.parse(localStorage.getItem('user') || '{}');

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        subjectId: "",
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
        assignments: [],
    });

    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [activeTab, setActiveTab] = useState("basic")
    const [subjects, setSubjects] = useState([])
    const [instructors, setInstructors] = useState([])
    const [loadingSubjects, setLoadingSubjects] = useState(false)
    const [loadingInstructors, setLoadingInstructors] = useState(false)

    useEffect(() => {
        if (show) {
            setLoadingSubjects(true)
            setLoadingInstructors(true)
            api.get('/subjects')
                .then(res => setSubjects(res.data.subjects || []))
                .finally(() => setLoadingSubjects(false))
            api.get('/instructor/list')
                .then(res => setInstructors(res.data.instructors || []))
                .finally(() => setLoadingInstructors(false))
        }
    }, [show])

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: "",
            }));
        }
    };

    const handleTermChange = (index, value) => {
        const newTerms = [...formData.term];
        newTerms[index] = value;
        setFormData((prev) => ({
            ...prev,
            term: newTerms,
        }));
    };

    const addTerm = () => {
        setFormData((prev) => ({
            ...prev,
            term: [...prev.term, ""],
        }));
    };

    const removeTerm = (index) => {
        if (formData.term.length > 1) {
            const newTerms = formData.term.filter((_, i) => i !== index);
            setFormData((prev) => ({
                ...prev,
                term: newTerms,
            }));
        }
    };

    const handleModuleChange = (moduleIndex, field, value) => {
        const newModules = [...formData.modules];
        newModules[moduleIndex] = {
            ...newModules[moduleIndex],
            [field]: value,
        };
        setFormData((prev) => ({
            ...prev,
            modules: newModules,
        }));
    };

    const handleLessonChange = (moduleIndex, lessonIndex, field, value) => {
        const newModules = [...formData.modules];
        newModules[moduleIndex].lessons[lessonIndex] = {
            ...newModules[moduleIndex].lessons[lessonIndex],
            [field]: value,
        };
        setFormData((prev) => ({
            ...prev,
            modules: newModules,
        }));
    };

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
        }));
    };

    const removeModule = (moduleIndex) => {
        if (formData.modules.length > 1) {
            const newModules = formData.modules.filter((_, i) => i !== moduleIndex);
            setFormData((prev) => ({
                ...prev,
                modules: newModules,
            }));
        }
    };

    const addLesson = (moduleIndex) => {
        const newModules = [...formData.modules];
        newModules[moduleIndex].lessons.push({
            title: "",
            content: "",
            isVisible: true,
        });
        setFormData((prev) => ({
            ...prev,
            modules: newModules,
        }));
    };

    const removeLesson = (moduleIndex, lessonIndex) => {
        const newModules = [...formData.modules];
        if (newModules[moduleIndex].lessons.length > 1) {
            newModules[moduleIndex].lessons = newModules[moduleIndex].lessons.filter((_, i) => i !== lessonIndex);
            setFormData((prev) => ({
                ...prev,
                modules: newModules,
            }));
        }
    };

    const handleAssignmentsChange = (assignments) => {
        setFormData((prev) => ({
            ...prev,
            assignments: assignments,
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = "Course title is required";
        }

        if (!formData.subjectId) {
            newErrors.subjectId = "Please select a subject";
        }

        if (!formData.startDate) {
            newErrors.startDate = "Start date is required";
        }

        if (!formData.endDate) {
            newErrors.endDate = "End date is required";
        }

        if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
            newErrors.endDate = "End date must be after start date";
        }

        if (formData.credits <= 0) {
            newErrors.credits = "Credits must be greater than 0";
        }

        if (formData.term.some((term) => !term.trim())) {
            newErrors.term = "All terms must be filled";
        }

        formData.modules.forEach((module, moduleIndex) => {
            if (!module.title.trim()) {
                newErrors[`module_${moduleIndex}_title`] = "Module title is required";
            }

            module.lessons.forEach((lesson, lessonIndex) => {
                if (!lesson.title.trim()) {
                    newErrors[`lesson_${moduleIndex}_${lessonIndex}_title`] = "Lesson title is required";
                }
            });
        });

        formData.assignments.forEach((assignment, assignmentIndex) => {
            if (!assignment.title.trim()) {
                newErrors[`assignment_${assignmentIndex}_title`] = "Assignment title is required";
            }
            if (!assignment.dueDate) {
                newErrors[`assignment_${assignmentIndex}_dueDate`] = "Due date is required";
            }
            if (assignment.type === "quiz" && (!assignment.questions || assignment.questions.length === 0)) {
                newErrors[`assignment_${assignmentIndex}_questions`] = "Quiz must have at least 1 question";
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const user = localStorage.getItem("user");
            if (!user) {
                setErrors({ api: "Could not find user information. Please log in again." });
                setIsSubmitting(false);
                return;
            }
            const parsedUser = JSON.parse(user);
            const instructorId = parsedUser._id;

           
            const courseData = {
                title: formData.title,
                description: formData.description,
                subjectId: formData.subjectId,
                startDate: formData.startDate,
                endDate: formData.endDate,
                credits: formData.credits,
                instructorId: instructorId,
                term: formData.term.filter((term) => term.trim()),
                modules: formData.modules
                    .filter((module) => module.title.trim())
                    .map((module) => ({
                        ...module,
                        lessons: module.lessons.filter((lesson) => lesson.title.trim()),
                    })),
    
            };

            console.log('Creating course with data:', courseData);

            // B1: Tạo course trước (không có assignments)
            const response = await courseService.createCourse(courseData);
            
            if (!response.success) {
                setErrors({ api: response.message || "Could not create course." });
                setIsSubmitting(false);
                return;
            }

            const courseId = response.data._id;
        
            console.log('Course created with ID:', courseId);

            // B2: Tạo assignments riêng biệt nếu có
            if (formData.assignments.length > 0) {
                console.log('Creating assignments:', formData.assignments);
                
                for (const assignment of formData.assignments) {
                    const assignmentPayload = {
                        courseId,
                        title: assignment.title,
                        description: assignment.description || "",
                        type: assignment.type,
                        dueDate: assignment.dueDate,
                        isVisible: assignment.isVisible,
                        term: assignment.term || formData.term,
                    };

                    // Nếu là quiz thì gửi thêm câu hỏi
                    if (assignment.type === "quiz" && assignment.questions) {
                        assignmentPayload.questions = assignment.questions;
                    }

                    console.log('Creating assignment:', assignmentPayload);
                    await assignmentService.createAssignment(assignmentPayload);
                }
            }

            // Thành công
            onSubmit(response.data);
            handleClose();

        } catch (error) {
            console.error("Error creating course:", error);
            setErrors({ api: "An error occurred while creating the course. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            title: "",
            description: "",
            subjectId: "",
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
            assignments: [],
        });
        setErrors({});
        setActiveTab("basic");
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <BookOpen size={24} className="me-2" />
                    Add New Course
                </Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                    <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
                        <Nav.Item>
                            <Nav.Link eventKey="basic" className="d-flex align-items-center">
                                <FileText size={16} className="me-2" />
                                Basic Information
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="content" className="d-flex align-items-center">
                                <BookOpen size={16} className="me-2" />
                                Course Content
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="assignments" className="d-flex align-items-center">
                                <CheckCircle size={16} className="me-2" />
                                Assignments ({formData.assignments.length})
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>

                    <Tab.Content>
                        <Tab.Pane active={activeTab === "basic"}>
                            <div className="mb-4">
                                <h5 className="fw-bold text-primary mb-3">
                                    <FileText size={20} className="me-2" />
                                    Basic Information
                                </h5>

                                <Row>
                                    <Col md={12} className="mb-3">
                                        <Form.Label>
                                            Course Title <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter course title"
                                            value={formData.title}
                                            onChange={(e) => handleInputChange("title", e.target.value)}
                                            isInvalid={!!errors.title}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                                    </Col>

                                    <Col md={12} className="mb-3">
                                        <Form.Label>Course Description</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            placeholder="Enter detailed course description"
                                            value={formData.description}
                                            onChange={(e) => handleInputChange("description", e.target.value)}
                                        />
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Label>
                                            Subject <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Select
                                            value={formData.subjectId}
                                            onChange={(e) => handleInputChange("subjectId", e.target.value)}
                                            isInvalid={!!errors.subjectId}
                                            disabled={loadingSubjects}
                                        >
                                            <option value="">{loadingSubjects ? "Loading..." : "Select subject"}</option>
                                            {subjects.map((subject) => (
                                                <option key={subject._id} value={subject._id}>
                                                    {subject.code} - {subject.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">{errors.subjectId}</Form.Control.Feedback>
                                    </Col>

                                    <Col md={4} className="mb-3">
                                        <Form.Label>
                                            Start Date <span className="text-danger">*</span>
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
                                            End Date <span className="text-danger">*</span>
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
                                            Credits <span className="text-danger">*</span>
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

                            <div className="mb-4">
                                <h5 className="fw-bold text-primary mb-3">
                                    <Calendar size={20} className="me-2" />
                                    Term
                                </h5>
                                {formData.term.map((term, index) => (
                                    <Row key={index} className="mb-2">
                                        <Col md={10}>
                                            <Form.Control
                                                type="text"
                                                placeholder={`Term ${index + 1} (e.g., Term 1 - 2023-2024)`}
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
                                    Add Term
                                </Button>
                                {errors.term && <div className="text-danger small mt-1">{errors.term}</div>}
                            </div>
                        </Tab.Pane>

                        <Tab.Pane active={activeTab === "content"}>
                            <div className="mb-4">
                                <h5 className="fw-bold text-primary mb-3">
                                    <BookOpen size={20} className="me-2" />
                                    Module
                                </h5>
                                {formData.modules.map((module, moduleIndex) => (
                                    <div key={moduleIndex} className="border rounded p-3 mb-3" style={{ backgroundColor: "#f8f9fa" }}>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="fw-bold mb-0">Module {moduleIndex + 1}</h6>
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
                                                    Module Title <span className="text-danger">*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Enter module title"
                                                    value={module.title}
                                                    onChange={(e) => handleModuleChange(moduleIndex, "title", e.target.value)}
                                                    isInvalid={!!errors[`module_${moduleIndex}_title`]}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors[`module_${moduleIndex}_title`]}
                                                </Form.Control.Feedback>
                                            </Col>
                                            <Col md={2}>
                                                <Form.Label>Visible</Form.Label>
                                                <Form.Check
                                                    type="switch"
                                                    checked={module.isVisible}
                                                    onChange={(e) => handleModuleChange(moduleIndex, "isVisible", e.target.checked)}
                                                />
                                            </Col>
                                        </Row>

                                        <div className="ms-3">
                                            <h6 className="fw-semibold mb-2">Lesson</h6>
                                            {module.lessons.map((lesson, lessonIndex) => (
                                                <div
                                                    key={lessonIndex}
                                                    className="border rounded p-2 mb-2"
                                                    style={{ backgroundColor: "#ffffff" }}
                                                >
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <small className="fw-semibold">Lesson {lessonIndex + 1}</small>
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
                                                                placeholder="Enter lesson title"
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
                                                                label="Visible"
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
                                                                placeholder="Lesson content (optional)"
                                                                value={lesson.content}
                                                                onChange={(e) =>
                                                                    handleLessonChange(moduleIndex, lessonIndex, "content", e.target.value)
                                                                }
                                                            />
                                                        </Col>
                                                    </Row>
                                                </div>
                                            ))}
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                onClick={() => addLesson(moduleIndex)}
                                                className="mt-2"
                                            >
                                                <Plus size={14} className="me-1" />
                                                Add Lesson
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline-primary" onClick={addModule}>
                                    <Plus size={16} className="me-1" />
                                    Add Module
                                </Button>
                            </div>
                        </Tab.Pane>

                        <Tab.Pane active={activeTab === "assignments"}>
                            <AssignmentManager
                                assignments={formData.assignments}
                                onChange={handleAssignmentsChange}
                                errors={errors}
                                courseStartDate={formData.startDate}
                                courseEndDate={formData.endDate}
                                courseTerm={formData.term}
                            />
                        </Tab.Pane>
                    </Tab.Content>

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
                            {formData.modules.length} modules •{" "}
                            {formData.modules.reduce((total, module) => total + module.lessons.length, 0)} lessons •{" "}
                            {formData.assignments.length} assignments
                        </div>
                        <div className="d-flex gap-2">
                            <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={16} className="me-1" />
                                        Create Course
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AddCourseModal;