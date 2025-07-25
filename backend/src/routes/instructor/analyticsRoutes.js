// routes/instructor/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../../controllers/instructor/analyticsController');
const { requireAuth, requireRole } = require('../../middlewares/authMiddleware');

// GET /api/instructor/analytics/course/:courseId
router.get('/course/:courseId', analyticsController.getCourseAnalytics);
// GET /api/instructor/analytics/dashboard
router.get('/dashboard', requireAuth, requireRole(['instructor']), analyticsController.getDashboardAnalytics);

module.exports = router;