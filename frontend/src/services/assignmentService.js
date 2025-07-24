import api from "../utils/api"

 const assignmentService = {
    // Lấy tất cả assignments của một khóa học
    getAssignmentsByCourse: async (courseId) => {
        const response = await api.get(`/instructor/assignments/course/${courseId}`)
        return response.data
    },

    // Lấy assignments cho calendar
    getAssignmentsForCalendar: async (courseId) => {
        const response = await api.get(`/instructor/assignments/course/${courseId}/calendar`)
        return response.data
    },

    // Tạo assignment mới
    createAssignment: async (assignmentData) => {
        const response = await api.post("/instructor/assignments", assignmentData)
        return response.data
    },

    // Cập nhật assignment
    updateAssignment: async (assignmentId, assignmentData) => {
        const response = await api.put(`/instructor/assignments/${assignmentId}`, assignmentData)
        return response.data
    },

    // Xóa assignment
    deleteAssignment: async (assignmentId) => {
        const response = await api.delete(`/instructor/assignments/${assignmentId}`)
        return response.data
    },

    // Toggle visibility của assignment
    toggleAssignmentVisibility: async (assignmentId, isVisible) => {
        const response = await api.put(`/instructor/assignments/${assignmentId}/toggle-visibility`, {
            isVisible,
        })
        return response.data
    },

    // Tạo term mới cho assignment
    createNewTerm: async (assignmentId, termData) => {
        const response = await api.put(`/instructor/assignments/${assignmentId}/new-term`, termData)
        return response.data
    },

    // Lấy chi tiết assignment
    getAssignmentDetail: async (assignmentId) => {
        const response = await api.get(`/instructor/assignments/${assignmentId}`)
        return response.data
    },

    // Lấy submissions của assignment
    getAssignmentSubmissions: async (assignmentId) => {
        const response = await api.get(`/instructor/assignments/${assignmentId}/submissions`)
        return response.data
    },
}

export default assignmentService
