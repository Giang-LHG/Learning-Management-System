const express = require('express');
const router = express.Router();
const subjectController = require('../../controllers/student/subjectController');

// GET /api/student/subjects
router.get('/', subjectController.getAllSubjects);

router.get('/recommentsubject/student/:studentId',subjectController.getSubjectRecommendations);
// GET /api/student/subjects/search?q=keyword
router.get('/search', subjectController.searchSubjects);
router.get('/sort', subjectController.sortSubjects);
// GET /api/student/subjects/by-student/:studentId
router.get('/by-student/:studentId', subjectController.getSubjectsByStudent);
router.get('/by-student/PreviousSubject/:studentId',subjectController.getPreviousSubjectsByStudent   
)
module.exports = router;
