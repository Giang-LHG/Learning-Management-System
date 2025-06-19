const mongoose    = require('mongoose');
const User        = require('../../models/User');
const Enrollment  = require('../../models/Enrollment');
const Submission  = require('../../models/Submission');
const Assignment  = require('../../models/Assignment');
const Course      = require('../../models/Course');

exports.getParentStats = async (req, res) => {
  try {
    const { parentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      return res.status(400).json({ success: false, message: 'Invalid parentId' });
    }

    // 1. Kiểm tra parentId có phải là parent không
    const parent = await User.findById(parentId).lean();
    if (!parent || parent.role !== 'parent') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // 2. Tìm tất cả học sinh có parentIds chứa parentId
    const students = await User.find({
      role: 'student',
      'profile.parentIds': new mongoose.Types.ObjectId(parentId)
    }).select('_id profile.fullName').lean();

    const stats = await Promise.all(students.map(async (stu) => {
      const studentId = stu._id;

      // A. Lấy enrollments của học sinh
      const enrolls = await Enrollment.find({ studentId }).lean();

      // B. Lấy submissions của học sinh
      const submissions = await Submission.find({ studentId })
        .select('assignmentId grade.term grade.score term')
        .lean();

      // C. Lấy tất cả assignment để tính tỷ lệ
      //    (có thể giới hạn theo term nếu muốn)
      const assignments = await Assignment.find({})
        .select('_id term')
        .lean();

      // D. Tính tổng số khóa học
      const totalCourses = enrolls.length;

      // E. Tính điểm trung bình:
      const gradedSubs = submissions.filter(s => s.grade && s.grade.score != null);
      const avgGrade = gradedSubs.length
        ? (gradedSubs.reduce((sum, s) => sum + s.grade.score, 0) / gradedSubs.length)
        : null;

      // F. Tỷ lệ hoàn thành assignment:
      //    Số assignment mà học sinh đã nộp và chấm điểm / tổng assignment
      const completedCount = gradedSubs.length;
      const totalAssignCount = assignments.length;
      const completionRate = totalAssignCount
        ? (completedCount / totalAssignCount * 100).toFixed(1) + '%'
        : 'N/A';

      // G. Thống kê theo term (nếu muốn):
      const byTerm = {};
      enrolls.forEach(e => {
        const t = e.term;
        if (!byTerm[t]) byTerm[t] = { courses: 0, subs: 0, avgGrade: null };
        byTerm[t].courses++;
      });
      submissions.forEach(s => {
        const t = s.term;
        if (!byTerm[t]) byTerm[t] = { courses: 0, subs: 0, avgGrade: null };
        byTerm[t].subs++;
      });
      // Tính avgGrade theo term
      Object.keys(byTerm).forEach(t => {
        const subsOfT = gradedSubs.filter(s => s.term === t);
        byTerm[t].avgGrade = subsOfT.length
          ? (subsOfT.reduce((sum, s) => sum + s.grade.score, 0) / subsOfT.length).toFixed(2)
          : null;
      });

      return {
        studentId,
        fullName: stu.profile.fullName,
        totalCourses,
        avgGrade,
        completionRate,
        byTerm
      };
    }));

    return res.json({ success: true, data: stats });
  } catch (err) {
    console.error('Error in getParentStats:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};