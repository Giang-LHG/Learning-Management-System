// middlewares/adminMiddleware.js

const requireAdmin = (req, res, next) => {
  try {
    // 1. Kiểm tra xem đã xác thực người dùng chưa
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Chưa xác thực người dùng'
      });
    }

    // 2. Kiểm tra vai trò admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập tài nguyên này'
      });
    }

    next();
  } catch (error) {
    console.error('Lỗi kiểm tra quyền admin:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi kiểm tra quyền',
      error: error.message
    });
  }
};

module.exports = {
  requireAdmin
};