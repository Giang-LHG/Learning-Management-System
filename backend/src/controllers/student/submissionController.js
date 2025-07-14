const mongoose = require('mongoose');
const Assignment = require('../../models/Assignment');
const Submission = require('../../models/Submission');
const Course = require('../../models/Course');
const Notification = require('../../models/Notification');
const User = require('../../models/User')
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
      return res.status(400).json({ success: false, message: 'Mã không đúng' });
    }

    // Lấy assignment để kiểm tra tồn tại và deadline
    const assignment = await Assignment.findById(assignmentId).lean();
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });
    }

    // Kiểm tra deadline
    if (new Date() > assignment.dueDate) {
      return res
        .status(400)
        .json({ success: false, message: 'Quá hạn. Không thể nộp.' });
    }

    // Tạo mới Submission
    const newSubmission = new Submission({
      assignmentId,
      studentId,
      submittedAt: new Date(),
      term: assignment.term[assignment.term.length-1],
      content: content || '',
      answers: answers || [] // chỉ dùng khi type === 'quiz'
    });
const user = await User.findById(studentId);
    await newSubmission.save();
       const course = await Course.findById(assignment.courseId).select(' title instructorId').lean();
    if (course?.instructorId) {
      await Notification.create({
        toUserId: course.instructorId,
        type: 'newSubmission',
        payload: {
          text: `Bài nộp mới ở bài tập ${assignment.title} ở khóa học ${course.title} từ học sinh ${user.profile.fullName}`,  
         
        }
      });
    }

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

  // 1. Lấy mảng term của assignment
  const asg = await Assignment.findById(assignmentId).select('term').lean();
  if (!asg || !asg.term || !asg.term.length) {
    return res.status(404).json({ success: false, message: 'Assignment not found or no term info' });
  }

  // 👉 Lấy term mới nhất (phần tử cuối cùng trong mảng)
  const latestTerm = asg.term[asg.term.length - 1];

  // 2. Tìm submissions có cùng assignmentId và cùng term mới nhất
  const submissions = await Submission.find({
    assignmentId,
    term: latestTerm
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

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({ success: false, message: 'Mã bài nộp không đúng' });
    }

    // Tìm submission hiện tại
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Không thấy bài nộp' });
    }

    //  Lấy assignment để kiểm tra deadline
    const assignment = await Assignment.findById(submission.assignmentId).select('dueDate type');
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });
    }
    const now = new Date();
    if (now > assignment.dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Không thể nộp lại: đã quá hạn'
      });
    }

    //  Cập nhật nội dung mới
    if (assignment.type === 'essay') {
      if (typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng không nộp bài tập trống'
        });
      }
      submission.content = content.trim();
    } else if (assignment.type === 'quiz') {
      if (!Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp câu trả lời'
        });
      }
      submission.answers = answers.map(ans => ({
        questionId: ans.questionId,
        selectedOption: ans.selectedOption
      }));
    }

    //  Đặt lại thời gian và xóa grade cũ
    submission.submittedAt = now;
    submission.grade = { score: null, gradedAt: null, graderId: null };

    await submission.save();

    return res.json({
      success: true,
      data: submission,
      message: 'Nộp lại thành thông'
    });
  } catch (err) {
    console.error('Lỗi khi nộp bài:', err);
    return res.status(500).json({
      success: false,
      message: 'Hệ thống lỗi khi nộp lại'
    });
  }
};
exports.getSubmissionsByCourse = async (req, res) => {
   try {
    const { courseId,studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid courseId' });
    }
const courseRaw = await Course.findById(courseId).lean();

    const assignments = await Assignment.find({ courseId }).select('_id').lean();
    const assignmentIds = assignments.map(a => a._id);
    if (!assignmentIds.length) {
      return res.json({ success: true, data: [] });
    }

 const submissionsRaw = await Submission.find({
  assignmentId: { $in: assignmentIds },
  studentId:{$in:studentId}
})
  .populate('assignmentId', 'title dueDate type questions')
  .populate('studentId', 'name profile.email')
  .lean();

const submissions = submissionsRaw.map(sub => {
  const { assignmentId, studentId: popStudent, ...rest } = sub;
  return {
    ...rest,
    student: popStudent,     
    assignment: assignmentId
  };
});
    
    const now = new Date();

   await Promise.all(submissions.map(async s => {
  const asg = s.assignment;
  const assignmentTerms      = Array.isArray(asg.term) ? asg.term : [];
const latestAssignmentTerm = assignmentTerms.length
  ? assignmentTerms[assignmentTerms.length - 1]
  : null;
  if (
    asg.type === 'quiz' &&
    now > new Date(asg.dueDate||s.term !== latestAssignmentTerm ) &&
    (s.grade.score === null || s.grade.score === undefined)
  ) {
    const answersMap = new Map(
      (s.answers || []).map(a => [a.questionId.toString(), a.selectedOption])
    );

    // Tính tổng điểm của bài và tổng điểm đúng
    let totalPoints   = 0;
    let correctPoints = 0;

    asg.questions.forEach(q => {
      const pts = q.points || 0;
      totalPoints   += pts;
      if (answersMap.get(q.questionId.toString()) === q.correctOption) {
        correctPoints += pts;
      }
    });

    const rawScore = totalPoints > 0 ? (correctPoints / totalPoints) * 10 : 0;
    const score    = Math.round(rawScore * 100) / 100;
    const gradedAt = now;

    await Submission.findByIdAndUpdate(s._id, {
      'grade.score': score,
      'grade.gradedAt': gradedAt,
      'grade.graderId': new mongoose.Types.ObjectId(courseRaw.instructorId)
    });

    s.grade.score    = score;
    s.grade.gradedAt = gradedAt;
  }
}));

const courseTerms = Array.isArray(courseRaw.term) ? courseRaw.term : [];
    const latestCourseTerm = courseTerms.length
      ? courseTerms[courseTerms.length - 1]
      : null;

    const onTermSubmissions = [];
    const preTermSubmissions = [];

    for (let s of submissions) {
      // mỗi submission lưu trường `term`
      if (s.term === latestCourseTerm) {
        onTermSubmissions.push(s);
      } else {
        preTermSubmissions.push(s);
      }
    }
    res.json({ success: true, data: onTermSubmissions, preTermSubmissions });
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
    res.status(500).json({ success: false, message: 'Lỗi lấy bài nộp' });
  }
};
exports.addAppeal = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { studentId, text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({ success: false, message: 'Mã bài nộp không đúng' });
    }
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'Mã người dùng không đúng' });
    }
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, message: 'BÌnh luận không trống' });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Bài nộp không thấy' });
    }

    const newAppeal = {
      status: 'open',
      comments: [
        {
          by: studentId,
          text: text.trim(),
          at: new Date()
        }
      ]
    };
const user = await User.findById(studentId);
    submission.appeals.push(newAppeal);
const assignment = await Assignment.findById(submission.assignmentId).lean();
    const course     = await Course.findById(assignment.courseId).select(' title instructorId').lean();
    if (course?.instructorId) {
      await Notification.create({
        toUserId: course.instructorId,
        type: 'reportReady',       // hoặc type khác nếu phù hợp
        payload: {
          text:`Có đơn phúc khảo mới cho bài nộp mã : ${submission._id} bài tập ${assignment.title} ở khóa học ${course.title} từ học sinh  ${user.profile.fullName}`
 
         
        }
      });
    }

    await submission.save();

    const created = submission.appeals[submission.appeals.length - 1];
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('Error adding appeal:', err);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};