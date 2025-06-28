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
  const { studentId, term } = req.params;

  //  Lấy enrollments của student (nếu có term thì filter thêm)
  const filter = { studentId };
  if (term) filter.term = term;

  const enrollments = await Enrollment.find(filter).select('courseId term').lean();
  const courseIds = enrollments.map(e => e.courseId);

  // Lấy các course (bao gồm term là mảng)
  const courses = await Course.find({ _id: { $in: courseIds } })
                              .select('subjectId term')
                              .lean();

  //  Chỉ giữ lại course mà enrollment.term === course.term.last
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

  //  Lấy subject documents (chỉ những cái approved)
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
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid studentId' });
    }

    //  Lấy tất cả enrollments của student
    const enrolls = await Enrollment.find({ studentId })
      .select('term subjectId')
      .lean();

    //  Nhóm enrollments theo subjectId, tìm latest enrolled term của mỗi môn
    const latestEnrollBySubject = enrolls.reduce((acc, e) => {
      const sid = e.subjectId?.toString();
      if (!sid) return acc;
      if (!acc[sid] || acc[sid] < e.term) {
        acc[sid] = e.term;
      }
      return acc;
    }, {});

    const subjectIds = Object.keys(latestEnrollBySubject)
      .map(id => new mongoose.Types.ObjectId(id));

    if (!subjectIds.length) {
      return res.json({ success: true, data: [] });
    }

    //  Với mỗi subjectId, lấy latest course term của môn
    const keepSubjectIds = [];
    for (let sid of subjectIds) {
      const courses = await Course.find({ subjectId: sid })
        .select('term')
        .lean();

      // Gom tất cả term từ các course, chọn term lớn nhất (string compare)
      const allTerms = courses
        .flatMap(c => Array.isArray(c.term) ? c.term : [])
        .filter(t => typeof t === 'string');

      if (!allTerms.length) continue;

      const latestCourseTerm = allTerms.sort().pop();

      // Nếu sinh viên đã enroll và kỳ enroll đó < latestCourseTerm thì giữ môn này
      const latestEnrollTerm = latestEnrollBySubject[sid.toString()];
      if (latestEnrollTerm && latestEnrollTerm < latestCourseTerm) {
        keepSubjectIds.push(sid);
      }
    }

    if (!keepSubjectIds.length) {
      return res.json({ success: true, data: [] });
    }

    //  Trả về các subject đã approved
    const subjects = await Subject.find({
      _id:    { $in: keepSubjectIds },
      status: 'approved'
    }).lean();

    return res.json({ success: true, data: subjects });

  } catch (err) {
    console.error('Error in getPreviousSubjects:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }

};
exports.getSubjectRecommendations = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid studentId' });
    }

    // 1. Lấy tất cả enrollments của student
  const enrolls = await Enrollment.find({ studentId })
  .populate({
    path: 'courseId',
    select: 'subjectId instructorId'
  })
  .lean();

    // A. ===== mostEnrolledSubjects =====
    // Đếm số enroll theo subjectId
    const countBySubject = enrolls.reduce((acc, e) => {
      const sid = e.subjectId?.toString();
      if (!sid) return acc;
      acc[sid] = (acc[sid] || 0) + 1;
      return acc;
    }, {});
    // Chuyển về mảng và sort giảm dần
    const sortedSubjectIds = Object
      .entries(countBySubject)
      .sort((a, b) => b[1] - a[1])
      .map(([sid]) => new mongoose.Types.ObjectId(sid));

    // Nạp chi tiết những môn đó
    const mostEnrolledSubjects = await Subject.find({
      _id: { $in: sortedSubjectIds }
    })
      .lean()
      .then(rows => {
        // giữ thứ tự giống sortedSubjectIds
        const byId = rows.reduce((m, s) => (m[s._id.toString()] = s, m), {});
        return sortedSubjectIds.map(id => byId[id.toString()]);
      });

    // B. ===== peerInstructorSubjects =====
    // Tìm tất cả courseId đã enroll, nạp lên để lấy instructorId
    const instructorIds = Array.from(new Set(
      enrolls
        .map(e => e.courseId?.instructorId?.toString())
        .filter(id => id)
    )).map(id => new mongoose.Types.ObjectId(id));

    // Từ enrolls giữ sẵn subjectId đã học để loại ra
    const enrolledSubjectIds = new Set(
      enrolls.map(e => e.subjectId?.toString()).filter(id => id)
    );
console.log(enrolledSubjectIds);
console.log(instructorIds);
    // Tìm các Subject do những instructor đó đảm nhiệm,
    // thông qua Course rồi lấy subjectId và loại ra những môn đã học
    const peerInstructorSubjects = await Course.aggregate([
      { $match: { instructorId: { $in: instructorIds } } },
      { $group: { _id: '$subjectId' } },
      { $match: { _id: { $nin: Array.from(enrolledSubjectIds).map(id => new mongoose.Types.ObjectId(id)) } } },
      { $lookup: {
          from: 'subjects',
          localField: '_id',
          foreignField: '_id',
          as: 'subject'
      }},
      { $unwind: '$subject' },
      { $match: { 'subject.status': 'approved' } },
      { $replaceRoot: { newRoot: '$subject' } }
    ]);
console.log(peerInstructorSubjects);
    return res.json({
      success: true,
      data: {
        mostEnrolledSubjects,
        peerInstructorSubjects
      }
    });
  } catch (err) {
    console.error('Error in getSubjectRecommendations:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
