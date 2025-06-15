const Subject = require('../../models/Subject');
const Enrollment = require('../../models/Enrollment');
const Course = require('../../models/Course');
const mongoose = require('mongoose');
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
    const { studentId,term } = req.params;
   
    // 1. Lấy enrollments của student, nếu có term thì filter
    const filter = { studentId };
    if (term) filter.term = term;

    const enrollments = await Enrollment.find(filter).select('courseId term');
    const courseIds   = enrollments.map(e => e.courseId);

    // 2. Lấy courses chỉ trong những courseId trên
    const courses = await Course.find({ _id: { $in: courseIds } })
                                .select('subjectId term');
    // 3. Lấy unique subjectId
    const subjectIds = [...new Set(courses.map(c => c.subjectId.toString()))];

    // 4. Lấy subject documents
    const subjects = await Subject.find({
      _id: { $in: subjectIds },
      status: 'approved'
    });

    res.json({ success: true, data: subjects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching subjects by student' });
  }
};
exports.searchSubjects = async (req, res) => {
  try {
    const { q, sortBy, order } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: '"q" is required' });
    }
    const regex = new RegExp(q, 'i');
    // build sort object nếu có
    const sortObj = {};
    if (sortBy) sortObj[sortBy] = order === 'desc' ? -1 : 1;

    const subjects = await Subject.find({
      status: 'approved',
      name: { $regex: regex }
    })
    .sort(sortObj)
    .lean();

    res.json({ success: true, data: subjects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error searching subjects' });
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
exports.getPreviousSubjectsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    // 1. Lấy và populate tất cả enrollments của student
    const enrolls = await Enrollment.find({ studentId })
      .populate({
        path: 'courseId',
        select: 'term subjectId'
      })
      .lean();

    // 2. Lọc chỉ những enrollments có enrollment.term khác với course.term
    const mismatched = enrolls.filter(enr =>
      enr.courseId &&                         // đảm bảo course tồn tại
      enr.term !== enr.courseId.term
    );

    // 3. Gom unique subjectId từ những course đã lọc ra
    const subjectIdSet = new Set(
      mismatched
        .map(enr => enr.courseId.subjectId && enr.courseId.subjectId.toString())
        .filter(id => id)
    );
    const subjectIds = Array.from(subjectIdSet).map(id => mongoose.Types.ObjectId(id));

    // 4. Lấy về các Subject đã approved
    const subjects = await Subject.find({
      _id: { $in: subjectIds },
      status: 'approved'
    });

    return res.json({ success: true, data: subjects });

  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: 'Error fetching previous subjects' });
  }
};