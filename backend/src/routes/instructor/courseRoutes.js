
// routes/instructor/courseRoutes.js
const express = require('express');
const router = express.Router();
const courseController = require('../../controllers/instructor/courseController');

router.get('/:courseId/participants', courseController.getCourseParticipants);
router.delete('/:courseId', courseController.deleteCourse);
router.put('/:courseId/materials/toggle-visibility', courseController.toggleMaterialVisibility);
router.put('/:courseId/new-term', courseController.createNewTerm);

module.exports = router;