// routes/instructor/appealRoutes.js
const express = require('express');
const router = express.Router();
const appealController = require('../../controllers/instructor/appealController');

// GET /api/instructor/appeals?instructorId=... -> Lấy danh sách appeals đang mở
router.get('/', appealController.listOpenAppeals);

// PUT /api/instructor/submissions/:submissionId/appeals/:appealId/resolve -> Xử lý một appeal
router.put('/submissions/:submissionId/appeals/:appealId/resolve', appealController.resolveAppeal);

module.exports = router;