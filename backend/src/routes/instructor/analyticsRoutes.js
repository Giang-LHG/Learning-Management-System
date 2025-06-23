// routes/instructor/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../../controllers/instructor/analyticsController');

// GET /api/instructor/analytics/course/:courseId
router.get('/course/:courseId', analyticsController.getCourseAnalytics);

module.exports = router;