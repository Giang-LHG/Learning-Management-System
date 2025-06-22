
// controllers/instructor/submissionController.js
const mongoose = require('mongoose');
const Submission = require('../../models/Submission');
const Assignment = require('../../models/Assignment');

// Định nghĩa các hàm controller
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
      .populate({
        path: 'assignmentId',
        select: 'title type questions'
      })
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
    const { score, instructorId } = req.body;

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

    submission.grade = {
      score: score,
      gradedAt: new Date(),
      graderId: instructorId
    };
    
    await submission.save();

    return res.status(200).json({ success: true, message: 'Submission graded successfully', data: submission });
  } catch (err) {
    console.error('Error in gradeSubmission:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Export tất cả các hàm trong một object duy nhất
module.exports = {
    getSubmissionsForGrading,
    getSubmissionDetail,
    gradeSubmission
};