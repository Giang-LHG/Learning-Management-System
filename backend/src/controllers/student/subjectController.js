
const Subject = require('../../models/Subject');
const Enrollment = require('../../models/Enrollment');
const Course = require('../../models/Course');
const mongoose = require('mongoose');

const getAllSubjects = async (req, res) => {
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
  const { studentId, term } = req.params;

  // 1. Lấy enrollments của student (nếu có term thì filter thêm)
  const filter = { studentId };
  if (term) filter.term = term;

  const enrollments = await Enrollment.find(filter).select('courseId term').lean();
  const courseIds = enrollments.map(e => e.courseId);

  // 2. Lấy các course (bao gồm term là mảng)
  const courses = await Course.find({ _id: { $in: courseIds } })
                              .select('subjectId term')
                              .lean();

  // 3. Chỉ giữ lại course mà enrollment.term === course.term.last
  const validSubjectIdSet = new Set();
  for (let enr of enrollments) {
    const course = courses.find(c => c._id.toString() === enr.courseId.toString());
    if (!course || !Array.isArray(course.term) || course.term.length === 0) continue;

    const latestTerm = course.term[course.term.length - 1];
    if (enr.term === latestTerm) {
      validSubjectIdSet.add(course.subjectId.toString());
    }
  }

  const subjectIds = Array.from(validSubjectIdSet).map(id => new mongoose.Types.ObjectId(id));

  // 4. Lấy subject documents (chỉ những cái approved)
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

const searchSubjects = async (req, res) => {
  try {
    const { q, sortBy, order } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: '"q" is required' });
    }
    const regex = new RegExp(q, 'i');
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

const sortSubjects = async (req, res) => {
  try {
    const { sortBy, order } = req.query;
    const allowedSortFields = ['name', 'code', 'createdAt', 'updatedAt'];
    let sortObj = {};
    if (sortBy && allowedSortFields.includes(sortBy)) {
      sortObj[sortBy] = order === 'desc' ? -1 : 1;
    } else {
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

  // 2. Lọc chỉ những enrollments có enrollment.term khác với course.term mới nhất
  const mismatched = enrolls.filter(enr => {
    const course = enr.courseId;
    if (!course || !Array.isArray(course.term) || course.term.length === 0) return false;

    const latestTerm = course.term[course.term.length - 1]; // lấy term mới nhất
    return enr.term !== latestTerm;
  });

  // 3. Gom unique subjectId từ những course đã lọc ra
  const subjectIdSet = new Set(
    mismatched
      .map(enr => enr.courseId?.subjectId?.toString())
      .filter(id => id)
  );
  const subjectIds = Array.from(subjectIdSet).map(id => new mongoose.Types.ObjectId(id));

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