

// routes/instructor/submissionRoutes.js
const express = require('express');
const router = express.Router();
const submissionController = require('../../controllers/instructor/submissionController');

// GET /api/instructor/submissions/assignment/:assignmentId -> Lấy danh sách bài nộp
router.get('/assignment/:assignmentId', submissionController.getSubmissionsForGrading);

// GET /api/instructor/submissions/:submissionId -> Lấy chi tiết bài nộp
router.get('/:submissionId', submissionController.getSubmissionDetail);

// PUT /api/instructor/submissions/:submissionId/grade -> Chấm điểm
router.put('/:submissionId/grade', submissionController.gradeSubmission);

module.exports = router;