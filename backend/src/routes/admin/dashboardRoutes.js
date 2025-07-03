// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/admin/dashboardController');
const authMiddleware = require('../../middlewares/authMiddleware');
const adminMiddleware = require('../../middlewares/adminMiddleware');

// Middleware xác thực người dùng
const requireAuth = authMiddleware.requireAuth;
// Middleware kiểm tra quyền admin
const requireAdmin = adminMiddleware.requireAdmin;

/**
 * @route GET /dashboard/stats
 * @description Lấy thống kê tổng quan cho dashboard
 * @access Private (Admin)
 */
router.get('/stats', [requireAuth, requireAdmin], dashboardController.getDashboardStats);

/**
 * @route GET /dashboard/activity-chart
 * @description Lấy dữ liệu biểu đồ hoạt động trong 7 ngày qua
 * @access Private (Admin)
 */
router.get('/activity-chart', [requireAuth, requireAdmin], dashboardController.getActivityChart);

/**
 * @route GET /dashboard/recent-activities
 * @description Lấy danh sách hoạt động gần đây
 * @access Private (Admin)
 */
router.get('/recent-activities', [requireAuth, requireAdmin], dashboardController.getRecentActivities);

/**
 * @route GET /dashboard/user-status
 * @description Lấy thống kê user theo trạng thái
 * @access Private (Admin)
 */
router.get('/user-status', [requireAuth, requireAdmin], dashboardController.getUserStatusStats);

module.exports = router; 