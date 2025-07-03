const express = require('express');
const router = express.Router();
const courseController = require('../../controllers/student/courseController');

// GET /api/student/courses/subject/:subjectId
router.get('/subject/:subjectId', courseController.getCoursesBySubject);

// GET /api/student/courses/search?q=keyword
router.get('/search', courseController.searchCourses);
// GET /api/student/courses/:courseId
router.get('/:courseId', courseController.getCourseDetail);
// GET /api/student/assignments/search?q=keyword

router.get('/sort', courseController.sortCourses);
router.get('/subject/:subjectId/student/:studentId',courseController.getCoursesBySubjectForStudent);
module.exports = router;
