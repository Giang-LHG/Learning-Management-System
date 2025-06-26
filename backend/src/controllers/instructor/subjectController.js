const Subject = require("../models/Subject")
const mongoose = require("mongoose")

// Lấy tất cả môn học
exports.getAllSubjects = async (req, res) => {
    try {
        const { page = 1, limit = 50, search, status } = req.query

        // Build query
        const query = {}

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { code: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ]
        }

        if (status) {
            query.status = status
        }

        // Calculate pagination
        const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

        const subjects = await Subject.find(query)
            .populate("createdBy", "profile.fullName username")
            .populate("prerequisites", "code name")
            .sort({ code: 1, name: 1 })
            .skip(skip)
            .limit(Number.parseInt(limit))
            .lean()

        const total = await Subject.countDocuments(query)

        return res.status(200).json({
            success: true,
            data: subjects,
            pagination: {
                currentPage: Number.parseInt(page),
                totalPages: Math.ceil(total / Number.parseInt(limit)),
                totalItems: total,
                itemsPerPage: Number.parseInt(limit),
            },
        })
    } catch (error) {
        console.error("Error in getAllSubjects:", error)
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Lấy chi tiết môn học
exports.getSubjectById = async (req, res) => {
    try {
        const { subjectId } = req.params

        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subject ID",
            })
        }

        const subject = await Subject.findById(subjectId)
            .populate("createdBy", "profile.fullName username")
            .populate("prerequisites", "code name")
            .lean()

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found",
            })
        }

        return res.status(200).json({
            success: true,
            data: subject,
        })
    } catch (error) {
        console.error("Error in getSubjectById:", error)
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Tạo môn học mới
exports.createSubject = async (req, res) => {
    try {
        const { name, code, description, prerequisites } = req.body

        if (!name || !code) {
            return res.status(400).json({
                success: false,
                message: "Name and code are required",
            })
        }

        // Check if subject with same code exists
        const existingSubject = await Subject.findOne({
            code: code.toUpperCase().trim(),
        })

        if (existingSubject) {
            return res.status(400).json({
                success: false,
                message: "Subject with this code already exists",
            })
        }

        const subjectData = {
            name: name.trim(),
            code: code.toUpperCase().trim(),
            description: description?.trim() || "",
            createdBy: req.user._id, // From auth middleware
            prerequisites: prerequisites || [],
        }

        const newSubject = new Subject(subjectData)
        await newSubject.save()

        // Populate the created subject
        const populatedSubject = await Subject.findById(newSubject._id)
            .populate("createdBy", "profile.fullName username")
            .populate("prerequisites", "code name")
            .lean()

        return res.status(201).json({
            success: true,
            message: "Subject created successfully",
            data: populatedSubject,
        })
    } catch (error) {
        console.error("Error in createSubject:", error)
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Cập nhật môn học
exports.updateSubject = async (req, res) => {
    try {
        const { subjectId } = req.params
        const updateData = req.body

        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subject ID",
            })
        }

        // Remove fields that shouldn't be updated
        delete updateData._id
        delete updateData.createdAt
        delete updateData.updatedAt
        delete updateData.createdBy

        // Normalize code if provided
        if (updateData.code) {
            updateData.code = updateData.code.toUpperCase().trim()

            // Check for duplicate code
            const existingSubject = await Subject.findOne({
                code: updateData.code,
                _id: { $ne: subjectId },
            })

            if (existingSubject) {
                return res.status(400).json({
                    success: false,
                    message: "Subject with this code already exists",
                })
            }
        }

        const updatedSubject = await Subject.findByIdAndUpdate(
            subjectId,
            { ...updateData, updatedAt: new Date() },
            { new: true, runValidators: true },
        )
            .populate("createdBy", "profile.fullName username")
            .populate("prerequisites", "code name")
            .lean()

        if (!updatedSubject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found",
            })
        }

        return res.status(200).json({
            success: true,
            message: "Subject updated successfully",
            data: updatedSubject,
        })
    } catch (error) {
        console.error("Error in updateSubject:", error)
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}
