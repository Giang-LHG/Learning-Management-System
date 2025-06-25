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

/**
 * @route POST /users
 * @description Thêm người dùng mới
 * @access Private (Admin)
 */
router.post('/', [
  requireAuth, 
  requireAdmin,
  [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('role', 'Role is required').not().isEmpty(),
    check('profile.fullName', 'Full name is required').not().isEmpty(),
    // Custom validate cho từng role
    check('profile').custom((value, { req }) => {
      const role = req.body.role;
      if (role === 'instructor') {
        if (!value.bio) throw new Error('Bio is required for instructors');
        if (!value.expertise) throw new Error('Expertise is required for instructors');
        if (!value.phone) throw new Error('Phone number is required for instructors');
      }
      if (role === 'student') {
        if (!value.parentIds || value.parentIds.length === 0) throw new Error('Student must have at least one parent');
        if (!value.phone) throw new Error('Phone number is required for students');
      }
      // Các role khác chỉ cần fullName
      return true;
    })
  ]
], userController.createUser);

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
    // Kiểm tra profile cho các role cụ thể
    check('profile').custom((value, { req }) => {
      const role = req.body.role;
      
      // Student phải có parentIds
      if (role === 'student' && (!value.parentIds || value.parentIds.length === 0)) {
        throw new Error('Student must have at least one parent');
      }
      
      // Instructor phải có bio và expertise
      if (role === 'instructor') {
        if (!value.bio) throw new Error('Bio is required for instructors');
        if (!value.expertise || value.expertise.length === 0) {
          throw new Error('Expertise is required for instructors');
        }
      }
      return true;
    })
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