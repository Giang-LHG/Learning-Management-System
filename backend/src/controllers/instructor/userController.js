const User = require("../models/User")
const mongoose = require("mongoose")

// Lấy danh sách users với filter
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, role, search, isActive, sortBy = "createdAt", sortOrder = "desc" } = req.query

        // Build query
        const query = {}

        if (role) {
            query.role = role
        }

        if (isActive !== undefined) {
            query.isActive = isActive === "true"
        }

        if (search) {
            query.$or = [
                { username: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { "profile.fullName": { $regex: search, $options: "i" } },
                { "profile.phone": { $regex: search, $options: "i" } },
            ]
        }

        // Calculate pagination
        const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

        // Build sort object
        const sort = {}
        sort[sortBy] = sortOrder === "desc" ? -1 : 1

        const users = await User.find(query)
            .select("-passwordHash") // Exclude sensitive fields
            .sort(sort)
            .skip(skip)
            .limit(Number.parseInt(limit))
            .lean()

        const total = await User.countDocuments(query)

        return res.status(200).json({
            success: true,
            data: users,
            pagination: {
                currentPage: Number.parseInt(page),
                totalPages: Math.ceil(total / Number.parseInt(limit)),
                totalItems: total,
                itemsPerPage: Number.parseInt(limit),
            },
        })
    } catch (error) {
        console.error("Error in getAllUsers:", error)
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Lấy chi tiết user
exports.getUserById = async (req, res) => {
    try {
        const { userId } = req.params

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            })
        }

        const user = await User.findById(userId).select("-passwordHash").lean()

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        return res.status(200).json({
            success: true,
            data: user,
        })
    } catch (error) {
        console.error("Error in getUserById:", error)
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Lấy danh sách instructors
exports.getInstructors = async (req, res) => {
    try {
        const { page = 1, limit = 50, search, isActive = true } = req.query

        const query = {
            role: "instructor",
            isActive: isActive === "true",
        }

        if (search) {
            query.$or = [
                { username: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { "profile.fullName": { $regex: search, $options: "i" } },
            ]
        }

        const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

        const instructors = await User.find(query)
            .select("username email profile.fullName profile.phone profile.department createdAt")
            .sort({ "profile.fullName": 1, username: 1 })
            .skip(skip)
            .limit(Number.parseInt(limit))
            .lean()

        const total = await User.countDocuments(query)

        return res.status(200).json({
            success: true,
            data: instructors,
            pagination: {
                currentPage: Number.parseInt(page),
                totalPages: Math.ceil(total / Number.parseInt(limit)),
                totalItems: total,
                itemsPerPage: Number.parseInt(limit),
            },
        })
    } catch (error) {
        console.error("Error in getInstructors:", error)
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Cập nhật thông tin user
exports.updateUser = async (req, res) => {
    try {
        const { userId } = req.params
        const updateData = req.body

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            })
        }

        // Remove sensitive fields
        delete updateData.passwordHash
        delete updateData._id
        delete updateData.createdAt
        delete updateData.updatedAt

        // Check if email is being updated and is unique
        if (updateData.email) {
            const existingUser = await User.findOne({
                email: updateData.email,
                _id: { $ne: userId },
            })

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists",
                })
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { ...updateData, updatedAt: new Date() },
            { new: true, runValidators: true },
        )
            .select("-passwordHash")
            .lean()

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser,
        })
    } catch (error) {
        console.error("Error in updateUser:", error)
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}
