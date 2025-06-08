const express = require('express');
const router = express.Router();

const assignmentRoutes = require('./assignmentRoutes');
const courseRoutes = require('./courseRoutes');

const submissionRoutes = require('./submissionRoutes');
const subjectRoutes = require('./subjectRoutes');
const enrollmentRoutes = require('./enrollmentRoutes');
const appealRoutes = require('./appealRoutes');
router.use('/assignments', assignmentRoutes);
router.use('/courses', courseRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/submissions', submissionRoutes);
router.use('/subjects', subjectRoutes);
router.use('/appeals', appealRoutes);

module.exports = router;