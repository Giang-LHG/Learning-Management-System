// controllers/instructor/appealController.js
const mongoose = require('mongoose');
const Submission = require('../../models/Submission');
const Course = require('../../models/Course');

exports.listOpenAppeals = async (req, res) => {
  try {
    const { instructorId } = req.query;
    if (!mongoose.Types.ObjectId.isValid(instructorId)) {
      return res.status(400).json({ success: false, message: 'Invalid instructorId' });
    }

    // Lấy danh sách course của instructor
    const courses = await Course.find({ instructorId }).select('_id').lean();
    if (courses.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const courseIds = courses.map(c => c._id);

    // Aggregation để lấy các open appeals của các assignment thuộc các course đó
const appeals = await Submission.aggregate([
  { $unwind: '$appeals' },
  { $match: { 'appeals.status': 'open' } },

  {
    $lookup: {
      from: 'assignments',
      localField: 'assignmentId',
      foreignField: '_id',
      as: 'assignment'
    }
  },
  { $unwind: '$assignment' },

  {
    $match: {
      'assignment.courseId': { $in: courseIds }
    }
  },

  {
    $lookup: {
      from: 'users',
      localField: 'studentId',
      foreignField: '_id',
      as: 'student'
    }
  },
  { $unwind: '$student' },

  {
    $project: {
      _id: 0,
      submissionId: '$_id',
      appealId: '$appeals.appealId',
      appealCreatedAt: '$appeals.createdAt',
      studentName: '$student.profile.fullName',
      assignmentTitle: '$assignment.title',
      assigmentDescription: '$assignment.description',
      originalScore: '$grade.score',

      content: '$content',

      // ===== answers đã được đánh số 1,2,3... =====
      answers: {
        $map: {
          input: { $range: [0, { $size: { $ifNull: ['$answers', []] } }] },
          as: 'idx',
          in: {
            index: { $add: ['$$idx', 1] },
            questionId: { $arrayElemAt: ['$answers.questionId', '$$idx'] },
            selectedOption: { $arrayElemAt: ['$answers.selectedOption', '$$idx'] }
          }
        }
      },

      // ===== Thêm danh sách câu hỏi + correctAnswer + points (+ đáp án SV) =====
      questions: {
        $map: {
          input: { $range: [0, { $size: { $ifNull: ['$assignment.questions', []] } }] },
          as: 'qIdx',
          in: {
            index: { $add: ['$$qIdx', 1] },
            questionId: { $arrayElemAt: ['$assignment.questions.questionId', '$$qIdx'] },
            text: { $arrayElemAt: ['$assignment.questions.text', '$$qIdx'] },
            options: { $arrayElemAt: ['$assignment.questions.options', '$$qIdx'] },
            correctAnswer: { $arrayElemAt: ['$assignment.questions.correctOption', '$$qIdx'] },
            points: { $arrayElemAt: ['$assignment.questions.points', '$$qIdx'] },

            // (tuỳ chọn) gắn luôn đáp án sinh viên đã chọn cho câu hỏi này
            studentSelectedOption: {
              $let: {
                vars: {
                  qid: { $arrayElemAt: ['$assignment.questions.questionId', '$$qIdx'] },
                  matchedAnswer: {
                    $first: {
                      $filter: {
                        input: { $ifNull: ['$answers', []] },
                        as: 'a',
                        cond: { $eq: ['$$a.questionId', { $arrayElemAt: ['$assignment.questions.questionId', '$$qIdx'] }] }
                      }
                    }
                  }
                },
                in: { $ifNull: ['$$matchedAnswer.selectedOption', null] }
              }
            }
          }
        }
      },

      studentComment: {
        $cond: {
          if: {
            $and: [
              { $isArray: '$appeals.comments' },
              { $gt: [{ $size: '$appeals.comments' }, 0] }
            ]
          },
          then: { $arrayElemAt: ['$appeals.comments.text', 0] },
          else: null
        }
      }
    }
  },

  { $sort: { appealCreatedAt: -1 } }
]).allowDiskUse(true);

return res.status(200).json({ success: true, data: appeals });

  } catch (err) {
    console.error('Error in listOpenAppeals:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.resolveAppeal = async (req, res) => {
  try {
    const { submissionId, appealId } = req.params;
    const { newScore, commentText, instructorId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(submissionId) ||
      !mongoose.Types.ObjectId.isValid(appealId) ||
      !mongoose.Types.ObjectId.isValid(instructorId)
    ) {
      return res.status(400).json({ success: false, message: 'Invalid IDs provided' });
    }
    if (!commentText) {
        return res.status(400).json({ success: false, message: 'Instructor comment is required.' });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    const appeal = submission.appeals.find(a => a.appealId.toString() === appealId);
    if (!appeal) {
      return res.status(404).json({ success: false, message: 'Appeal not found' });
    }
    if (appeal.status === 'resolved') {
        return res.status(400).json({ success: false, message: 'This appeal has already been resolved.' });
    }

    appeal.comments.push({
      text: commentText,
      by: instructorId,
      at: new Date()
    });

    appeal.status = 'resolved';

    if (newScore !== null && newScore !== undefined) {
       if (typeof newScore !== 'number' || newScore < 0 || newScore > 10) {
        return res.status(400).json({ success: false, message: 'New score must be a number between 0 and 10.' });
       }
       submission.grade.score = newScore;
       submission.grade.gradedAt = new Date();
       submission.grade.graderId = instructorId;
    }
    
    await submission.save();

    return res.status(200).json({ success: true, message: 'Appeal resolved successfully', data: submission });

  } catch (err) {
    console.error('Error in resolveAppeal:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};