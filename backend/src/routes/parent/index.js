const express = require('express');
const router  = express.Router();
const studentRouter = require('./studentRouter');
const subjectRouter = require('./subjectRouter');
router.use('/student', studentRouter);
router.use('/subjects', subjectRouter);
module.exports = router;