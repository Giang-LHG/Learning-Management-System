const express = require('express');
const router  = express.Router();
const authMiddleware = require('../../middlewares/authMiddleware');
const studentController = require('../../controllers/parent/studentController');

router.use(authMiddleware.requireAuth);
router.get('/:parentId/stats', studentController.getParentStats);

module.exports = router;