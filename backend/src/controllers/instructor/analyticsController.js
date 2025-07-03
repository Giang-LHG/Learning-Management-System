
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