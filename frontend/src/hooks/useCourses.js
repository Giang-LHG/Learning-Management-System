"use client"

import { useState, useEffect } from "react"
import { courseAPI } from "../services/api"

export const useCourses = (instructorId) => {
    const [courses, setCourses] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchCourses = async () => {
        if (!instructorId) return

        setIsLoading(true)
        setError(null)

        try {
            const response = await courseAPI.getAllCourses(instructorId)
            setCourses(response.data || [])
        } catch (err) {
            setError(err.message || "Có lỗi xảy ra khi tải khóa học")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchCourses()
    }, [instructorId])

    const addCourse = (newCourse) => {
        setCourses((prev) => [newCourse, ...prev])
    }

    const updateCourse = (courseId, updatedCourse) => {
        setCourses((prev) => prev.map((course) => (course._id === courseId ? { ...course, ...updatedCourse } : course)))
    }

    const removeCourse = (courseId) => {
        setCourses((prev) => prev.filter((course) => course._id !== courseId))
    }

    return {
        courses,
        isLoading,
        error,
        refetch: fetchCourses,
        addCourse,
        updateCourse,
        removeCourse,
    }
}
