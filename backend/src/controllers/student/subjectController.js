
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

const getSubjectsByStudent = async (req, res) => {
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

module.exports = {
    getAllSubjects,
    getSubjectsByStudent,
    searchSubjects,
    sortSubjects
};