const mongoose = require('mongoose');
const Assignment = require('../../models/Assignment');
const Course = require('../../models/Course');
const User = require('../../models/User');
const Enrollment = require('../../models/Enrollment'); 

exports.getAssignmentsByCourse = async (req, res) => {
  try {
  const { courseId ,studentId} = req.params;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({ success: false, message: 'Invalid courseId' });
  }
if(!studentId || !mongoose.Types.ObjectId.isValid(studentId)){
  return res.status(400).json({ success: false, message: 'Invalid studentId' });
}
  //  Lấy thông tin course để biết term
  const course = await Course.findById(courseId).select('term').lean();
  if (!course || !Array.isArray(course.term) || course.term.length === 0) {
    return res.status(404).json({ success: false, message: 'Course not found or term missing' });
  }

  const latestTerm = course.term[course.term.length - 1]; // term mới nhất
//Lấy tất cả enrollments của student
const hasEnrolled = await Enrollment.exists({
      studentId,
      courseId,
      term: latestTerm
    });
    if (!hasEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course for the current term'
      });
    }
  //  Tìm tất cả assignment của course đúng term mới nhất
  const assignments = await Assignment.find({ 
      courseId,
      term: latestTerm  
    })
    .sort({ dueDate: 1 })
    .lean();

  return res.status(200).json({ success: true, data: assignments });

} catch (err) {
  console.error('Error in getAssignmentsByCourse:', err);
  return res.status(500).json({ success: false, message: 'Server error' });
}
};


exports.getAssignmentById = async (req, res) => {
  try {
    const { assignmentId, studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid assignmentId' });
    }
if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
  return res.status(400).json({ success: false, message: 'Invalid studentId' });
}

    const assignment = await Assignment.findById(assignmentId).lean();
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    // Lấy kỳ (term) của assignment
    const asgTerm = assignment.term;
    // Lấy courseId để kiểm tra enrollment
    const courseId = assignment.courseId;

    // Kiểm tra xem student đã enroll khóa courseId ở kỳ asgTerm chưa
    const hasEnrolled = await Enrollment.exists({
      studentId,
      courseId,
      term: asgTerm
    });
    if (!hasEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course for the assignment’s term'
      });
    }
    return res.status(200).json({ success: true, data: assignment });
  } catch (err) {
    console.error('Error in getAssignmentById:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
exports.sortAssignments = async (req, res) => {
  try {
    const { sortBy, order ,courseId} = req.query;

    // Các trường được phép sort
    const allowedSortFields = ['title', 'dueDate', 'createdAt'];
    let sortObj = {};

    if (sortBy && allowedSortFields.includes(sortBy)) {
      sortObj[sortBy] = order === 'desc' ? -1 : 1;
    } else {
      // Mặc định sort theo dueDate tăng dần
      sortObj = { dueDate: 1 };
    }

    const assignments = await Assignment.find({})
      .sort(sortObj)
      .lean();

    return res.json({ success: true, data: assignments });
  } catch (err) {
    console.error('Error in sortAssignments:', err);
    return res.status(500).json({ success: false, message: 'Error sorting assignments' });
  }
};
exports.searchAssignments = async (req, res) => {
  try {
    const { q, courseId } = req.query;
    if (!q || typeof q !== 'string') {
      return res
        .status(400)
        .json({ success: false, message: 'Query parameter "q" is required' });
    }
    const regex = new RegExp(q, 'i');
    const assignments = await Assignment.find({
      $or: [
        { title: { $regex: regex } },
        { description: { $regex: regex } }
      ]
    }).lean();
    return res.json({ success: true, data: assignments });
  } catch (err) {
    console.error('Error in searchAssignments:', err);
    return res.status(500).json({ success: false, message: 'Error searching assignments' });
  }
};