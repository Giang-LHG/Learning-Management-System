// routes/submissionRoutes.js
const express = require('express');
const router = express.Router();
const submissionController = require('../../controllers/student/submissionController');

// POST /api/submissions/submit
router.post('/submit', submissionController.submitAssignment);

// (Tùy chọn) GET /api/submissions/assignment/:assignmentId
router.get('/assignment/:assignmentId', submissionController.getSubmissionsByAssignment);

// (Tùy chọn) GET /api/submissions/student/:studentId
router.get('/student/:studentId', submissionController.getSubmissionsByStudent);
router.put('/resubmit/:submissionId',submissionController.resubmitSubmission);
router.get('/student/:studentId/course/:courseId', submissionController.getSubmissionsByCourse);
module.exports = router;
