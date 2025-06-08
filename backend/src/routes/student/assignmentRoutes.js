// routes/assignmentRoutes.js
const express = require('express');
const router = express.Router();
const assignmentController = require('../../controllers/student/assignmentController');

// GET /api/assignments/course/:courseId
router.get('/course/:courseId', assignmentController.getAssignmentsByCourse);

// GET /api/assignments/:assignmentId
router.get('/:assignmentId', assignmentController.getAssignmentById);
router.get('/sort', assignmentController.sortAssignments);
router.get('/search', assignmentController.searchAssignments);
module.exports = router;
