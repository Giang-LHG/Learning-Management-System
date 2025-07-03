
// controllers/instructor/assignmentController.js
const mongoose = require('mongoose');
const Assignment = require('../../models/Assignment');
const Course = require('../../models/Course');

/**
 * POST /assignments
 * Tạo một assignment mới cho một khóa học.
 * Đã cập nhật để xử lý cả câu hỏi cho quiz.
 */
exports.createAssignment = async (req, res) => {
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

    // Validate questions for quiz type
    if (type === 'quiz' && (!Array.isArray(questions) || questions.length === 0)) {
        return res.status(400).json({ success: false, message: 'For quiz type, questions array is required and cannot be empty.' });
    }

    const newAssignment = new Assignment({
      courseId,
      title,
      description: description || '',
      type,
      dueDate: new Date(dueDate),
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


/**
 * PUT /assignments/:assignmentId/new-term
 * Cập nhật assignment cho kỳ học mới, tự động lấy term từ course.
 */
exports.createNewTerm = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { dueDate } = req.body; // Chỉ cần dueDate
    
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
    
    // Lấy kỳ học mới nhất của course
    const newTerm = course.term[course.term.length - 1];
    
    // Kiểm tra ràng buộc: dueDate mới phải nằm trong khoảng thời gian của kỳ học mới
    if (new Date(dueDate) < new Date(course.startDate) || new Date(dueDate) > new Date(course.endDate)) {
        return res.status(400).json({ 
            success: false, 
            message: `New due date must be between the course's new term dates (${new Date(course.startDate).toLocaleDateString()} and ${new Date(course.endDate).toLocaleDateString()}).` 
        });
    }

    // Cập nhật assignment
    assignment.dueDate = new Date(dueDate);
    
    // Thêm term mới vào mảng term của assignment nếu nó chưa tồn tại
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


/**
 * GET /assignments/course/:courseId/calendar
 * Lấy tất cả assignment của một khóa học để hiển thị trên lịch.
 */
exports.getAssignmentsForCalendar = async (req, res) => {
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


/**
 * PUT /assignments/:assignmentId/toggle-visibility
 * Bật/tắt hiển thị một assignment.
 */
exports.toggleAssignmentVisibility = async (req, res) => {
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