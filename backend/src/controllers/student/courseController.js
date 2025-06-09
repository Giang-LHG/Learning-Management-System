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
    let query = {
      $or: [
        { title: { $regex: regex } },
        { description: { $regex: regex } }
      ]
    };
    
    // Filter by subjectId if provided
    if (subjectId) {
      query.subjectId = subjectId;
    }
    
    const courses = await Course.find(query).lean();
    return res.json({ success: true, data: courses });
  } catch (err) {
    console.error('Error in searchCourses:', err);
    return res.status(500).json({ success: false, message: 'Error searching courses' });
  }
};

exports.sortCourses = async (req, res) => {
 try {
    const { sortBy, order, subjectId, studentId } = req.query;
    
    // 1. Xây dựng sortObj
    let sortObj = {};
    const validSortFields = ['title', 'startDate', 'credits', 'createdAt'];
    const field = validSortFields.includes(sortBy) ? sortBy : 'title';
    const direction = order === 'desc' ? -1 : 1;
    sortObj[field] = direction;

    // 2. Lấy courses đã sort
    const filter = subjectId ? { subjectId } : {};
    const courses = await Course.find(filter).sort(sortObj).lean();

    // 3. Nếu có studentId hợp lệ → annotate
    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
      const courseIds = courses.map(c => c._id);
      const enrollments = await Enrollment.find({
        studentId,
        courseId: { $in: courseIds }
      }).select('courseId -_id').lean();
      const enrolledSet = new Set(enrollments.map(e => e.courseId.toString()));

      const annotated = courses.map(c => ({
        ...c,
        enrolled: enrolledSet.has(c._id.toString())
      }));
      return res.json({ success: true, data: annotated });
    }

    // 4. Nếu không có studentId → trả về nguyên bản
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