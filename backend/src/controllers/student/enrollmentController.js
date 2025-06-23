// controllers/student/enrollmentController.js
const mongoose = require('mongoose');
const Enrollment = require('../../models/Enrollment');
const Course = require('../../models/Course');
const Subject = require('../../models/Subject');
const Assignment = require('../../models/Assignment');
const Submission = require('../../models/Submission');
const User = require('../../models/User');
exports.enrollCourse = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
  console.log('req.body:', req.body);
    // 1. Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(courseId)
    ) {
      return res.status(400).json({ success: false, message: 'Invalid studentId or courseId' });
    }
const UserCheck = await User.findById(studentId).lean();
if (UserCheck.role !== 'student') {
  return res.status(404).json({ success: false, message: 'You are not a student' });
}
    // 2. Kiểm tra course tồn tại
   const course = await Course.findById(courseId).lean();
if (!course) {
  return res.status(404).json({ success: false, message: 'Course not found' });
}
const courseTerm = course.term[course.term.length - 1];
const now = Date.now();
const startMs = course.startDate ? new Date(course.startDate).getTime() : null;
const endMs   = course.endDate   ? new Date(course.endDate).getTime()   : null;

if (course.startDate && isNaN(startMs)) {
  return res
    .status(500)
    .json({ success: false, message: 'Invalid startDate format' });
}

if (course.endDate && isNaN(endMs)) {
  return res
    .status(500)
    .json({ success: false, message: 'Invalid endDate format' });
}

if (startMs !== null && now < startMs) {
  return res
    .status(400)
    .json({ success: false, message: `This course will open on ${new Date(startMs).toLocaleString()}.` });
}

if (endMs !== null && now > endMs) {
  return res
    .status(400)
    .json({ success: false, message: `This course closed on ${new Date(endMs).toLocaleString()}.` });
}
// Chỉ đánh giá là “already” khi có cùng courseId và cùng term
const already = await Enrollment.findOne({
  studentId,
  courseId,
  term: courseTerm
}).lean();



    // 3. Kiểm tra xem học sinh đã enroll chưa
  
    if (already) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    // 4. Lấy subject của khóa học để kiểm tra prerequisites
    const subject = await Subject.findById(course.subjectId).lean();
    if (!subject || subject.status !== 'approved') {
      return res
        .status(400)
        .json({ success: false, message: 'Subject not found or not approved' });
    }
    
const siblingCourses = await Course.find({ subjectId: subject._id })
  .select('_id')
  .lean();
