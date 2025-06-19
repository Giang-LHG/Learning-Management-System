// routes/student/appealRoutes.js
const express = require('express');
const router = express.Router();
const appealController = require('../../controllers/student/appealController');

// GET /api/student/appeals?studentId=...
// Trả về danh sách phúc khảo (appeal) của học sinh đó
router.get('/', appealController.getAppealsByStudent);
router.post('/:submissionId/appeals/:appealId/comments', appealController.addAppealComment);
module.exports = router;
