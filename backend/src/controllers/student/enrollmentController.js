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
  const newEnrollment = await Enrollment.create({ studentId, courseId, enrolledAt: new Date(), term: courseTerm,subjectId:subject._id ,studiedLessons:[] });
  return res.status(201).json({ success: true, data: newEnrollment });
}
    const prereqSubjectIds = subject.prerequisites || [];

    // 5. Nếu không có prerequisites, cho enroll luôn
    if (!prereqSubjectIds.length) {
      const newEnrollment = new Enrollment({ studentId, courseId, enrolledAt: new Date(), term: courseTerm ,subjectId:subject._id,studiedLessons:[] });
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
// Lấy term cuối cùng của course để so sánh

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
          message: `You must register for the subject courses "${ms.name}" before registering new key`
        });
      }
      const courseDoc = await Course.findById(latestEnroll.courseId).select('term endDate').lean();
const courseTerms = Array.isArray(courseDoc.term) ? courseDoc.term : [];
const lastCourseTerm = courseTerms[courseTerms.length - 1];
if (latestEnroll.term === lastCourseTerm) {
  // và vẫn còn trong khoảng thời gian khóa chưa kết thúc
  if (courseDoc.endDate && new Date() <= new Date(courseDoc.endDate)) {
    const ms = await Subject.findById(prereqSubjId).select('name').lean();
    return res.status(400).json({
      success: false,
      message: `You are still enrolled in semester ${lastCourseTerm} of course "${ms.name}" (until ${new Date(courseDoc.endDate).toLocaleDateString()}) so you cannot continue registering.`
    });
  }
}
      // 6.2. Xác định term của enrollment đó
      const prereqTerm = latestEnroll.term;

  // 6.3. Lấy tất cả assignment trong term đó
const assignments = await Assignment.find({
  term: { $in: [prereqTerm] }
})
  .select('_id courseId term')
  .lean();
console.log('assignments', assignments.length);
// chỉ giữ mỗi assignmentId một lần
const uniqueAids = Array.from(new Set(assignments.map(a => a._id.toString())));

const filteredAids = [];
for (let aidStr of uniqueAids) {
  const aid = new mongoose.Types.ObjectId(aidStr);
  const a = assignments.find(x => x._id.toString() === aidStr);
 
  const c = await Course.findById(a.courseId).select('subjectId credits').lean();
  if (c && c.subjectId.toString() === prereqSubjId.toString()) {
    filteredAids.push({ assignmentId: aid, credits: c.credits || 0 , courseId: a.courseId});
  }
}
if(!filteredAids.length){
  const ms = await Subject.findById(prereqSubjId).select('name').lean();
  return res.status(400).json({
    success: false,
    message: `You must register for the subject courses "${ms.name}" before registering new key`
  });
}

// 6.4. Tính điểm trung bình weighted từng course rồi tổng thành điểm subject
let weightedSum = 0;
let creditSum   = 0;

// gom grouped by courseId
const byCourse = filteredAids.reduce((acc, { assignmentId, credits }) => {
  if (!acc[credits]) acc[credits] = [];
  acc[credits].push(assignmentId);
  return acc;
}, {});

// nhưng ta cần theo từng khóa: rebuild map khóa  [aids] + credits
const courseMap = {};
filteredAids.forEach(({ assignmentId,courseId, credits }) => {
  const key = courseId.toString(); 
  if (!courseMap[key]) {
    courseMap[key] = { aids: [], credits };
  }
  courseMap[key].aids.push(assignmentId);
});
for (let [key, { aids, credits }] of Object.entries(courseMap)) {
  console.log(`Course ${key} - Aids: ${aids?.length}, Credits: ${credits}`);
}
// tính cho mỗi course
for (let { aids, credits } of Object.values(courseMap)) {
  
  // lấy submissions (có graded hay không) cho mỗi assignment
  const subs = await Submission.find({
    assignmentId: { $in: aids },
    studentId:new mongoose.Types.ObjectId(studentId),
    term: prereqTerm
  })
    .select('grade.score assignmentId')
    .lean();

  // nếu không có submission nào, coi như tất cả 0 điểm
  const scores = aids.map(aid => {
    const s = subs.find(x =>  x.assignmentId && x.assignmentId.toString() === aid.toString());
    return s && s.grade && s.grade.score != null ? s.grade.score : 0;
  });
  const avgCourse = scores.reduce((sum, v) => sum + v, 0) / scores.length;
  console.log('avgCourse', avgCourse);
  weightedSum += avgCourse * credits;
  creditSum   += credits;
}
const subjectAvg = creditSum ? weightedSum / creditSum : 0;
if (subjectAvg <= 4) {
  const ms = await Subject.findById(prereqSubjId).select('name').lean();
  return res.status(400).json({
    success: false,
    message: `Average subject "${ms.name}" (term ${prereqTerm}) need > 4 newly registered.`
  });
}

}

    // 7. Nếu đã vượt qua tất cả điều kiện prerequisite, tạo enrollment
    const newEnrollment = new Enrollment({ studentId, courseId, enrolledAt: new Date(),term:courseTerm,subjectId:subject._id,studiedLessons:[] });
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
exports.addStudiedLesson = async (req, res) => {
  try {
    let { studentId, courseId, term, lessonId } = req.body;

    if (![studentId, courseId, term, lessonId].every(Boolean)) {
      return res.status(400).json({ success: false, message: 'Missing parameters' });
    }

    if (
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(courseId) ||
      !mongoose.Types.ObjectId.isValid(lessonId)
    ) {
      return res.status(400).json({ success: false, message: 'Invalid ObjectId format' });
    }

    studentId = new mongoose.Types.ObjectId(studentId);
    courseId = new mongoose.Types.ObjectId(courseId);
    lessonId = new mongoose.Types.ObjectId(lessonId);
    term = term.trim(); 
    const filter = { studentId, courseId, term };

    const update = {
      $addToSet: { studiedLessons: lessonId }
    };
console.log('📌 Filter about to query:', {
  studentId: studentId.toString(),
  courseId: courseId.toString(),
  term
});

const exists = await Enrollment.findOne({ studentId, courseId, term }).lean();
console.log('📋 Enrollment found manually:', exists);
    const enrollment = await Enrollment.findOneAndUpdate(
      filter,
      update,
      { new: true } 
    ).lean();

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found with given studentId, courseId, term' });
    }

    return res.json({ success: true, data: enrollment });
  } catch (err) {
    console.error('Error in addStudiedLesson:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
exports.getStudiedLessons = async (req, res) => {
  try {
    const { studentId, courseId, term } = req.query;
    if (![studentId, courseId, term].every(Boolean) ||
        !mongoose.Types.ObjectId.isValid(studentId) ||
        !mongoose.Types.ObjectId.isValid(courseId)
    ) {
      return res.status(400).json({ success: false, message: 'Invalid query parameters' });
    }

    const enrollment = await Enrollment.findOne({
      studentId,
      courseId,
      term
    })
    .select('studiedLessons -_id')
    .lean();

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    return res.json({ success: true, data: enrollment.studiedLessons });
  } catch (err) {
    console.error('Error in getStudiedLessons:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};