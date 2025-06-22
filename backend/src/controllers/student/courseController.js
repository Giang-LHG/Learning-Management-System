
const Enrollment = require('../../models/Enrollment');
const Course = require('../../models/Course');
const Subject = require('../../models/Subject');
const Assignment = require('../../models/Assignment');
const Submission = require('../../models/Submission');
const mongoose = require('mongoose');

const getCoursesBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const courses = await Course.find({ subjectId });
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching courses' });
  }
};

const getCourseDetail = async (req, res) => {
try {
    const { courseId } = req.params;
    const course = await Course
      .findById(courseId)
      .populate('instructorId', 'profile.fullName')
      .lean();
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    course.instructorName = course.instructorId?.profile?.fullName || 'Unknown';
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching course detail' });
  }
};

const searchCourses = async (req, res) => {
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

const sortCourses = async (req, res) => {
 try {
    const { sortBy, order, subjectId, studentId } = req.query;
    let sortObj = {};
    const validSortFields = ['title', 'startDate', 'credits', 'createdAt'];
    const field = validSortFields.includes(sortBy) ? sortBy : 'title';
    const direction = order === 'desc' ? -1 : 1;
    sortObj[field] = direction;
    const filter = subjectId ? { subjectId } : {};
    const courses = await Course.find(filter).sort(sortObj).lean();
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
    return res.json({ success: true, data: courses });
  } catch (err) {
    console.error('Error in sortCourses:', err);
    return res.status(500).json({ success: false, message: 'Error sorting courses' });
  }
};

const getCoursesBySubjectForStudent = async (req, res) => {
  try {
    const { subjectId, studentId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(subjectId) ||
      !mongoose.Types.ObjectId.isValid(studentId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid subjectId or studentId' });
    }
    const courses = await Course.find({ subjectId }).lean();
    if (!courses.length) {
      return res.json({ success: true, data: [] });
    }
    const courseIds = courses.map((c) => c._id);
    const enrollments = await Enrollment.find({
      studentId,
      courseId: { $in: courseIds },
    })
      .select('courseId -_id')
      .lean();
    const enrolledSet = new Set(enrollments.map((e) => e.courseId.toString()));
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

module.exports = {
    getCoursesBySubject,
    getCourseDetail,
    searchCourses,
    sortCourses,
    getCoursesBySubjectForStudent
};