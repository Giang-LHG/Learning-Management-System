
const mongoose = require('mongoose');
const Assignment = require('../../models/Assignment');
const Course = require('../../models/Course');

const createAssignment = async (req, res) => {
  try {
    const { courseId, title, description, type, dueDate, questions } = req.body;
    if (!courseId || !title || !type || !dueDate) {
      return res.status(400).json({ success: false, message: 'courseId, title, type, and dueDate are required.' });
    }
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }
    const currentTerm = course.term[course.term.length - 1];
    if (new Date(dueDate) > new Date(course.endDate)) {
      return res.status(400).json({ success: false, message: 'Assignment due date cannot be later than the course end date.' });
    }
    if (type === 'quiz' && (!Array.isArray(questions) || questions.length === 0)) {
        return res.status(400).json({ success: false, message: 'For quiz type, questions array is required and cannot be empty.' });
    }
    const newAssignment = new Assignment({
      courseId, title, description: description || '', type, dueDate: new Date(dueDate),
      questions: type === 'quiz' ? questions : undefined,
      term: [currentTerm]
    });
    await newAssignment.save();
    res.status(201).json({ success: true, data: newAssignment });
  } catch (err) {
    console.error('Error creating assignment:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createNewTerm = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { dueDate } = req.body;
    if (!mongoose.Types.ObjectId.isValid(assignmentId) || !dueDate) {
      return res.status(400).json({ success: false, message: 'Invalid input. dueDate is required.' });
    }
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    if (new Date(assignment.dueDate) > new Date()) {
      return res.status(400).json({ success: false, message: 'Cannot create a new term until the current due date has passed.' });
    }
    const course = await Course.findById(assignment.courseId).lean();
    if (!course) {
        return res.status(404).json({ success: false, message: 'Parent course not found.' });
    }
    const newTerm = course.term[course.term.length - 1];
    if (new Date(dueDate) < new Date(course.startDate) || new Date(dueDate) > new Date(course.endDate)) {
        return res.status(400).json({ success: false, message: `New due date must be between the course's new term dates (${new Date(course.startDate).toLocaleDateString()} and ${new Date(course.endDate).toLocaleDateString()}).` });
    }
    assignment.dueDate = new Date(dueDate);
    if (!assignment.term.includes(newTerm)) {
        assignment.term.push(newTerm);
    }
    await assignment.save();
    return res.status(200).json({ success: true, message: `Assignment updated for new term '${newTerm}'.`, data: assignment });
  } catch (err) {
    console.error('Error creating new term for assignment:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAssignmentsForCalendar = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid courseId' });
    }
    const assignments = await Assignment.find({ courseId }).select('title dueDate').lean();
    const events = assignments.map(a => ({
        title: a.title,
        date: a.dueDate,
        id: a._id
    }));
    res.status(200).json({ success: true, data: events });
  } catch (err) {
    console.error('Error in getAssignmentsForCalendar:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const toggleAssignmentVisibility = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { isVisible } = req.body;
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid assignmentId' });
    }
    if (typeof isVisible !== 'boolean') {
        return res.status(400).json({ success: false, message: 'isVisible must be a boolean.' });
    }
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      { isVisible },
      { new: true }
    );
    if (!updatedAssignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    res.status(200).json({ success: true, message: 'Visibility updated', data: updatedAssignment });
  } catch (err) {
    console.error('Error in toggleAssignmentVisibility:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
    createAssignment,
    createNewTerm,
    getAssignmentsForCalendar,
    toggleAssignmentVisibility
};