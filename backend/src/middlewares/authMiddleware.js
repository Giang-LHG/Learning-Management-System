// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Giả sử có model User

const requireAuth = async (req, res, next) => {
  try {
    // 1. Kiểm tra sự tồn tại của Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực'
      });
    }

    // 2. Trích xuất token từ header
    const token = authHeader.split(' ')[1];

    // 3. Xác minh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Tìm người dùng trong database và gắn vào request
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }

    // 5. Kiểm tra nếu người dùng bị vô hiệu hóa
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đã bị vô hiệu hóa'
      });
    }

    // 6. Gắn thông tin người dùng vào request
    req.user = user;
    next();
  } catch (error) {
    console.error('Lỗi xác thực:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn',
        error: error.message
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Lỗi xác thực',
      error: error.message
    });
  }
};

// Middleware ghi log truy cập
const accessLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - User: ${req.user?.id || 'Guest'}`);
  next();
};

// Middleware giới hạn số lần đăng nhập
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Giới hạn 5 lần thử
  message: {
    success: false,
    message: 'Quá nhiều lần thử đăng nhập, vui lòng thử lại sau 15 phút'
  }
});



module.exports = {
  requireAuth,
  accessLogger,
  loginLimiter
};