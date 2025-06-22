// routes/instructor/assignmentRoutes.js
const express = require('express');
const router = express.Router();
const assignmentController = require('../../controllers/instructor/assignmentController');

// POST /api/instructor/assignments
router.post('/', assignmentController.createAssignment);

// GET /api/instructor/assignments/course/:courseId/calendar
router.get('/course/:courseId/calendar', assignmentController.getAssignmentsForCalendar);

// PUT /api/instructor/assignments/:assignmentId/toggle-visibility
router.put('/:assignmentId/toggle-visibility', assignmentController.toggleAssignmentVisibility);

// PUT /api/instructor/assignments/:assignmentId/new-term
router.put('/:assignmentId/new-term', assignmentController.createNewTerm);

module.exports = router;