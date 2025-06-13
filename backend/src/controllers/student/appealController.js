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
exports.addAppealComment = async (req, res) => {
  try {
    const { submissionId, appealId } = req.params;
    const { userId, text } = req.body;

    // 1. Validate IDs and input
    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({ success: false, message: 'Invalid submissionId' });
    }
    if (!mongoose.Types.ObjectId.isValid(appealId)) {
      return res.status(400).json({ success: false, message: 'Invalid appealId' });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid userId' });
    }
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    // 2. Build the comment object
    const comment = {
      by: mongoose.Types.ObjectId(userId),
      text: text.trim(),
      at: new Date()
    };

    // 3. Use positional filtered update to push into the correct appeal
    const updated = await Submission.findOneAndUpdate(
      {
        _id: submissionId,
        'appeals.appealId': appealId
      },
      {
        $push: {
          'appeals.$.comments': comment
        }
      },
      {
        new: true,              // return the updated document
        projection: { appeals: 1 } // only need appeals back
      }
    ).lean();

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Submission or appeal not found'
      });
    }

    // 4. Extract the newly‐updated appeal from the array
    const theAppeal = updated.appeals.find(a => a.appealId.toString() === appealId);

    return res.status(201).json({
      success: true,
      data: theAppeal
    });
  } catch (err) {
    console.error('Error adding appeal comment:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};