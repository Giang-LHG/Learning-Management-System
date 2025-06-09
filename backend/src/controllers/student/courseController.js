const Enrollment = require('../../models/Enrollment');
const Course = require('../../models/Course');
const Subject = require('../../models/Subject');
const Assignment = require('../../models/Assignment');
const Submission = require('../../models/Submission');
const mongoose = require('mongoose');
// Lấy tất cả course theo subjectId
exports.getCoursesBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const courses = await Course.find({ subjectId });
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching courses' });
  }
};

// Lấy chi tiết course theo courseId (gồm cả module và lesson)
exports.getCourseDetail = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching course detail' });
  }
};
exports.searchCourses = async (req, res) => {
  try {
    const { q, subjectId } = req.query;
    if (!q || typeof q !== 'string') {
      return res
        .status(400)
        .json({ success: false, message: 'Query parameter "q" is required' });
    }
    const regex = new RegExp(q, 'i');
    const courses = await Course.find({
      $or: [
        { title: { $regex: regex } },
        { description: { $regex: regex } }
      ]
    }).lean();
    return res.json({ success: true, data: courses });
  } catch (err) {
    console.error('Error in searchCourses:', err);
    return res.status(500).json({ success: false, message: 'Error searching courses' });
  }
};

exports.sortCourses = async (req, res) => {
  try {
    const { sortBy, order , subjectId} = req.query;

    // Các trường được phép sort
    const allowedSortFields = ['title', 'startDate', 'endDate', 'credits', 'createdAt'];
    let sortObj = {};

    if (sortBy && allowedSortFields.includes(sortBy)) {
      sortObj[sortBy] = order === 'desc' ? -1 : 1;
    } else {
      // Mặc định sort theo 'title' tăng dần
      sortObj = { title: 1 };
    }

    const courses = await Course.find({})
      .sort(sortObj)
      .lean();

    return res.json({ success: true, data: courses });
  } catch (err) {
    console.error('Error in sortCourses:', err);
    return res.status(500).json({ success: false, message: 'Error sorting courses' });
  }
};
exports.getCoursesBySubjectForStudent = async (req, res) => {
  try {
    const { subjectId, studentId } = req.params;

    // 1. Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(subjectId) ||
      !mongoose.Types.ObjectId.isValid(studentId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid subjectId or studentId' });
    }

    // 2. Lấy tất cả courses của subject
    const courses = await Course.find({ subjectId }).lean();

    // Nếu không có course nào, trả về mảng rỗng
    if (!courses.length) {
      return res.json({ success: true, data: [] });
    }

    // 3. Lấy tất cả enrollment của student cho các course này
    const courseIds = courses.map((c) => c._id);
    const enrollments = await Enrollment.find({
      studentId,
      courseId: { $in: courseIds },
    })
      .select('courseId -_id')
      .lean();

    // 4. Tạo một Set chứa các courseId mà student đã enroll
    const enrolledSet = new Set(enrollments.map((e) => e.courseId.toString()));

    // 5. Annotate mỗi course với trường `enrolled: true|false`
    const annotated = courses.map((c) => ({
      ...c,
      enrolled: enrolledSet.has(c._id.toString()),
    }));

    return res.json({ success: true, data: annotated });
  } catch (err) {
    console.error('Error in getCoursesBySubjectForStudent:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Error fetching courses for student' });
  }
};