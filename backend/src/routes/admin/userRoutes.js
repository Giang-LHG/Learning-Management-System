// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/userController');
const authMiddleware = require('../../middlewares/authMiddleware');
const adminMiddleware = require('../../middlewares/adminMiddleware');
const { check } = require('express-validator');

// Middleware xác thực người dùng
const requireAuth = authMiddleware.requireAuth;
// Middleware kiểm tra quyền admin
const requireAdmin = adminMiddleware.requireAdmin;

/**
 * @route GET /users
 * @description Lấy danh sách tất cả users (có phân trang và lọc)
 * @access Private (Admin)
 */
router.get('/', [requireAuth, requireAdmin], userController.getAllUsers);
// router.get('/', [requireAuth, requireAdmin], userController.getAllUsers);

/**
 * @route GET /users/profile
 * @description Lấy thông tin profile của user hiện tại
 * @access Private
 */
router.get('/profile', requireAuth, userController.getCurrentUserProfile);

/**
 * @route PUT /users/profile
 * @description Cập nhật profile của user hiện tại
 * @access Private
 */
router.put('/profile', [
  requireAuth,
  [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
  ]
], userController.updateCurrentUserProfile);

/**
 * @route GET /users/:id
 * @description Lấy thông tin user theo ID
 * @access Private (Admin)
 */
router.get('/:id', [requireAuth, requireAdmin], userController.getUserProfile);

/**
 * @route PUT /users/:id
 * @description Cập nhật thông tin user
 * @access Private (Admin)
 */
router.put('/:id', [
  requireAuth, 
  requireAdmin,
  [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
  ]
], userController.updateUserProfile);

/**
 * @route DELETE /users/:id
 * @description Xóa user
 * @access Private (Admin)
 */
router.delete('/:id', [requireAuth, requireAdmin], userController.deleteUser);

/**
 * @route GET /users/by-role
 * @description Lấy users theo role
 * @access Private (Admin)
 */
router.get('/by-role', [requireAuth, requireAdmin], userController.getUsersByRole);

module.exports = router;