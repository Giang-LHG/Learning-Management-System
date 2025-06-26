// API endpoints
export const API_ENDPOINTS = {
    // Auth
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ME: "/auth/me",
    REFRESH: "/auth/refresh",

    // Courses
    COURSES: "/courses",
    INSTRUCTOR_COURSES: "/instructor/courses",

    // Subjects
    SUBJECTS: "/subjects",

    // Users
    USERS: "/users",
    INSTRUCTORS: "/users?role=instructor",

    // Enrollments
    ENROLLMENTS: "/enrollments",
}

// Status constants
export const COURSE_STATUS = {
    DRAFT: "draft",
    ACTIVE: "active",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
}

// User roles
export const USER_ROLES = {
    STUDENT: "student",
    INSTRUCTOR: "instructor",
    ADMIN: "admin",
    PARENT: "parent",
}

// Local storage keys
export const STORAGE_KEYS = {
    TOKEN: "token",
    USER: "user",
    REFRESH_TOKEN: "refreshToken",
}
