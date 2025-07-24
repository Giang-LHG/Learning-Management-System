const express = require("express")
const router = express.Router()

const submissionRoutes = require("./submissionRoutes")
const appealRoutes = require("./appealRoutes")
const courseRoutes = require("./courseRoutes")
const assignmentRoutes = require("./assignmentRoutes")
const analyticsRoutes = require("./analyticsRoutes")
const instructorListRoutes = require('./instructorListRoutes');

// Add authentication middleware
const { requireAuth, requireRole } = require("../../middlewares/authMiddleware")

// Apply authentication to all instructor routes
router.use(requireAuth)
router.use(requireRole(["instructor", "admin"]))

router.use("/submissions", submissionRoutes)
router.use("/appeals", appealRoutes)
router.use("/courses", courseRoutes)
router.use("/assignments", assignmentRoutes)
router.use("/analytics", analyticsRoutes)
router.use(instructorListRoutes);

module.exports = router
