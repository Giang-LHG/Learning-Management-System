const mongoose = require('mongoose');
const Assignment = require('../../models/Assignment');
const Submission = require('../../models/Submission');
const Course = require('../../models/Course');
/**
 * POST /submissions/submit
 * Cho học sinh nộp bài (essay hoặc quiz).
 * Body cần có: { studentId, assignmentId, content?, answers? }
 * Trước khi lưu, kiểm tra xem assignment.dueDate đã quá hạn chưa.
 */
exports.submitAssignment = async (req, res) => {
  try {
    const { studentId, assignmentId, content, answers } = req.body;

    // Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(assignmentId)
    ) {
      return res.status(400).json({ success: false, message: 'Invalid IDs' });
    }

    // Lấy assignment để kiểm tra tồn tại và deadline
    const assignment = await Assignment.findById(assignmentId).lean();
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Kiểm tra deadline
    if (new Date() > assignment.dueDate) {
      return res
        .status(400)
        .json({ success: false, message: 'Deadline has passed. Cannot submit.' });
    }

    // Tạo mới Submission
    const newSubmission = new Submission({
      assignmentId,
      studentId,
      submittedAt: new Date(),
      term: assignment.term,
      content: content || '',
      answers: answers || [] // chỉ dùng khi type === 'quiz'
    });

    await newSubmission.save();
    return res.status(201).json({ success: true, data: newSubmission });
  } catch (err) {
    console.error('Error in submitAssignment:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * (Tùy chọn) GET /submissions/assignment/:assignmentId
 * Trả về tất cả submissions cho một assignment (để instructor xem)
 */
exports.getSubmissionsByAssignment = async (req, res) => {
 try {
    const { assignmentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid assignmentId' });
    }

    // 1. Lấy term của assignment
    const asg = await Assignment.findById(assignmentId).select('term').lean();
    if (!asg) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    const { term: assignmentTerm } = asg;

    // 2. Tìm submissions có cùng assignmentId và cùng term
    const submissions = await Submission.find({
      assignmentId,
      term: assignmentTerm
    })
      .populate('studentId', 'profile.fullName email') // lấy thông tin student
      .lean();

    return res.status(200).json({ success: true, data: submissions });
  } catch (err) {
    console.error('Error in getSubmissionsByAssignment:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * (Tùy chọn) GET /submissions/student/:studentId
 * Trả về tất cả submissions của một student (để student kiểm tra lại)
 */
exports.getSubmissionsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid studentId' });
    }

    const submissions = await Submission.find({ studentId })
      .populate('assignmentId', 'title dueDate type')
      .lean();

    return res.status(200).json({ success: true, data: submissions });
  } catch (err) {
    console.error('Error in getSubmissionsByStudent:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
exports.resubmitSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { content, answers } = req.body; // content cho essay, answers cho quiz

    // 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({ success: false, message: 'Invalid submissionId' });
    }

    // 2. Tìm submission hiện tại
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // 3. Lấy assignment để kiểm tra deadline
    const assignment = await Assignment.findById(submission.assignmentId).select('dueDate type');
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    const now = new Date();
    if (now > assignment.dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Cannot resubmit: due date has passed'
      });
    }

    // 4. Cập nhật nội dung mới
    if (assignment.type === 'essay') {
      if (typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Please provide non-empty content for essay resubmission'
        });
      }
      submission.content = content.trim();
    } else if (assignment.type === 'quiz') {
      if (!Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide answers array for quiz resubmission'
        });
      }
      submission.answers = answers.map(ans => ({
        questionId: ans.questionId,
        selectedOption: ans.selectedOption
      }));
    }

    // 5. Đặt lại thời gian và xóa grade cũ
    submission.submittedAt = now;
    submission.grade = { score: null, gradedAt: null, graderId: null };

    await submission.save();

    return res.json({
      success: true,
      data: submission,
      message: 'Resubmission successful'
    });
  } catch (err) {
    console.error('Error in resubmitSubmission:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during resubmission'
    });
  }
};
exports.getSubmissionsByCourse = async (req, res) => {
   try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid courseId' });
    }
