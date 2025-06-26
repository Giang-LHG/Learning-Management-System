const express = require("express")
const router = express.Router()
const { requireAuth } = require("../middlewares/authMiddleware")

// GET /api/auth/me - Lấy thông tin user hiện tại
router.get("/me", requireAuth, async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            data: req.user,
        })
    } catch (error) {
        console.error("Error in /auth/me:", error)
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
})

module.exports = router
