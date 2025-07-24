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
    
    // Tạo map courseId -> latest term
    const courseTermMap = {};
    courses.forEach(c => {
        if (c.term && c.term.length > 0) {
            courseTermMap[c._id.toString()] = c.term[c.term.length - 1];
        }
    });

    const appeals = await Submission.aggregate([
      { $unwind: '$appeals' },
      { $match: { 'appeals.status': 'open' } },
      
      // Lookup assignment
      { 
        $lookup: { 
          from: 'assignments', 
          localField: 'assignmentId', 
          foreignField: '_id', 
          as: 'assignment' 
        } 
      },
      { $unwind: '$assignment' },
      
      // Filter by courses that belong to instructor
      { 
        $match: { 
          'assignment.courseId': { 
            $in: courses.map(c => c._id) 
          } 
        } 
      },
      
      // Lookup course to get term information
      {
        $lookup: {
          from: 'courses',
          localField: 'assignment.courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      
      // Add field for latest term of the course
      {
        $addFields: {
          latestCourseTerm: {
            $cond: {
              if: { $and: [{ $isArray: '$course.term' }, { $gt: [{ $size: '$course.term' }, 0] }] },
              then: { $arrayElemAt: ['$course.term', -1] },
              else: null
            }
          }
        }
      },
      
      // Filter by matching term (only if both submission.term and course latest term exist)
      {
        $match: {
          $or: [
            { term: { $exists: false } }, // No term filtering if submission doesn't have term
            { latestCourseTerm: null }, // No term filtering if course doesn't have term
            { $expr: { $eq: ['$term', '$latestCourseTerm'] } } // Match terms
          ]
        }
      },

      // Lookup student information
      { 
        $lookup: { 
          from: 'users', 
          localField: 'studentId', 
          foreignField: '_id', 
          as: 'student' 
        } 
      },
      { $unwind: '$student' },
      
      // Project final result
      {
        $project: {
          _id: 0,
          submissionId: '$_id',
          appealId: '$appeals.appealId',
          appealCreatedAt: '$appeals.createdAt',
          studentName: '$student.profile.fullName',
          assignmentTitle: '$assignment.title',
          originalScore: '$grade.score',
          studentComment: { 
            $cond: {
              if: { $and: [{ $isArray: '$appeals.comments' }, { $gt: [{ $size: '$appeals.comments' }, 0] }] },
              then: { $arrayElemAt: ['$appeals.comments.text', 0] },
              else: null
            }
          },
          term: '$term',
          courseTerm: '$latestCourseTerm'
        }
      },
      { $sort: { appealCreatedAt: -1 } }
    ]).allowDiskUse(true);

    return res.status(200).json({ success: true, data: appeals });
    
  } catch (err) {
    console.error('Error in listOpenAppeals:', err);
    
    // Fallback to simpler approach if aggregation fails
    try {
      const courseIds = courses.map(c => c._id);
      
      const submissions = await Submission.find({
        'appeals.status': 'open'
      })
      .populate({
        path: 'assignmentId',
        match: { courseId: { $in: courseIds } },
        populate: {
          path: 'courseId',
          select: 'term'
        }
      })
      .populate('studentId', 'profile.fullName')
      .lean();

      const appeals = [];
      
      submissions.forEach(submission => {
        if (!submission.assignmentId) return; // Skip if assignment not found
        
        const course = submission.assignmentId.courseId;
        const latestCourseTerm = course && course.term && course.term.length > 0 
          ? course.term[course.term.length - 1] 
          : null;
        
        // Filter by term if both exist
        if (submission.term && latestCourseTerm && submission.term !== latestCourseTerm) {
          return;
        }
        
        submission.appeals.forEach(appeal => {
          if (appeal.status === 'open') {
            appeals.push({
              submissionId: submission._id,
              appealId: appeal.appealId,
              appealCreatedAt: appeal.createdAt,
              studentName: submission.studentId?.profile?.fullName,
              assignmentTitle: submission.assignmentId?.title,
              originalScore: submission.grade?.score,
              studentComment: appeal.comments && appeal.comments.length > 0 
                ? appeal.comments[0].text 
                : null
            });
          }
        });
      });
      
      // Sort by creation date
      appeals.sort((a, b) => new Date(b.appealCreatedAt) - new Date(a.appealCreatedAt));
      
      return res.status(200).json({ 
        success: true, 
        data: appeals,
        note: 'Used fallback query due to aggregation error'
      });
      
    } catch (fallbackErr) {
      console.error('Fallback query also failed:', fallbackErr);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
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