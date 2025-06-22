
// controllers/instructor/courseController.js
const mongoose = require('mongoose');
const Enrollment = require('../../models/Enrollment');
const Course = require('../../models/Course');

exports.getCourseParticipants = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid courseId' });
    }

    const enrollments = await Enrollment.find({ courseId })
      .populate('studentId', 'profile.fullName email')
      .sort({ enrolledAt: 1 })
      .lean();

    const participants = enrollments.map(e => ({
      studentId: e.studentId._id,
      fullName: e.studentId.profile.fullName,
      email: e.studentId.email,
      enrolledAt: e.enrolledAt,
    }));

    return res.status(200).json({ success: true, data: participants });
  } catch (err) {
    console.error('Error in getCourseParticipants:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid courseId' });
    }

    const result = await Course.findByIdAndDelete(courseId);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    return res.status(200).json({ success: true, message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Error deleting course:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.toggleMaterialVisibility = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { materialType, materialId, isVisible } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(courseId) ||
      !mongoose.Types.ObjectId.isValid(materialId) ||
      !['module', 'lesson'].includes(materialType) ||
      typeof isVisible !== 'boolean'
    ) {
      return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (materialType === 'module') {
      const module = course.modules.find(m => m.moduleId.toString() === materialId);
      if (module) module.isVisible = isVisible;
    } else {
      for (const module of course.modules) {
        const lesson = module.lessons.find(l => l.lessonId.toString() === materialId);
        if (lesson) {
          lesson.isVisible = isVisible;
          break;
        }
      }
    }

    await course.save();
    return res.status(200).json({ success: true, message: 'Visibility updated', data: course });
  } catch (err) {
    console.error('Error toggling material visibility:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createNewTerm = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { term, startDate, endDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId) || !term || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Invalid input. term, startDate, and endDate are required.' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (new Date(course.endDate) > new Date()) {
        return res.status(400).json({ success: false, message: 'Cannot create a new term until the current term\'s end date has passed.' });
    }

    course.startDate = new Date(startDate);
    course.endDate = new Date(endDate);
    course.term.push(term);

    await course.save();

    return res.status(200).json({ success: true, message: `New term '${term}' created for course.`, data: course });

  } catch (err) {
    console.error('Error creating new term for course:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};