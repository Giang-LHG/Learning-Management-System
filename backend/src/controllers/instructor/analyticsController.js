
// controllers/instructor/analyticsController.js
const mongoose = require('mongoose');
const Course = require('../../models/Course');
const Assignment = require('../../models/Assignment');
const Submission = require('../../models/Submission');
const Enrollment = require('../../models/Enrollment');
// Đảm bảo không có dòng require('.../Attendance') ở đây

/**
 * GET /analytics/course/:courseId
 * Lấy dữ liệu phân tích tổng hợp cho kỳ học HIỆN TẠI của một khóa học.
 */
exports.getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const courseObjectId = mongoose.Types.ObjectId(courseId);

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid courseId' });
    }

    const course = await Course.findById(courseId).lean();
    if (!course || !course.term || course.term.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found or has no active term.' });
    }
    const currentTerm = course.term[course.term.length - 1];

    const totalEnrolled = await Enrollment.countDocuments({ courseId, term: currentTerm });
    
    const assignments = await Assignment.find({ courseId, term: { $in: [currentTerm] } }).select('_id').lean();
    const assignmentIds = assignments.map(a => a._id);

    const submissionStats = await Submission.aggregate([
      { $match: { assignmentId: { $in: assignmentIds }, term: currentTerm } },
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          gradedSubmissions: {
            $sum: { $cond: [{ $ne: ['$grade.score', null] }, 1, 0] }
          },
          averageScore: { $avg: '$grade.score' }
        }
      }
    ]);
    
    const gradeDistribution = await Submission.aggregate([
        { $match: { assignmentId: { $in: assignmentIds }, term: currentTerm, 'grade.score': { $ne: null } } },
        {
            $bucket: {
                groupBy: "$grade.score",
                boundaries: [0, 5, 6.5, 8, 9, 10.1],
                default: "Other",
                output: { "count": { $sum: 1 } }
            }
        },
        {
            $project: {
                _id: 0,
                range: {
                    $switch: {
                        branches: [
                           { case: { $eq: [ "$_id", 0 ] }, then: "0 - 4.9 (Fail)" },
                           { case: { $eq: [ "$_id", 5 ] }, then: "5.0 - 6.4 (Average)" },
                           { case: { $eq: [ "$_id", 6.5 ] }, then: "6.5 - 7.9 (Good)" },
                           { case: { $eq: [ "$_id", 8 ] }, then: "8.0 - 8.9 (Very Good)" },
                           { case: { $eq: [ "$_id", 9 ] }, then: "9.0 - 10 (Excellent)" }
                        ]
                    }
                },
                count: "$count"
            }
        }
    ]);
    
    const totalAssignments = assignmentIds.length;
    const stats = submissionStats[0] || { totalSubmissions: 0, gradedSubmissions: 0, averageScore: 0 };
    const submissionRate = totalAssignments > 0 && totalEnrolled > 0 ? (stats.totalSubmissions / (totalAssignments * totalEnrolled)) * 100 : 0;
    
    const analyticsData = {
      courseTitle: `${course.title} - Term: ${currentTerm}`,
      totalStudents: totalEnrolled,
      totalAssignments,
      submissionSummary: {
        totalSubmissions: stats.totalSubmissions,
        gradedSubmissions: stats.gradedSubmissions,
        averageScore: stats.averageScore ? parseFloat(stats.averageScore.toFixed(2)) : 0,
        submissionRate: parseFloat(submissionRate.toFixed(2)),
      },
      gradeDistribution,
      // Đảm bảo không có trường attendanceSummary ở đây
    };

    res.status(200).json({ success: true, data: analyticsData });
  } catch (err) {
    console.error('Error getting course analytics:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /analytics/dashboard
 * Lấy dữ liệu dashboard tổng hợp cho instructor hiện tại
 */
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const instructorId = req.user._id;
    // Tổng số khóa học instructor đang dạy
    const courses = await Course.find({ instructorId }).lean();
    const courseIds = courses.map(c => c._id);

    // Tổng số học viên (unique, chỉ active, có studentId)
    const enrollments = await Enrollment.find({ courseId: { $in: courseIds }, status: 'active', studentId: { $ne: null } }).lean();
    const studentIds = Array.from(new Set(enrollments.map(e => e.studentId && e.studentId.toString()).filter(Boolean)));

    // Tổng số bài tập
    const assignments = await Assignment.find({ courseId: { $in: courseIds } }).lean();

    // Điểm trung bình tất cả khóa học
    const assignmentIds = assignments.map(a => a._id);
    const submissions = await Submission.find({ assignmentId: { $in: assignmentIds }, 'grade.score': { $ne: null } }).lean();
    let avgScore = 0;
    if (submissions.length > 0) {
      avgScore = submissions.reduce((sum, s) => sum + (s.grade.score || 0), 0) / submissions.length;
      avgScore = parseFloat(avgScore.toFixed(2));
    }

    // Danh sách khóa học instructor dạy (tên, số học viên, số chương, số bài tập)
    const courseList = await Promise.all(courses.map(async (course) => {
      const numStudents = Array.from(new Set(enrollments.filter(e => e.courseId.toString() === course._id.toString() && e.studentId).map(e => e.studentId.toString()))).length;
      const numAssignments = assignments.filter(a => a.courseId.toString() === course._id.toString()).length;
      return {
        _id: course._id,
        title: course.title,
        term: Array.isArray(course.term) ? course.term[course.term.length-1] : course.term,
        numStudents,
        numChapters: Array.isArray(course.modules) ? course.modules.length : 0,
        numAssignments
      };
    }));

    // Thống kê đăng ký theo tháng (6 tháng gần nhất)
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: `Tháng ${d.getMonth() + 1}`,
        year: d.getFullYear(),
        month: d.getMonth() + 1
      });
    }
    const monthlyStats = months.map(m => {
      const count = enrollments.filter(e => {
        const date = new Date(e.createdAt);
        return date.getFullYear() === m.year && date.getMonth() + 1 === m.month;
      }).length;
      return { label: m.label, count };
    });

    // Phân bố điểm số
    const gradeDist = { A: 0, B: 0, C: 0, D: 0 };
    submissions.forEach(s => {
      const score = s.grade.score;
      if (score >= 8) gradeDist.A++;
      else if (score >= 6.5) gradeDist.B++;
      else if (score >= 5) gradeDist.C++;
      else gradeDist.D++;
    });

    res.json({
      success: true,
      data: {
        totalCourses: courses.length,
        totalStudents: studentIds.length,
        totalAssignments: assignments.length,
        averageScore: avgScore,
        courseList,
        monthlyStats,
        gradeDistribution: gradeDist
      }
    });
  } catch (err) {
    console.error('Error getting instructor dashboard analytics:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};