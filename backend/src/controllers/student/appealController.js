// controllers/student/appealController.js
const mongoose = require('mongoose');
const Submission = require('../../models/Submission');
const Assignment = require('../../models/Assignment');
const Course     = require('../../models/Course');
const Subject    = require('../../models/Subject');
const User       = require('../../models/User');

exports.getAppealsByStudent = async (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res
        .status(400)
        .json({ success: false, message: 'Query parameter "studentId" is required and must be valid.' });
    }

    // Aggregation pipeline:
    // 1. Lọc submissions của student
    // 2. Unwind appeals
    // 3. Lookup assignment để lấy courseId
    // 4. Lookup course để lấy subjectId, course title
    // 5. Lookup subject để lấy subject name
    // 6. Project các trường cần thiết
    const results = await Submission.aggregate([
      // Chỉ lấy submission của student
      { $match:  { studentId: new mongoose.Types.ObjectId(studentId) } },
      // Unwind mảng appeals
      { $unwind: { path: '$appeals' } },
      // Lookup assignment
      {
        $lookup: {
          from: 'assignments',
          localField: 'assignmentId',
          foreignField: '_id',
          as: 'assignment'
        }
      },
      { $unwind: { path: '$assignment', preserveNullAndEmptyArrays: true } },
      // Lookup course từ assignment.courseId
      {
        $lookup: {
          from: 'courses',
          localField: 'assignment.courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
      // Lookup subject từ course.subjectId
      {
        $lookup: {
          from: 'subjects',
          localField: 'course.subjectId',
          foreignField: '_id',
          as: 'subject'
        }
      },
      { $unwind: { path: '$subject', preserveNullAndEmptyArrays: true } },
      // Lookup user để lấy student fullName (nếu cần)
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
      // Project các trường cần hiển thị
      {
        $project: {
          _id: 0,
          appealId: '$appeals.appealId',
          appealCreatedAt: '$appeals.createdAt',
          appealStatus: '$appeals.status',
          appealComments: '$appeals.comments',
          submissionId: '$_id',
          gradeScore: '$grade.score',
          assignmentId: '$assignment._id',
          assignmentTitle: '$assignment.title',
          courseId: '$course._id',
          courseTitle: '$course.title',
          subjectId: '$subject._id',
          subjectName: '$subject.name',
          studentName: '$student.profile.fullName'
        }
      },
      // (Tùy chọn) sort theo appealCreatedAt giảm dần
      { $sort: { appealCreatedAt: -1 } }
    ]);

    return res.json({ success: true, data: results });
  } catch (err) {
    console.error('Error in getAppealsByStudent:', err);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving appeals'
    });
  }
};
