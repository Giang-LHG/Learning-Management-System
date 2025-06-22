
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
  
    if (
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(courseId)
    ) {
      return res.status(400).json({ success: false, message: 'Invalid studentId or courseId' });
    }

    const course = await Course.findById(courseId).lean();
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    if (!course.term || course.term.length === 0) {
        return res.status(400).json({ success: false, message: 'Course has no active term.' });
    }
    const currentTerm = course.term[course.term.length - 1];

    const already = await Enrollment.findOne({ studentId, courseId, term: currentTerm }).lean();
    if (already) {
      return res.status(400).json({ success: false, message: `Already enrolled in this course for term ${currentTerm}` });
    }

    const subject = await Subject.findById(course.subjectId).lean();
    if (!subject || subject.status !== 'approved') {
      return res
        .status(400)
        .json({ success: false, message: 'Subject not found or not approved' });
    }

    const prereqSubjectIds = subject.prerequisites || [];

    if (!prereqSubjectIds.length) {
      const newEnrollment = new Enrollment({ studentId, courseId, term: currentTerm, enrolledAt: new Date() });
      await newEnrollment.save();
      return res.status(201).json({ success: true, data: newEnrollment });
    }

    for (let prereqSubjId of prereqSubjectIds) {
      const prereqCourses = await Course.find({ subjectId: prereqSubjId }).select('_id').lean();
      if (!prereqCourses.length) {
        const missingSubj = await Subject.findById(prereqSubjId).select('name').lean();
        return res.status(400).json({
          success: false,
          message: `Must complete any course(s) in prerequisite subject: ${missingSubj.name}`
        });
      }

      for (let prereqCourse of prereqCourses) {
        const assignments = await Assignment.find({ courseId: prereqCourse._id }).select('_id').lean();
        const assignmentIds = assignments.map(a => a._id);

        if (!assignmentIds.length) {
          continue;
        }

        for (let aid of assignmentIds) {
          const submission = await Submission.findOne({
            assignmentId: aid,
            studentId
          })
            .select('grade.score')
            .lean();

          if (
            !submission ||
            submission.grade.score === null ||
            submission.grade.score === undefined
          ) {
            const missingSubject = await Subject.findById(prereqSubjId).select('name').lean();
            return res.status(400).json({
              success: false,
              message: `You must submit and get graded for all assignments in subject "${missingSubject.name}" before enrolling.`
            });
          }
        }
      }
    }

    const newEnrollment = new Enrollment({ studentId, courseId, term: currentTerm, enrolledAt: new Date() });
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

    const results = await Enrollment.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
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