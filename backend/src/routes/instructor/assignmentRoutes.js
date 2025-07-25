const express = require("express")
const router = express.Router()
const assignmentController = require("../../controllers/instructor/assignmentController")

// GET /api/instructor/assignments/course/:courseId - Get all assignments for a course
router.get("/course/:courseId", assignmentController.getAssignmentsByCourse)

// POST /api/instructor/assignments - Create new assignment
router.post("/", assignmentController.createAssignment)
router.put("/:assignmentId", assignmentController.updateAssignment)
// GET /api/instructor/assignments/course/:courseId/calendar - Get assignments for calendar
router.get("/course/:courseId/calendar", assignmentController.getAssignmentsForCalendar)

// PUT /api/instructor/assignments/:assignmentId/toggle-visibility - Toggle assignment visibility
router.put("/:assignmentId/toggle-visibility", assignmentController.toggleAssignmentVisibility)

// PUT /api/instructor/assignments/:assignmentId/new-term - Create new term for assignment
router.put("/:assignmentId/new-term", assignmentController.createNewTerm)



router.delete("/:assignmentId", assignmentController.deleteAssignment)
module.exports = router
