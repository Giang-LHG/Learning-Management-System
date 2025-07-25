

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

// GET /api/instructor/submissions/assignment/:assignmentId/submission-status -> Lấy danh sách học sinh đã nộp/chưa nộp
router.get('/assignment/:assignmentId/submission-status', submissionController.getAssignmentSubmissionStatus);

// POST /api/instructor/submissions/assignment/:assignmentId/grade-student -> Chấm điểm học sinh chưa nộp bài tự luận
router.post('/assignment/:assignmentId/grade-student', submissionController.gradeStudentWithoutSubmission);

module.exports = router;