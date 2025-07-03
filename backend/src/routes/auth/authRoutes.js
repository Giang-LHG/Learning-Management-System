const express = require('express');
const router = express.Router();
const authController = require('../../controllers/admin/authController');
const { body } = require('express-validator');

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

module.exports = router;
