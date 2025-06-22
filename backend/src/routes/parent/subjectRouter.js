const express = require('express');
const router  = express.Router();
const SubjectController = require('../../controllers/parent/subjectController');
router.get('/subjects-overview',SubjectController.getSubjectOverview);

module.exports = router;