import axios from "axios"

// Cấu hình base URL cho API
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8021/api"

// Tạo axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

// Interceptor để thêm token vào header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

// Interceptor để xử lý response và error
api.interceptors.response.use(
    (response) => {
        return response.data
    },
    (error) => {
        console.error("API Error:", error)

        if (error.response?.status === 401) {
            // Token expired hoặc không hợp lệ
            localStorage.removeItem("token")
            window.location.href = "/login"
        }

        return Promise.reject(error.response?.data || error.message)
    },
)

// Course API functions
export const courseAPI = {
    // Lấy tất cả khóa học của instructor
    getAllCourses: async (instructorId) => {
        try {
            const response = await api.get(`/courses?instructorId=${instructorId}`)
            return response
        } catch (error) {
            throw error
        }
    },

    // Lấy chi tiết một khóa học
    getCourseById: async (courseId) => {
        try {
            const response = await api.get(`/courses/${courseId}`)
            return response
        } catch (error) {
            throw error
        }
    },

    // Tạo khóa học mới
    createCourse: async (courseData) => {
        try {
            const response = await api.post("/courses", courseData)
            return response
        } catch (error) {
            throw error
        }
    },

    // Cập nhật khóa học
    updateCourse: async (courseId, courseData) => {
        try {
            const response = await api.put(`/courses/${courseId}`, courseData)
            return response
        } catch (error) {
            throw error
        }
    },

    // Xóa khóa học
    deleteCourse: async (courseId) => {
        try {
            const response = await api.delete(`/instructor/courses/${courseId}`)
            return response
        } catch (error) {
            throw error
        }
    },

    // Lấy danh sách học viên tham gia khóa học
    getCourseParticipants: async (courseId) => {
        try {
            const response = await api.get(`/instructor/courses/${courseId}/participants`)
            return response
        } catch (error) {
            throw error
        }
    },

    // Toggle visibility của module/lesson
    toggleMaterialVisibility: async (courseId, materialData) => {
        try {
            const response = await api.put(`/instructor/courses/${courseId}/materials/toggle-visibility`, materialData)
            return response
        } catch (error) {
            throw error
        }
    },

    // Tạo học kỳ mới
    createNewTerm: async (courseId, termData) => {
        try {
            const response = await api.put(`/instructor/courses/${courseId}/new-term`, termData)
            return response
        } catch (error) {
            throw error
        }
    },
}

// Subject API functions
export const subjectAPI = {
    getAllSubjects: async () => {
        try {
            const response = await api.get("/subjects")
            return response
        } catch (error) {
            throw error
        }
    },
}

// User API functions
export const userAPI = {
    getAllInstructors: async () => {
        try {
            const response = await api.get("/users/instructors")
            return response
        } catch (error) {
            throw error
        }
    },

    getCurrentUser: async () => {
        try {
            const response = await api.get("/auth/me")
            return response
        } catch (error) {
            throw error
        }
    },
}

export default api
