
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

    const courses = await Course.find({ instructorId }).select('_id term').lean();
    if (courses.length === 0) {
      return res.json({ success: true, data: [] });
    }
    
    const courseTermMap = {};
    courses.forEach(c => {
        if (c.term && c.term.length > 0) {
            courseTermMap[c._id.toString()] = c.term[c.term.length - 1];
        }
    });
    const courseIds = Object.keys(courseTermMap).map(id => mongoose.Types.ObjectId(id));

    const appeals = await Submission.aggregate([
      { $unwind: '$appeals' },
      { $match: { 'appeals.status': 'open' } },
      { $lookup: { from: 'assignments', localField: 'assignmentId', foreignField: '_id', as: 'assignment' } },
      { $unwind: '$assignment' },
      { $match: { 'assignment.courseId': { $in: courseIds } } },
      
      // Custom logic to filter by term
      {
          $addFields: {
              courseIdStr: { $toString: "$assignment.courseId" }
          }
      },
      {
          $match: {
              $expr: {
                  $eq: [ "$term", { $arrayElemAt: [ { $ifNull: [ { $let: {
                      vars: { courseTerms: { $getField: { field: { $toString: "$assignment.courseId" }, input: courseTermMap } } },
                      in: "$$courseTerms"
                  } }, [] ] }, -1 ] } ]
              }
          }
      },

      { $lookup: { from: 'users', localField: 'studentId', foreignField: '_id', as: 'student' } },
      { $unwind: '$student' },
      {
        $project: {
          _id: 0,
          submissionId: '$_id',
          appealId: '$appeals.appealId',
          appealCreatedAt: '$appeals.createdAt',
          studentName: '$student.profile.fullName',
          assignmentTitle: '$assignment.title',
          originalScore: '$grade.score',
          studentComment: { $arrayElemAt: ['$appeals.comments.text', 0] }
        }
      },
      { $sort: { appealCreatedAt: -1 } }
    ]).allowDiskUse(true); // Added allowDiskUse for potentially large aggregations

    return res.status(200).json({ success: true, data: appeals });
  } catch (err) {
    // A more robust way to handle the aggregation error if the JS function is not supported
    if (err.codeName === 'QueryNotSupported') {
         console.error('Aggregation with JS function is not supported on this MongoDB version/tier. Falling back to less strict logic.');
         // Fallback logic (less strict, might show appeals from previous terms)
         const fallbackAppeals = await Submission.find({ 'appeals.status': 'open' })
            .populate({ path: 'assignmentId', match: { courseId: { $in: courses.map(c => c._id) } } })
            .populate('studentId', 'profile.fullName')
            .lean();
        const filteredFallback = fallbackAppeals.filter(s => s.assignmentId) // ensure assignment exists
            .map(s => s.appeals.map(a => ({
                submissionId: s._id,
                appealId: a.appealId,
                //... other fields
            }))).flat();
        return res.json({ success: true, data: filteredFallback, note: 'Fell back to simplified logic' });
    }
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