
const mongoose = require('mongoose');
const Submission = require('../../models/Submission');
const Assignment = require('../../models/Assignment');
const Enrollment = require('../../models/Enrollment');
const User = require('../../models/User');

const getSubmissionsForGrading = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid assignmentId' });
    }
    const assignment = await Assignment.findById(assignmentId).lean();
    if (!assignment || !assignment.term || assignment.term.length === 0) {
        return res.status(404).json({ success: false, message: 'Assignment not found or has no active term.' });
    }
    const currentTerm = assignment.term[assignment.term.length - 1];
    const submissions = await Submission.find({ assignmentId, term: currentTerm })
      .populate('studentId', 'profile.fullName email')
      .sort({ submittedAt: -1 })
      .lean();
    return res.status(200).json({ success: true, data: submissions });
  } catch (err) {
    console.error('Error in getSubmissionsForGrading:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getSubmissionDetail = async (req, res) => {
  try {
    const { submissionId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({ success: false, message: 'Invalid submissionId' });
    }
    const submission = await Submission.findById(submissionId)
      .populate('studentId', 'profile.fullName email')
      .populate({ path: 'assignmentId', select: 'title type questions' })
      .lean();
    if (!submission) {
        return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    return res.status(200).json({ success: true, data: submission });
  } catch (err) {
    console.error('Error in getSubmissionDetail:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, instructorId: instructorIdFromBody } = req.body;
    // Ưu tiên lấy instructorId từ req.user nếu có
    const instructorId = req.user?._id || instructorIdFromBody;
    if (!mongoose.Types.ObjectId.isValid(submissionId) || !mongoose.Types.ObjectId.isValid(instructorId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }
    if (typeof score !== 'number' || score < 0 || score > 10) {
      return res.status(400).json({ success: false, message: 'Score must be a number between 0 and 10' });
    }
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    if (!submission.term) {
      const assignment = await Assignment.findById(submission.assignmentId).lean();
      if (assignment && assignment.term && assignment.term.length > 0) {
        submission.term = assignment.term[assignment.term.length - 1];
      } else {
        return res.status(500).json({ success: false, message: 'Cannot grade. Parent assignment is missing term data.' });
      }
    }
    submission.grade = { score: score, gradedAt: new Date(), graderId: instructorId };
    await submission.save();
    return res.status(200).json({ success: true, message: 'Submission graded successfully', data: submission });
  } catch (err) {
    console.error('Error in gradeSubmission:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// LẤY DANH SÁCH HỌC SINH ĐÃ NỘP/CHƯA NỘP CHO ASSIGNMENT
const getAssignmentSubmissionStatus = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid assignmentId' });
    }
    const assignment = await Assignment.findById(assignmentId).lean();
    if (!assignment || !assignment.term || assignment.term.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found or has no active term.' });
    }
    const currentTerm = assignment.term[assignment.term.length - 1];
    // Lấy danh sách học sinh của course trong term này
    const enrollments = await Enrollment.find({ courseId: assignment.courseId, term: currentTerm, status: 'active' }).lean();
    const studentIds = enrollments.map(e => e.studentId.toString());
    // Lấy tất cả submission của assignment này trong term này
    const submissions = await Submission.find({ assignmentId, term: currentTerm }).lean();
    const submittedStudentIds = submissions.map(s => s.studentId.toString());
    // Đã nộp
    const studentsSubmitted = enrollments.filter(e => submittedStudentIds.includes(e.studentId.toString()));
    // Chưa nộp
    const studentsNotSubmitted = enrollments.filter(e => !submittedStudentIds.includes(e.studentId.toString()));
    // Lấy thông tin user cho cả hai nhóm
    const [submittedUsers, notSubmittedUsers] = await Promise.all([
      User.find({ _id: { $in: studentsSubmitted.map(e => e.studentId) } }).select('profile.fullName email').lean(),
      User.find({ _id: { $in: studentsNotSubmitted.map(e => e.studentId) } }).select('profile.fullName email').lean()
    ]);
    return res.status(200).json({
      success: true,
      data: {
        submitted: submittedUsers,
        notSubmitted: notSubmittedUsers
      }
    });
  } catch (err) {
    console.error('Error in getAssignmentSubmissionStatus:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// CHẤM ĐIỂM HỌC SINH CHƯA NỘP BÀI TỰ LUẬN
// Lưu ý: Chỉ tạo submission mới nếu học sinh chưa nộp bài. Nếu đã nộp, trả về lỗi, không ghi đè điểm.
// POST: /api/instructor/assignments/:assignmentId/grade-student
// body: { studentId, score, content (optional) }
const gradeStudentWithoutSubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { studentId, score, content } = req.body;
    if (!mongoose.Types.ObjectId.isValid(assignmentId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }
    if (typeof score !== 'number' || score < 0 || score > 10) {
      return res.status(400).json({ success: false, message: 'Score must be a number between 0 and 10' });
    }
    const assignment = await Assignment.findById(assignmentId).lean();
    if (!assignment || assignment.type !== 'essay') {
      return res.status(400).json({ success: false, message: 'Only essay assignments can be graded without submission.' });
    }
    const currentTerm = assignment.term[assignment.term.length - 1];
    // Kiểm tra đã có submission chưa
    const existing = await Submission.findOne({ assignmentId, studentId, term: currentTerm });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Student already has a submission for this assignment.' });
    }
    // Tạo submission mới với điểm số
    const newSubmission = new Submission({
      assignmentId,
      studentId,
      term: currentTerm,
      content: content || '',
      grade: { score: score, gradedAt: new Date(), graderId: req.user._id },
      submittedAt: new Date()
    });
    await newSubmission.save();
    return res.status(201).json({ success: true, message: 'Submission created and graded successfully', data: newSubmission });
  } catch (err) {
    console.error('Error in gradeStudentWithoutSubmission:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
    getSubmissionsForGrading,
    getSubmissionDetail,
    gradeSubmission,
    getAssignmentSubmissionStatus,
    gradeStudentWithoutSubmission
};