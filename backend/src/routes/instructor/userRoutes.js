const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const { requireAuth } = require("../middlewares/authMiddleware")

// Protected routes
router.use(requireAuth)

// GET /api/users - Lấy danh sách users (admin only)
router.get(
    "/",
    (req, res, next) => {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin access required",
            })
        }
        next()
    },
    userController.getAllUsers,
)

// GET /api/users/instructors - Lấy danh sách instructors
router.get("/instructors", userController.getInstructors)

// GET /api/users/:userId - Lấy chi tiết user
router.get("/:userId", userController.getUserById)

// PUT /api/users/:userId - Cập nhật user (admin hoặc chính user đó)
router.put(
    "/:userId",
    (req, res, next) => {
        if (req.user.role !== "admin" && req.user._id.toString() !== req.params.userId) {
            return res.status(403).json({
                success: false,
                message: "Insufficient permissions",
            })
        }
        next()
    },
    userController.updateUser,
)

module.exports = router
