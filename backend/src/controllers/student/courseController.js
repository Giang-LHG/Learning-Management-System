const Enrollment = require('../../models/Enrollment');
const Course = require('../../models/Course');
const Subject = require('../../models/Subject');
const Assignment = require('../../models/Assignment');
const Submission = require('../../models/Submission');
const mongoose = require('mongoose');
// Lấy tất cả course theo subjectId
exports.getCoursesBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const courses = await Course.find({ subjectId });
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching courses' });
  }
};

// Lấy chi tiết course theo courseId (gồm cả module và lesson)
exports.getCourseDetail = async (req, res) => {
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
exports.searchCourses = async (req, res) => {
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
    
    // Filter by subjectId if provided
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

exports.sortCourses = async (req, res) => {
 try {
    const { sortBy, order, subjectId, studentId } = req.query;
    
    let sortObj = {};
    const validSortFields = ['title', 'startDate', 'credits', 'createdAt'];
    const field = validSortFields.includes(sortBy) ? sortBy : 'title';
    const direction = order === 'desc' ? -1 : 1;
    sortObj[field] = direction;

    //  Lấy courses đã sort
    const filter = subjectId ? { subjectId } : {};
    const courses = await Course.find(filter).sort(sortObj).lean();

    //  Nếu có studentId hợp lệ → annotate
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

    //  Nếu không có studentId → trả về nguyên bản
    return res.json({ success: true, data: courses });

  } catch (err) {
    console.error('Error in sortCourses:', err);
    return res.status(500).json({ success: false, message: 'Error sorting courses' });
  }
};
exports.getCoursesBySubjectForStudent = async (req, res) => {
 try {
    const { subjectId, studentId } = req.params;

    // Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(subjectId) ||
      !mongoose.Types.ObjectId.isValid(studentId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid subjectId or studentId' });
    }

    //  Lấy tất cả courses của subject
    const courses = await Course.find({ subjectId })
      .select('_id title term credits startDate endDate')
       .populate('subjectId', 'name code description') 
      .lean();
    if (!courses.length) {
      return res.json({
        success: true,
        data: { sameTerm: [], otherTerms: [], noneEnrolled: [] }
      });
    }
    const courseIds = courses.map(c => c._id.toString());

    //  Lấy tất cả enrollments của student cho những course này
   const allEnrolls = await Enrollment.find({
  studentId,
  courseId: { $in: courseIds }
})
  .sort({ enrolledAt: -1 })
  .lean();

//  Dùng map để giữ mỗi courseId chỉ một record đầu tiên (mới nhất)
const latestByCourse = {};
for (let e of allEnrolls) {
  const key = e.courseId.toString();
  if (!latestByCourse[key]) {
    latestByCourse[key] = e;  // lần đầu gặp là mới nhất
  }
}

// Chuyển map thành mảng dedupe xong
const enrolls = Object.values(latestByCourse);
    //  Nếu chưa enroll khóa nào
    if (!enrolls.length) {
      return res.json({
        success: true,
        data: {
          sameTerm: [],
          otherTerms: [],
          noneEnrolled: courses.map(c => ({ ...c, enrolled: false }))
        }
      });
    }

    //  Lấy term gần nhất
    const latestTerm = enrolls[0].term;
console.log(latestTerm);
    //  Tạo set các courseId đã enroll (bất kể term)
    const enrolledSet = new Set(enrolls.map(e => e.courseId.toString()));

    // Phân nhóm courses theo term và trạng thái enroll
   const sameTerm     = [];
const otherTerms   = [];
const noneEnrolled = [];

const courseById = courses.reduce((map, c) => {
  map[c._id.toString()] = c;
  return map;
}, {});

for (let e of enrolls) {
  const cid      = e.courseId.toString();
  const lastTerm = e.term;               // lấy term của enrollment này
  const course   = courseById[cid];      // tìm course tương ứng

  if (!course) continue;  // nếu course không tìm thấy thì bỏ qua

  const item = { 
    ...course, 
    enrolled: true, 
    termEnrolled: lastTerm 
  };

  // Lấy kỳ cuối cùng mà course được mở
  const courseLastTerm = Array.isArray(course.term) && course.term.length
    ? course.term[course.term.length - 1]
    : null;

  if (courseLastTerm && courseLastTerm.toString() === lastTerm.toString()) {
    // nếu kỳ mở cuối của course khớp với kỳ student đã enroll
    sameTerm.push(item);
  } else {
    // nếu student đã enroll nhưng kỳ mở cuối không khớp → otherTerms
    otherTerms.push(item);
  }

  // Xóa đi để sau này còn biết course nào chưa enroll
  delete courseById[cid];
}

//  Phần còn lại trong courseById là những course chưa bao giờ enroll
for (let cid in courseById) {
  noneEnrolled.push({
    ...courseById[cid],
    enrolled: false
  });
}

return res.json({
  success: true,
  data: {
    sameTerm,
    otherTerms,
    noneEnrolled
  }
});
  } catch (err) {
    console.error('Error in getCoursesBySubjectForStudent:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Error fetching courses for student' });
  }
};