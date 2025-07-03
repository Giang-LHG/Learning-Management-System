// routes/assignmentRoutes.js
const express = require('express');
const router = express.Router();
const assignmentController = require('../../controllers/student/assignmentController');

router.get('/course/:courseId/student/:studentId', assignmentController.getAssignmentsByCourse);


router.get('/sort', assignmentController.sortAssignments);
router.get('/search', assignmentController.searchAssignments);
router.get('/:assignmentId/student/:studentId', assignmentController.getAssignmentById);
module.exports = router;
