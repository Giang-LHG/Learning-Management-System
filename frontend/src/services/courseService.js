import api from "../utils/api"

const courseService = {
    // Lấy danh sách khóa học theo instructor
    getCoursesByInstructor: async (instructorId) => {
        const response = await api.get(`/instructor/courses/instructor/${instructorId}`)
        return response.data
    },

    // Lấy chi tiết khóa học
    getCourseDetail: async (courseId) => {
        const response = await api.get(`/instructor/courses/${courseId}`)
        return response.data
    },

    // Lấy danh sách modules của khóa học
    getCourseModules: async (courseId) => {
        const response = await api.get(`/instructor/courses/${courseId}/modules`)
        return response.data
    },

    // Lấy nội dung bài học
    getLessonContent: async (courseId, moduleId, lessonId) => {
        const response = await api.get(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`)
        return response.data
    },

    // Tạo khóa học mới
    createCourse: async (courseData) => {
        const response = await api.post("/instructor/courses", courseData)
        return response.data
    },

    // Cập nhật khóa học
    updateCourse: async (courseId, courseData) => {
        const response = await api.put(`/instructor/courses/${courseId}`, courseData)
        return response.data
    },

    // Xóa khóa học
    deleteCourse: async (courseId) => {
        const response = await api.delete(`/instructor/courses/${courseId}`)
        return response.data
    },

    // Lấy danh sách học viên
    getCourseParticipants: async (courseId) => {
        const response = await api.get(`/instructor/courses/${courseId}/participants`)
        return response.data
    },

    // Toggle visibility của material
    toggleMaterialVisibility: async (courseId, materialType, materialId, isVisible) => {
        const response = await api.put(`/instructor/courses/${courseId}/materials/toggle-visibility`, {
            materialType,
            materialId,
            isVisible,
        })
        return response.data
    },

    // Tạo kỳ học mới
    createNewTerm: async (courseId, termData) => {
        const response = await api.put(`/instructor/courses/${courseId}/new-term`, termData)
        return response.data
    },
}

export default courseService
