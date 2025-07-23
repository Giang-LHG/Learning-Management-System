// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken")
const User = require("../models/User")

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy token xác thực",
      })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")

    const user = await User.findById(decoded.userId).select("-passwordHash")

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Người dùng không tồn tại",
      })
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Tài khoản của bạn đã bị vô hiệu hóa",
      })
    }

    req.user = user
    next()
  } catch (error) {
    console.error("Lỗi xác thực:", error)

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token đã hết hạn",
        error: error.message,
      })
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
        error: error.message,
      })
    }

    res.status(500).json({
      success: false,
      message: "Lỗi xác thực",
      error: error.message,
    })
  }
}

// Thêm requireRole function
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden - Insufficient permissions",
      })
    }

    next()
  }
}

const accessLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - User: ${req.user?.id || "Guest"}`)
  next()
}

const rateLimit = require("express-rate-limit")

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Quá nhiều lần thử đăng nhập, vui lòng thử lại sau 15 phút",
  },
})

module.exports = {
  requireAuth,
  requireRole, // ✅ Thêm export này
  accessLogger,
  loginLimiter,
}
