"use client"

import { useState } from "react"
import { Card, Button, Badge, Row, Col } from "react-bootstrap"
import { Plus, Trash2, FileText, CheckCircle, Clock, Eye, EyeOff, Edit } from "lucide-react"
import AssignmentModal from "./assignment-modal"

const AssignmentManager = ({ assignments, onChange, errors, courseStartDate, courseEndDate, courseTerm }) => {
    const [showAssignmentModal, setShowAssignmentModal] = useState(false)
    const [editingAssignment, setEditingAssignment] = useState(null)
    const [editingIndex, setEditingIndex] = useState(-1)

    const handleAddAssignment = () => {
        setEditingAssignment(null)
        setEditingIndex(-1)
        setShowAssignmentModal(true)
    }

    const handleEditAssignment = (assignment, index) => {
        setEditingAssignment(assignment)
        setEditingIndex(index)
        setShowAssignmentModal(true)
    }

    const handleSaveAssignment = (assignmentData) => {
        const newAssignments = [...assignments]

        if (editingIndex >= 0) {
            // Edit existing assignment
            newAssignments[editingIndex] = {
                ...assignmentData,
                // ✅ Giữ lại các field cũ nếu đang edit
                _id: assignments[editingIndex]._id,
                createdAt: assignments[editingIndex].createdAt,
                updatedAt: new Date().toISOString(),
                submissions: assignments[editingIndex].submissions || 0,
                totalStudents: assignments[editingIndex].totalStudents || 0,
            }
        } else {
            // ✅ FIXED: Không tạo ID ở đây nữa, để API tạo
            newAssignments.push({
                ...assignmentData,
                // Không tạo _id ở đây nữa - ID sẽ được tạo bởi database
                createdAt: new Date().toISOString(),
                submissions: 0,
                totalStudents: 0,
            })
        }

        onChange(newAssignments)
        setShowAssignmentModal(false)
    }

    const handleDeleteAssignment = (index) => {
        const newAssignments = assignments.filter((_, i) => i !== index)
        onChange(newAssignments)
    }

    const toggleAssignmentVisibility = (index) => {
        const newAssignments = [...assignments]
        newAssignments[index] = {
            ...newAssignments[index],
            isVisible: !newAssignments[index].isVisible,
        }
        onChange(newAssignments)
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

    const isOverdue = (dueDate) => {
        return new Date(dueDate) < new Date()
    }

    const getDaysUntilDue = (dueDate) => {
        const now = new Date()
        const due = new Date(dueDate)
        const diffTime = due - now
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const getAssignmentStatusBadge = (assignment) => {
        if (!assignment.isVisible) {
            return <Badge bg="secondary">Ẩn</Badge>
        }

        if (isOverdue(assignment.dueDate)) {
            return <Badge bg="danger">Quá hạn</Badge>
        }

        const daysLeft = getDaysUntilDue(assignment.dueDate)
        if (daysLeft <= 3) {
            return <Badge bg="warning">Sắp hết hạn</Badge>
        }

        return <Badge bg="success">Đang mở</Badge>
    }

    return (
        <div>
            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 d-flex align-items-center">
                        <FileText size={20} className="me-2" />
                        Assignment Management
                    </h5>
                    <Button variant="success" size="sm" onClick={handleAddAssignment}>
                        <Plus size={16} className="me-1" />
                        Add Assignment
                    </Button>
                </Card.Header>
                <Card.Body>
                    {assignments.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="p-4 rounded-circle d-inline-flex mb-3" style={{ background: "#f8f9fa" }}>
                                <FileText size={32} className="text-muted" />
                            </div>
                            <h6 className="text-muted mb-2">No assignments yet</h6>
                            <p className="text-muted mb-3">Create the first assignment so students can practice</p>
                            <Button variant="success" onClick={handleAddAssignment}>
                                <Plus size={16} className="me-2" />
                                Create First Assignment
                            </Button>
                        </div>
                    ) : (
                        <div className="d-grid gap-3">
                            {assignments.map((assignment, index) => (
                                <Card key={assignment._id || `temp_${index}`} className="border">
                                    <Card.Body>
                                        <Row className="align-items-center">
                                            <Col md={8}>
                                                <div className="d-flex align-items-start">
                                                    <div
                                                        className="p-2 rounded me-3 flex-shrink-0"
                                                        style={{
                                                            background: assignment.type === "quiz" ? "#e0f2fe" : "#f3e8ff",
                                                        }}
                                                    >
                                                        {assignment.type === "quiz" ? (
                                                            <CheckCircle size={20} style={{ color: "#0891b2" }} />
                                                        ) : (
                                                            <FileText size={20} style={{ color: "#7c3aed" }} />
                                                        )}
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex align-items-center gap-2 mb-1">
                                                            <h6 className="fw-semibold mb-0">{assignment.title}</h6>
                                                            {getAssignmentStatusBadge(assignment)}
                                                            <Badge bg={assignment.type === "quiz" ? "info" : "primary"} className="small">
                                                                {assignment.type === "quiz" ? "Trắc nghiệm" : "Tự luận"}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-muted small mb-2 lh-sm">{assignment.description}</p>
                                                        <div className="d-flex align-items-center gap-3 small text-muted">
                                                            <div className="d-flex align-items-center">
                                                                <Clock size={14} className="me-1" />
                                                                <span>
                                                                    Due Date: {formatDateTime(assignment.dueDate)}
                                                                    {!isOverdue(assignment.dueDate) && (
                                                                        <span className="ms-1">({getDaysUntilDue(assignment.dueDate)} days)</span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                            {assignment.type === "quiz" && assignment.questions && (
                                                                <div className="d-flex align-items-center">
                                                                    <FileText size={14} className="me-1" />
                                                                    <span>{assignment.questions.length} questions</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* Show validation errors */}
                                                        {errors[`assignment_${index}_title`] && (
                                                            <div className="text-danger small mt-1">{errors[`assignment_${index}_title`]}</div>
                                                        )}
                                                        {errors[`assignment_${index}_dueDate`] && (
                                                            <div className="text-danger small mt-1">{errors[`assignment_${index}_dueDate`]}</div>
                                                        )}
                                                        {errors[`assignment_${index}_questions`] && (
                                                            <div className="text-danger small mt-1">{errors[`assignment_${index}_questions`]}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md={4}>
                                                <div className="text-end">
                                                    <div className="d-flex gap-1 justify-content-end">
                                                        <Button
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            hidden ="true"
                                                            onClick={() => toggleAssignmentVisibility(index)}
                                                            title={assignment.isVisible ? "Hide assignment" : "Show assignment"}
                                                        >
                                                            {assignment.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                                                        </Button>
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => handleEditAssignment(assignment, index)}
                                                            title="Edit"
                                                        >
                                                            <Edit size={14} />
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleDeleteAssignment(index)}
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            ))}
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Assignment Modal */}
            <AssignmentModal
                show={showAssignmentModal}
                onHide={() => setShowAssignmentModal(false)}
                onSubmit={handleSaveAssignment}
                assignmentData={editingAssignment}
                courseStartDate={courseStartDate}
                courseEndDate={courseEndDate}
                courseTerm={courseTerm}
                isEditing={editingIndex >= 0}
            />
        </div>
    )
}

export default AssignmentManager