// routes/student/enrollmentRoutes.js
const express = require('express');
const router = express.Router();
const enrollmentController = require('../../controllers/student/enrollmentController');

// POST /api/student/enroll
// Body: { studentId, courseId }
router.post('/enroll', enrollmentController.enrollCourse);
router.get('/study', enrollmentController.getStudiedLessons);
router.get('/enrollments/search', enrollmentController.searchEnrollments);
router.get('/', enrollmentController.getEnrollments);

router.post('/study', enrollmentController.addStudiedLesson);
module.exports = router;