const siblingIds = siblingCourses.map(c => c._id);
const hasEnrolledSibling = await Enrollment.exists({
  studentId,
  courseId: { $in: siblingIds }
});
if (hasEnrolledSibling) {
  const newEnrollment = await Enrollment.create({ studentId, courseId, enrolledAt: new Date(), term: courseTerm,subjectId:subject._id });
  return res.status(201).json({ success: true, data: newEnrollment });
}
    const prereqSubjectIds = subject.prerequisites || [];

    // 5. Nếu không có prerequisites, cho enroll luôn
    if (!prereqSubjectIds.length) {
      const newEnrollment = new Enrollment({ studentId, courseId, enrolledAt: new Date(), term: courseTerm ,subjectId:subject._id});
      await newEnrollment.save();
      return res.status(201).json({ success: true, data: newEnrollment });
    }

    
      // 6. Với mỗi subjectId trong danh sách prerequisites
    for (let prereqSubjId of prereqSubjectIds) {
      // 6.1. Tìm tất cả các enrollment của sinh viên
      //      và chọn enrollment gần nhất mà thuộc subject này
      const enrolls = await Enrollment.find({ studentId })
        .sort({ enrolledAt: -1 })
        .lean();

      let latestEnroll = null;
      for (let e of enrolls) {
        const c = await Course.findById(e.courseId).select('subjectId term').lean();
        if (c && c.subjectId.toString() === prereqSubjId.toString()) {
          latestEnroll = e;
          break;
        }
      }
      if (!latestEnroll) {
        const ms = await Subject.findById(prereqSubjId).select('name').lean();
        return res.status(400).json({
          success: false,
          message: `Bạn phải đăng ký ít nhất một khóa trong môn "${ms.name}" trước khi đăng ký khóa mới.`
        });
      }

      // 6.2. Xác định term của enrollment đó
      const prereqTerm = latestEnroll.term;

  // 6.3. Lấy tất cả assignment trong term đó
const assignments = await Assignment.find({
  term: { $in: [prereqTerm] }  // <-- dùng $in để match phần tử trong mảng
})
  .select('_id courseId')
  .lean();

      const filteredAids = [];
      for (let a of assignments) {
        const c = await Course.findById(a.courseId).select('subjectId').lean();
        if (c && c.subjectId.toString() === prereqSubjId.toString()) {
          filteredAids.push(a._id);
        }
      }
      if (!filteredAids.length) {
        // nếu không có assignment nào cần kiểm tra  bỏ qua subject này
        continue;
      }

      // 6.4. Với mỗi assignmentId, kiểm tra submission có graded không
    for (let aid of filteredAids) {
  const sub = await Submission.findOne({
    assignmentId: aid,
    studentId,
    term: prereqTerm   // đây vẫn là string
  })
    .select('grade.score')
    .lean();

  if (!sub || sub.grade.score == null) {
    const ms = await Subject.findById(prereqSubjId).select('name').lean();
    return res.status(400).json({
      success: false,
      message: `Bạn phải nộp và được chấm hết tất cả assignments của môn "${ms.name}" (học kỳ ${prereqTerm}) trước khi đăng ký.`
    });
  }
}
    }
  

    // 7. Nếu đã vượt qua tất cả điều kiện prerequisite, tạo enrollment
    const newEnrollment = new Enrollment({ studentId, courseId, enrolledAt: new Date(),term:course.term,subjectId:subject._id });
    await newEnrollment.save();
    return res.status(201).json({ success: true, data: newEnrollment });
  } catch (err) {
    console.error('Error in enrollCourse:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
exports.searchEnrollments = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res
        .status(400)
        .json({ success: false, message: 'Query parameter "q" is required' });
    }
    const regex = new RegExp(q, 'i');

    // Sử dụng aggregation để lookup details course và lọc theo title chứa keyword
    const results = await Enrollment.aggregate([
      {
        $lookup: {
          from: 'courses',           // tên collection courses trong MongoDB
          localField: 'courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      // Lọc course.title hoặc course.description chứa regex
      {
        $match: {
          'course.title': { $regex: regex }
        }
      },

      {
        $project: {
          studentId: 1,
          course: 1,
          enrolledAt: 1,
          status: 1
        }
      }
    ]);

    return res.json({ success: true, data: results });
  } catch (err) {
    console.error('Error in searchEnrollments:', err);
    return res.status(500).json({ success: false, message: 'Error searching enrollments' });
  }
};
exports.getEnrollments = async (req, res) => {
  try {
    const { studentId, courseId } = req.query;

    // 1. Validate studentId
    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "studentId" is required and must be a valid ObjectId.'
      });
    }

    // 2. Build filter
    const filter = { studentId: new mongoose.Types.ObjectId(studentId) };
    if (courseId) {
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({
          success: false,
          message: 'If provided, "courseId" must be a valid ObjectId.'
        });
      }
      filter.courseId = new mongoose.Types.ObjectId(courseId);
    }

    // 3. Query enrollments, populate course term, sort by date desc
    const enrollments = await Enrollment.find(filter)
      .populate('courseId', 'term')   // chỉ lấy trường `term` từ Course
      .sort({ enrolledAt: -1 })
      .lean();

    // 4. Return
    return res.json({ success: true, data: enrollments });
  } catch (err) {
    console.error('Error in getEnrollments:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching enrollments.'
    });
  }
};