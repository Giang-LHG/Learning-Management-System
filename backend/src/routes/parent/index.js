const express = require('express');
const router  = express.Router();
const studentRouter = require('./studentRouter');

router.use('/student', studentRouter);

module.exports = router;