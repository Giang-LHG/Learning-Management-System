// routes/instructor/index.js
const express = require('express');
const router = express.Router();

const submissionRoutes = require('./submissionRoutes');
const appealRoutes = require('./appealRoutes');
const courseRoutes = require('./courseRoutes');
const assignmentRoutes_Ins = require('./assignmentRoutes');
const analyticsRoutes = require('./analyticsRoutes');

router.use('/submissions', submissionRoutes);
router.use('/appeals', appealRoutes);
router.use('/courses', courseRoutes);
router.use('/assignments', assignmentRoutes_Ins);
router.use('/analytics', analyticsRoutes);

module.exports = router;