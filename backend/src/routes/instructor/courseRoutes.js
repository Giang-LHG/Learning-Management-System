const express = require("express")
const router = express.Router()
const courseController = require("../../controllers/instructor/courseController")
const { requireAuth, requireRole } = require("../../middlewares/authMiddleware")

// Course management routes
router.get(
    "/instructor/:instructorId",
    [requireAuth, requireRole(["instructor"])],
    courseController.getCoursesByInstructor,
)
router.post("/", [requireAuth, requireRole(["instructor"])], courseController.createCourse)
router.put("/:courseId", [requireAuth, requireRole(["instructor"])], courseController.updateCourse)
router.delete("/:courseId", [requireAuth, requireRole(["instructor"])], courseController.deleteCourse)

// Course detail and content routes
router.get("/:courseId", [requireAuth, requireRole(["instructor", "admin"])], courseController.getCourseDetail)
router.get("/:courseId/modules", [requireAuth, requireRole(["instructor", "admin"])], courseController.getCourseModules)
router.get(
    "/:courseId/modules/:moduleId/lessons/:lessonId",
    [requireAuth, requireRole(["instructor", "admin"])],
    courseController.getLessonContent,
)

// Course participants and management
router.get(
    "/:courseId/participants",
    [requireAuth, requireRole(["instructor"])],
    courseController.getCourseParticipants,
)
router.put(
    "/:courseId/materials/toggle-visibility",
    [requireAuth, requireRole(["instructor"])],
    courseController.toggleMaterialVisibility,
)
router.put("/:courseId/new-term", [requireAuth, requireRole(["instructor"])], courseController.createNewTerm)

module.exports = router