const courseRaw = await Course.findById(courseId).lean();

    // 1. Fetch all assignment IDs for this course
    const assignments = await Assignment.find({ courseId }).select('_id').lean();
    const assignmentIds = assignments.map(a => a._id);
    if (!assignmentIds.length) {
      return res.json({ success: true, data: [] });
    }

    // 2. Fetch submissions, with full assignment populated
 const submissionsRaw = await Submission.find({
  assignmentId: { $in: assignmentIds }
})
  .populate('assignmentId', 'title dueDate type questions')
  .populate('studentId', 'name profile.email')
  .lean();

// 3. Remap each submission
const submissions = submissionsRaw.map(sub => {
  const { assignmentId, studentId: popStudent, ...rest } = sub;
  return {
    ...rest,
    student: popStudent,     
    assignment: assignmentId
  };
});
    
    const now = new Date();

    // 3. Auto-grade any quiz submissions past dueDate without a grade
    await Promise.all(submissions.map(async s => {
      const asg = s.assignment;
      if (
        asg.type === 'quiz' &&
        now > new Date(asg.dueDate) &&
        (s.grade.score === null || s.grade.score === undefined)
      ) {
        // build answer map
        const answersMap = new Map(
          (s.answers || []).map(a => [a.questionId.toString(), a.selectedOption])
        );
        const totalQs = asg.questions.length || 1;
        let correctCount = 0;
        asg.questions.forEach(q => {
          if (answersMap.get(q.questionId.toString()) === q.correctOption) {
            correctCount++;
          }
        });
        // scale to 10
        const score = Math.round((correctCount / totalQs) * 10 * 100) / 100; 
        const gradedAt = now;

        // persist grade
        await Submission.findByIdAndUpdate(s._id, {
          'grade.score': score,
          'grade.gradedAt': gradedAt,
          'grade.graderId':  new mongoose.Types.ObjectId(courseRaw.instructorId)
        });

        // update in-memory for response
        s.grade.score    = score;
        s.grade.gradedAt = gradedAt;
      }
    }));

    // 4. Return
    res.json({ success: true, data: submissions });
  } catch (err) {
    console.error('Error fetching submissions by course:', err);
    res.status(500).json({ success: false, message: 'Error fetching submissions' });
  }
};
exports.getSubmissionById = async (req, res) => {
  try {
    const { submissionId } = req.params;

    // Kiểm tra submissionId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({ success: false, message: 'Invalid submissionId' });
    }

    // Tìm submission theo ID và populate các thông tin cần thiết
    const submission = await Submission.findById(submissionId)
      .populate('assignmentId')                     
      .populate('studentId', 'name profile.email')  
      .lean();

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // Trả về kết quả
    res.json({
      success: true,
      data: {
        ...submission,
        assignment: submission.assignmentId,
        student: submission.studentId
      }
    });
  } catch (err) {
    console.error('Error fetching submission by ID:', err);
    res.status(500).json({ success: false, message: 'Error fetching submission' });
  }
};
exports.addAppeal = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { studentId, text } = req.body;

    // 1. Validate IDs
    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({ success: false, message: 'Invalid submissionId' });
    }
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid userId' });
    }
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    // 2. Load submission
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // 3. Build new appeal entry
    const newAppeal = {
      // appealId and createdAt auto-generated by schema defaults
      status: 'open',
      comments: [
        {
          by: studentId,
          text: text.trim(),
          at: new Date()
        }
      ]
    };

    // 4. Push into appeals array
    submission.appeals.push(newAppeal);

    // 5. Save
    await submission.save();

    // 6. Respond with the newly created appeal (last element)
    const created = submission.appeals[submission.appeals.length - 1];
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('Error adding appeal:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};