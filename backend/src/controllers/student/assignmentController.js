// controllers/assignmentController.js
const mongoose = require('mongoose');
const Assignment = require('../../models/Assignment');
const User = require('../../models/User'); 
/**
 * GET /assignments/course/:courseId
 * Trả về danh sách tất cả Assignment theo courseId
 */
exports.getAssignmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid courseId' });
    }

    // Tìm tất cả assignment của course, sắp xếp theo dueDate
    const assignments = await Assignment.find({ courseId })
      .sort({ dueDate: 1 })
      .lean();

    return res.status(200).json({ success: true, data: assignments });
  } catch (err) {
    console.error('Error in getAssignmentsByCourse:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /assignments/:assignmentId
 * Trả về một Assignment chi tiết theo assignmentId
 */
exports.getAssignmentById = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid assignmentId' });
    }

    const assignment = await Assignment.findById(assignmentId).lean();
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
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