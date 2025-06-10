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
exports.resubmitSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { content, answers } = req.body; // content cho essay, answers cho quiz

    // 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({ success: false, message: 'Invalid submissionId' });
    }

    // 2. Tìm submission hiện tại
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // 3. Lấy assignment để kiểm tra deadline
    const assignment = await Assignment.findById(submission.assignmentId).select('dueDate type');
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    const now = new Date();
    if (now > assignment.dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Cannot resubmit: due date has passed'
      });
    }

    // 4. Cập nhật nội dung mới
    if (assignment.type === 'essay') {
      if (typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Please provide non-empty content for essay resubmission'
        });
      }
      submission.content = content.trim();
    } else if (assignment.type === 'quiz') {
      if (!Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide answers array for quiz resubmission'
        });
      }
      submission.answers = answers.map(ans => ({
        questionId: ans.questionId,
        selectedOption: ans.selectedOption
      }));
    }

    // 5. Đặt lại thời gian và xóa grade cũ
    submission.submittedAt = now;
    submission.grade = { score: null, gradedAt: null, graderId: null };

    await submission.save();

    return res.json({
      success: true,
      data: submission,
      message: 'Resubmission successful'
    });
  } catch (err) {
    console.error('Error in resubmitSubmission:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during resubmission'
    });
  }
};
exports.getSubmissionsByCourse = async (req, res) => {
  try {
    const { courseId ,studentId} = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid courseId' });
    }
   if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid studentId' });
    }
    // 1. Lấy tất cả assignment thuộc courseId
    const assignments = await Assignment.find({ courseId }).select('_id').lean();
    const assignmentIds = assignments.map(a => a._id);

    if (!assignmentIds.length) {
      return res.json({ success: true, data: [] });
    }

    // 2. Tìm tất cả submission có assignmentId nằm trong danh sách
    const submissions = await Submission.find({ assignmentId: { $in: assignmentIds }, studentId:studentId })
      .populate('assignmentId')  // nếu cần thông tin assignment
      .populate('studentId', 'name profile.email') // nếu cần thông tin sinh viên
      .lean();
const formatted = submissions.map(s => ({
  ...s,
  assignment: s.assignmentId, // alias rõ ràng
  student: s.studentId
}));
res.json({ success: true, data: formatted });
    
  } catch (err) {
    console.error('Error fetching submissions by course:', err);
    res.status(500).json({ success: false, message: 'Error fetching submissions' });
  }
};