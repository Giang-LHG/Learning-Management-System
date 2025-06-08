const Subject = require('../../models/Subject');
const Enrollment = require('../../models/Enrollment');
const Course = require('../../models/Course');

// Lấy tất cả subjects đã được duyệt
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ status: 'approved' });
    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching subjects' });
  }
};

// Lấy tất cả subjects mà student đã enroll
exports.getSubjectsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const enrollments = await Enrollment.find({ studentId }).select('courseId');
    const courseIds = enrollments.map(e => e.courseId);

    const courses = await Course.find({ _id: { $in: courseIds } }).select('subjectId');
    const subjectIds = [...new Set(courses.map(c => c.subjectId.toString()))];

    const subjects = await Subject.find({
      _id: { $in: subjectIds },
      status: 'approved'
    });

    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching subjects by student' });
  }
};
exports.searchSubjects = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res
        .status(400)
        .json({ success: false, message: 'Query parameter "q" is required' });
    }
    const regex = new RegExp(q, 'i');
    const subjects = await Subject.find({
      status: 'approved',
      name: { $regex: regex }
    })
      .lean();
    return res.json({ success: true, data: subjects });
  } catch (err) {
    console.error('Error in searchSubjects:', err);
    return res.status(500).json({ success: false, message: 'Error searching subjects' });
  }
};
exports.sortSubjects = async (req, res) => {
  try {
    const { sortBy, order } = req.query;

    // Các trường được phép sort
    const allowedSortFields = ['name', 'code', 'createdAt', 'updatedAt'];
    let sortObj = {};

    if (sortBy && allowedSortFields.includes(sortBy)) {
      sortObj[sortBy] = order === 'desc' ? -1 : 1;
    } else {
      // Mặc định sort theo 'name' tăng dần
      sortObj = { name: 1 };
    }

    const subjects = await Subject.find({ status: 'approved' })
      .sort(sortObj)
      .lean();

    return res.json({ success: true, data: subjects });
  } catch (err) {
    console.error('Error in sortSubjects:', err);
    return res.status(500).json({ success: false, message: 'Error sorting subjects' });
  }
};