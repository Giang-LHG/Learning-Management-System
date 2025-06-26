const express = require("express")
const router = express.Router()
const courseController = require("../controllers/courseController")
const { requireAuth } = require("../middlewares/authMiddleware")

// Public routes (if any)
router.get("/stats", courseController.getCourseStats)

// Protected routes
router.use(requireAuth)

// GET /api/courses - Lấy danh sách khóa học
router.get("/course", courseController.getAllCourses)

// GET /api/courses/:courseId - Lấy chi tiết khóa học
router.get("/:courseId", courseController.getCourseById)

// POST /api/courses - Tạo khóa học mới (chỉ instructor và admin)
router.post(
    "/",
    (req, res, next) => {
        if (!["instructor", "admin"].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Insufficient permissions",
            })
        }
        next()
    },
    courseController.createCourse,
)

// PUT /api/courses/:courseId - Cập nhật khóa học (chỉ instructor sở hữu hoặc admin)
router.put(
    "/:courseId",
    (req, res, next) => {
        if (!["instructor", "admin"].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Insufficient permissions",
            })
        }
        next()
    },
    courseController.updateCourse,
)

module.exports = router
