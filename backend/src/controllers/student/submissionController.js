// controllers/submissionController.js
const mongoose = require('mongoose');
const Assignment = require('../../models/Assignment');
const Submission = require('../../models/Submission');

/**
 * POST /submissions/submit
 * Cho học sinh nộp bài (essay hoặc quiz).
 * Body cần có: { studentId, assignmentId, content?, answers? }
 * Trước khi lưu, kiểm tra xem assignment.dueDate đã quá hạn chưa.
 */
exports.submitAssignment = async (req, res) => {
  try {
    const { studentId, assignmentId, content, answers } = req.body;

    // Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(assignmentId)
    ) {
      return res.status(400).json({ success: false, message: 'Invalid IDs' });
    }

    // Lấy assignment để kiểm tra tồn tại và deadline
    const assignment = await Assignment.findById(assignmentId).lean();
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Kiểm tra deadline
    if (new Date() > assignment.dueDate) {
      return res
        .status(400)
        .json({ success: false, message: 'Deadline has passed. Cannot submit.' });
    }

    // Tạo mới Submission
    const newSubmission = new Submission({
      assignmentId,
      studentId,
      submittedAt: new Date(),
      content: content || '',
      answers: answers || [] // chỉ dùng khi type === 'quiz'
    });

    await newSubmission.save();
    return res.status(201).json({ success: true, data: newSubmission });
  } catch (err) {
    console.error('Error in submitAssignment:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * (Tùy chọn) GET /submissions/assignment/:assignmentId
 * Trả về tất cả submissions cho một assignment (để instructor xem)
 */
exports.getSubmissionsByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid assignmentId' });
    }

    const submissions = await Submission.find({ assignmentId })
      .populate('studentId', 'profile.fullName email') // lấy thông tin student
      .lean();

    return res.status(200).json({ success: true, data: submissions });
  } catch (err) {
    console.error('Error in getSubmissionsByAssignment:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * (Tùy chọn) GET /submissions/student/:studentId
 * Trả về tất cả submissions của một student (để student kiểm tra lại)
 */
exports.getSubmissionsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid studentId' });
    }

    const submissions = await Submission.find({ studentId })
      .populate('assignmentId', 'title dueDate type')
      .lean();

    return res.status(200).json({ success: true, data: submissions });
  } catch (err) {
    console.error('Error in getSubmissionsByStudent:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
