const express = require('express');
const router = express.Router();
const authController = require('../../controllers/admin/authController');
const { body } = require('express-validator');
const { requireAuth } = require('../../middlewares/authMiddleware');

// Đăng ký
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['student', 'instructor', 'admin', 'parent']),
    body('profile.fullName').notEmpty()
  ],
  authController.register
);

// Đăng nhập
router.post('/login', authController.login);

// Quên mật khẩu - gửi OTP
router.post('/forgot-password', authController.forgotPassword);
// Đặt lại mật khẩu bằng OTP
router.post('/reset-password', authController.resetPassword);

router.post('/change-password', requireAuth, authController.changePassword);

module.exports = router;
