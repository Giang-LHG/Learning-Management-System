const mongoose = require("mongoose")
const Course = require("../models/Course")
const Subject = require("../models/Subject")
const User = require("../models/User")

// Lấy tất cả khóa học với filter
exports.getAllCourses = async (req, res) => {
  try {
    const { instructorId, page = 1, limit = 10, search, status } = req.query

    // Build query object
    const query = {}

    // Filter by instructor
    if (instructorId && mongoose.Types.ObjectId.isValid(instructorId)) {
      query.instructorId = instructorId
    }

    // Search functionality
    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    // Status filter (based on dates)
    if (status) {
      const now = new Date()
      switch (status) {
        case "draft":
          query.startDate = { $gt: now }
          break
        case "active":
          query.startDate = { $lte: now }
          query.endDate = { $gte: now }
          break
        case "completed":
          query.endDate = { $lt: now }
          break
      }
    }

    // Calculate pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    // Execute query with population
    const courses = await Course.find(query)
      .populate("instructorId", "profile.fullName username email")
      .populate("subjectId", "name code")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))
      .lean()

    // Get total count for pagination
    const total = await Course.countDocuments(query)

    // Calculate pagination info
    const totalPages = Math.ceil(total / Number.parseInt(limit))
    const hasNextPage = Number.parseInt(page) < totalPages
    const hasPrevPage = Number.parseInt(page) > 1

    return res.status(200).json({
      success: true,
      data: courses,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: Number.parseInt(limit),
        hasNextPage,
        hasPrevPage,
      },
    })
  } catch (error) {
    console.error("Error in getAllCourses:", error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Lấy chi tiết một khóa học
exports.getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      })
    }

    const course = await Course.findById(courseId)
      .populate("instructorId", "profile.fullName username email")
      .populate("subjectId", "name code description")
      .lean()

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    return res.status(200).json({
      success: true,
      data: course,
    })
  } catch (error) {
    console.error("Error in getCourseById:", error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Tạo khóa học mới
exports.createCourse = async (req, res) => {
  try {
    const { title, description, subjectId, instructorId, startDate, endDate, credits, term, modules } = req.body

    // Validation
    if (!title || !subjectId || !instructorId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, subjectId, instructorId, startDate, endDate",
      })
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(subjectId) || !mongoose.Types.ObjectId.isValid(instructorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subjectId or instructorId",
      })
    }

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      })
    }

    // Check if subject exists
    const subject = await Subject.findById(subjectId)
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      })
    }

    // Check if instructor exists
    const instructor = await User.findById(instructorId)
    if (!instructor || instructor.role !== "instructor") {
      return res.status(404).json({
        success: false,
        message: "Instructor not found",
      })
    }

    // Process modules to ensure they have proper IDs
    const processedModules =
      modules?.map((module) => ({
        moduleId: module.moduleId || new mongoose.Types.ObjectId(),
        title: module.title,
        isVisible: module.isVisible !== undefined ? module.isVisible : true,
        lessons:
          module.lessons?.map((lesson) => ({
            lessonId: lesson.lessonId || new mongoose.Types.ObjectId(),
            title: lesson.title,
            content: lesson.content || "",
            isVisible: lesson.isVisible !== undefined ? lesson.isVisible : true,
          })) || [],
      })) || []

    // Create course
    const courseData = {
      title: title.trim(),
      description: description?.trim() || "",
      subjectId,
      instructorId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      credits: Number.parseInt(credits) || 0,
      term: Array.isArray(term) ? term.filter((t) => t.trim()) : [],
      modules: processedModules,
    }

    const newCourse = new Course(courseData)
    await newCourse.save()

    // Populate the created course
    const populatedCourse = await Course.findById(newCourse._id)
      .populate("instructorId", "profile.fullName username email")
      .populate("subjectId", "name code")
      .lean()

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: populatedCourse,
    })
  } catch (error) {
    console.error("Error in createCourse:", error)

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Course with this title already exists",
      })
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Cập nhật khóa học
exports.updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params
    const updateData = req.body

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      })
    }

    // Remove fields that shouldn't be updated directly
    delete updateData._id
    delete updateData.createdAt
    delete updateData.updatedAt

    // Validate dates if provided
    if (updateData.startDate && updateData.endDate) {
      if (new Date(updateData.startDate) >= new Date(updateData.endDate)) {
        return res.status(400).json({
          success: false,
          message: "End date must be after start date",
        })
      }
    }

    // Process modules if provided
    if (updateData.modules) {
      updateData.modules = updateData.modules.map((module) => ({
        moduleId: module.moduleId || new mongoose.Types.ObjectId(),
        title: module.title,
        isVisible: module.isVisible !== undefined ? module.isVisible : true,
        lessons:
          module.lessons?.map((lesson) => ({
            lessonId: lesson.lessonId || new mongoose.Types.ObjectId(),
            title: lesson.title,
            content: lesson.content || "",
            isVisible: lesson.isVisible !== undefined ? lesson.isVisible : true,
          })) || [],
      }))
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true },
    )
      .populate("instructorId", "profile.fullName username email")
      .populate("subjectId", "name code")
      .lean()

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error("Error in updateCourse:", error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Lấy thống kê khóa học
exports.getCourseStats = async (req, res) => {
  try {
    const { instructorId } = req.query

    const matchQuery =
      instructorId && mongoose.Types.ObjectId.isValid(instructorId)
        ? { instructorId: new mongoose.Types.ObjectId(instructorId) }
        : {}

    const stats = await Course.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          totalCredits: { $sum: "$credits" },
          avgCredits: { $avg: "$credits" },
          totalModules: { $sum: { $size: "$modules" } },
          totalLessons: {
            $sum: {
              $reduce: {
                input: "$modules",
                initialValue: 0,
                in: { $add: ["$$value", { $size: "$$this.lessons" }] },
              },
            },
          },
        },
      },
    ])

    // Status breakdown
    const now = new Date()
    const statusStats = await Course.aggregate([
      { $match: matchQuery },
      {
        $addFields: {
          status: {
            $cond: {
              if: { $gt: ["$startDate", now] },
              then: "draft",
              else: {
                $cond: {
                  if: { $lt: ["$endDate", now] },
                  then: "completed",
                  else: "active",
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    const result = {
      overview: stats[0] || {
        totalCourses: 0,
        totalCredits: 0,
        avgCredits: 0,
        totalModules: 0,
        totalLessons: 0,
      },
      statusBreakdown: statusStats.reduce(
        (acc, item) => {
          acc[item._id] = item.count
          return acc
        },
        { draft: 0, active: 0, completed: 0 },
      ),
    }

    return res.status(200).json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error in getCourseStats:", error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}
