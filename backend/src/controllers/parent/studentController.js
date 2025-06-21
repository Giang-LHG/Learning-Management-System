const mongoose    = require('mongoose');
const User        = require('../../models/User');
const Enrollment  = require('../../models/Enrollment');
const Submission  = require('../../models/Submission');
const Assignment  = require('../../models/Assignment');
const Course      = require('../../models/Course');

exports.getParentStats = async (req, res) => {
   try {
    const { parentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      return res.status(400).json({ success: false, message: 'Invalid parentId' });
    }

    const parent = await User.findById(parentId).lean();
    if (!parent || parent.roles !== 'parent') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const students = await User.find({
      roles: 'student',
      'profile.parentIds': mongoose.Types.ObjectId(parentId)
    })
    .select('_id profile.fullName')
    .lean();

    const stats = await Promise.all(students.map(async (stu) => {
      const studentId = stu._id;

      const enrolls = await Enrollment.find({ studentId })
        .populate('courseId', 'credits subjectId')
        .lean();

      const submissions = await Submission.find({
        studentId,
        'grade.score': { $ne: null }
      })
      .select('assignmentId grade.score')
      .lean();

      const assignmentCourseMap = {};
      const assignmentIds = [...new Set(submissions.map(s => s.assignmentId.toString()))];
      if (assignmentIds.length) {
        const asgs = await Assignment.find({ _id: { $in: assignmentIds } })
          .select('_id courseId')
          .lean();
        asgs.forEach(a => {
          assignmentCourseMap[a._id.toString()] = a.courseId.toString();
        });
      }

      const courseScores = {};
      submissions.forEach(s => {
        const aid = s.assignmentId.toString();
        const cid = assignmentCourseMap[aid];
        if (!cid) return;
        if (!courseScores[cid]) {
          courseScores[cid] = { total: 0, count: 0 };
        }
        courseScores[cid].total += s.grade.score;
        courseScores[cid].count += 1;
      });

      let sumWeighted = 0;
      let sumCredits  = 0;
      for (let e of enrolls) {
        const cid = e.courseId._id.toString();
        const credits = e.courseId.credits || 0;
        const cs = courseScores[cid];
        if (cs && cs.count) {
          const avgCourse = cs.total / cs.count;
          sumWeighted += avgCourse * credits;
          sumCredits  += credits;
        }
      }
      const avgBySubject = sumCredits
        ? (sumWeighted / sumCredits).toFixed(2)
        : null;

      return {
        studentId,
        fullName: stu.profile.fullName,
        totalCourses: enrolls.length,
        averageByCourse: Object.entries(courseScores).map(([cid, { total, count }]) => ({
          courseId: cid,
          avgScore: (total / count).toFixed(2)
        })),
        avgBySubject,
      };
    }));

    return res.json({ success: true, data: stats });

  } catch (err) {
    console.error('Error in getParentStats:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};