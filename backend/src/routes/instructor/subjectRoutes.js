const express = require("express")
const router = express.Router()
const subjectController = require("../controllers/subjectController")
const { requireAuth } = require("../middlewares/authMiddleware")

// Public routes
router.get("/", subjectController.getAllSubjects)
router.get("/:subjectId", subjectController.getSubjectById)

// Protected routes
router.use(requireAuth)

// Admin only routes
router.post(
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
    subjectController.createSubject,
)

router.put(
    "/:subjectId",
    (req, res, next) => {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin access required",
            })
        }
        next()
    },
    subjectController.updateSubject,
)

module.exports = router
