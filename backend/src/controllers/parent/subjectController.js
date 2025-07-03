const mongoose   = require('mongoose');
const Subject    = require('../../models/Subject');
const Course     = require('../../models/Course');
const Enrollment = require('../../models/Enrollment');

exports.getSubjectOverview = async (req, res) => {
  try {
    // Tổng số môn (dang duyệt + đã phê duyệt)
    const totalSubjects = await Subject.countDocuments();

    // Tổng số môn đã phê duyệt
    const approvedSubjects = await Subject.countDocuments({ status: 'approved' });

   
    const topSubjects = await Subject.aggregate([
      { $match: { status: 'approved' } },
      // nối collection courses để đếm số khóa mỗi môn
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: 'subjectId',
          as: 'courses'
        }
      },
      {
        $addFields: {
          courseCount: { $size: '$courses' }
        }
      },
      { $sort: { courseCount: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 1,
          name: 1,
          code: 1,
          courseCount: 1
        }
      }
    ]);

    //  Lấy 5 môn “hot” theo số sinh viên đã đăng ký nhiều nhất:
    const hotSubjects = await Enrollment.aggregate([
      // nối đến course để lấy subjectId
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      // nhóm theo môn
      {
        $group: {
          _id: '$course.subjectId',
          enrollCount: { $sum: 1 }
        }
      },
      { $sort: { enrollCount: -1 } },
      { $limit: 5 },
      // nối tên môn
      {
        $lookup: {
          from: 'subjects',
          localField: '_id',
          foreignField: '_id',
          as: 'subject'
        }
      },
      { $unwind: '$subject' },
      { $match: { 'subject.status': 'approved' } },
      {
        $project: {
          _id: '$subject._id',
          name: '$subject.name',
          code: '$subject.code',
          enrollCount: 1
        }
      }
    ]);

    return res.json({
      success: true,
      data: {
        totalSubjects,
        approvedSubjects,
        topSubjects,
        hotSubjects
      }
    });
  } catch (err) {
    console.error('Error in getSubjectOverview:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};