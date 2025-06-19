const express = require('express');
const router  = express.Router();

const studentController = require('../../controllers/parent/studentController');
router.get('/:parentId/stats', studentController.getParentStats);

module.exports = router;