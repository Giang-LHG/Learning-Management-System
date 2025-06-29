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
    if (!parent || parent.role !== 'parent') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const students = await User.find({
      role: 'student',
      'profile.parentIds': new mongoose.Types.ObjectId(parentId)
    })
      .select('_id profile.fullName')
      .lean();
console.log("student",students);
    const stats = await Promise.all(students.map(async (stu) => {
      const studentId = stu._id;

      const enrolls = await Enrollment.find({ studentId }).lean();
      const submissions = await Submission.find({ studentId })
        .select('assignmentId grade.score term')
        .lean();

      const assignments = await Assignment.find({})
  .select('_id courseId term') // đảm bảo có trường term
  .lean();

let totalAssignCount = 0;

for (let e of enrolls) {
  const courseId = e.courseId.toString();
  const term = e.term;

  // Lọc assignment đúng course + đúng term
  const assignInThisTerm = assignments.filter(
     a => a.courseId.toString() === courseId && Array.isArray(a.term) && a.term.includes(term)
  );

  totalAssignCount += assignInThisTerm.length;
}
console.log("totalAssignCount",totalAssignCount);
      const totalCourses = enrolls.length;

      const gradedSubs = submissions.filter(s => s.grade && s.grade.score != null);

      let weightedSum = 0;
      let creditSum = 0;
      for (let e of enrolls) {
        const course = await Course.findById(e.courseId).select('credits').lean();
        if (!course) continue;
        const courseCredits = course.credits || 0;
        const relatedAids = assignments
          .filter(a => a.courseId.toString() === e.courseId.toString())
          .map(a => a._id.toString());
        const scores = gradedSubs
          .filter(s => relatedAids.includes(s.assignmentId.toString()))
          .map(s => s.grade.score);
        if (scores.length) {
          const avgCourse = scores.reduce((sum, v) => sum + v, 0) / scores.length;
          weightedSum += avgCourse * courseCredits;
          creditSum += courseCredits;
        }
      }
 const avg = weightedSum / creditSum;
const avgGrade = creditSum ? +avg.toFixed(2) : null; 

      const completedCount = gradedSubs.length;
      const completionRate = totalAssignCount
        ? (completedCount / totalAssignCount * 100).toFixed(1) + '%'
        : 'N/A';

      const byTerm = {};
      enrolls.forEach(e => {
        const t = e.term;
        if (!byTerm[t]) byTerm[t] = { courses: 0, subs: 0, avgGrade: null };
        byTerm[t].courses++;
      });
      submissions.forEach(s => {
        const t = s.term;
        if (!byTerm[t]) byTerm[t] = { courses: 0, subs: 0, avgGrade: null };
        byTerm[t].subs++;
      });
      Object.keys(byTerm).forEach(t => {
        const subsOfT = gradedSubs.filter(s => s.term === t).map(s => s.grade.score);
        byTerm[t].avgGrade = subsOfT.length
          ? (subsOfT.reduce((sum, v) => sum + v, 0) / subsOfT.length).toFixed(2)
          : null;
      });

      return {
        studentId,
        fullName: stu.profile.fullName,
        totalCourses,
        avgGrade,
        completionRate,
        byTerm
      };
    }));
    console.log(stats);

    return res.json({ success: true, data: stats });
  } catch (err) {
    console.error('Error in getParentStats:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};