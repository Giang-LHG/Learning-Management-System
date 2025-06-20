// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/userController');
const { body } = require('express-validator');

// Middleware xác thực (ví dụ cơ bản)
const authenticate = (req, res, next) => {
  // Triển khai logic xác thực thực tế ở đây (JWT, session...)
  next();
};

// Middleware phân quyền
const authorize = (roles) => (req, res, next) => {
  // Triển khai logic phân quyền dựa trên vai trò
  next();
};

// Đăng ký user
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['student', 'instructor', 'admin', 'parent']),
    body('profile.fullName').notEmpty()
  ],
  userController.register
);

// Đăng nhập
router.post('/login', userController.login);

// Lấy thông tin user
router.get('/:id', authenticate, userController.getUserProfile);

// Cập nhật user (yêu cầu xác thực)
router.put('/:id', authenticate, userController.updateUserProfile);

// Xóa user (chỉ admin)
router.delete('/:id', authenticate, authorize(['admin']), userController.deleteUser);

// Lấy user theo vai trò (option)
router.get('/', authenticate, userController.getUsersByRole);

module.exports = router;