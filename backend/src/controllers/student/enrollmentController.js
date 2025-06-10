// controllers/student/enrollmentController.js
const mongoose = require('mongoose');
const Enrollment = require('../../models/Enrollment');
const Course = require('../../models/Course');
const Subject = require('../../models/Subject');
const Assignment = require('../../models/Assignment');
const Submission = require('../../models/Submission');

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

    // 2. Kiểm tra course tồn tại
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // 3. Kiểm tra xem học sinh đã enroll chưa
    const already = await Enrollment.findOne({ studentId, courseId }).lean();
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

    const prereqSubjectIds = subject.prerequisites || [];

    // 5. Nếu không có prerequisites, cho enroll luôn
    if (!prereqSubjectIds.length) {
      const newEnrollment = new Enrollment({ studentId, courseId, enrolledAt: new Date() });
      await newEnrollment.save();
      return res.status(201).json({ success: true, data: newEnrollment });
    }

    // 6. Với mỗi subjectId trong prerequisites, cần kiểm tra:
    //    - Tất cả các course thuộc subject đó,
    //    - Với mỗi course, student phải có submit và graded cho tất cả assignment của course.

    for (let prereqSubjId of prereqSubjectIds) {
      // 6.1. Lấy tất cả courses trong subject prerequisite
      const prereqCourses = await Course.find({ subjectId: prereqSubjId }).select('_id').lean();
      if (!prereqCourses.length) {
        // Nếu không có khóa nào thuộc subject prerequisite, coi như điều kiện chưa thỏa
        const missingSubj = await Subject.findById(prereqSubjId).select('name').lean();
        return res.status(400).json({
          success: false,
          message: `Must complete any course(s) in prerequisite subject: ${missingSubj.name}`
        });
      }

      // 6.2. Với mỗi khóa trong prereqCourses
      for (let prereqCourse of prereqCourses) {
        const pid = prereqCourse._id;

        // Lấy tất cả assignmentId của khóa đó
        const assignments = await Assignment.find({ courseId: pid }).select('_id').lean();
        const assignmentIds = assignments.map(a => a._id);

        // Nếu khóa không có assignment nào, coi như học chỉ cần enroll/hoàn thành khóa?
        // Nhưng yêu cầu là “nộp bài và có hết điểm” – nếu không có assignment, bỏ qua khóa đó.
        if (!assignmentIds.length) {
          continue;
        }

        // 6.3. Với mỗi assignment trong assignmentIds, kiểm tra submission
        for (let aid of assignmentIds) {
          const submission = await Submission.findOne({
            assignmentId: aid,
            studentId
          })
            .select('grade.score')
            .lean();

          if (
            !submission || // chưa nộp
            submission.grade.score === null || // đã nộp nhưng chưa chấm
            submission.grade.score === undefined
          ) {
            // Lấy tên subject để thông báo (lấy lần đầu)
            const missingSubject = await Subject.findById(prereqSubjId).select('name').lean();
            return res.status(400).json({
              success: false,
              message: `You must submit and get graded for all assignments in subject "${missingSubject.name}" before enrolling.`
            });
          }
        }
      }
    }

    // 7. Nếu đã vượt qua tất cả điều kiện prerequisite, tạo enrollment
    const newEnrollment = new Enrollment({ studentId, courseId, enrolledAt: new Date() });
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