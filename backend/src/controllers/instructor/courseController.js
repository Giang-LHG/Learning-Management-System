
const mongoose = require("mongoose");
const Enrollment = require("../../models/Enrollment");
const Course = require("../../models/Course");
const User = require("../../models/User");
const Subject = require("../../models/Subject");

// ✅ Create new course with full support for modules and lessons
exports.createCourse = async (req, res) => {
  try {
    const { title, description, instructorId, subjectId, startDate, endDate, credits, term, modules } = req.body;
const sId = new mongoose.Types.ObjectId(subjectId);
    // Check permission
    if (req.user.role !== "instructor" && req.user._id !== instructorId) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ có thể tạo khóa học cho chính mình.",
      });
    }

    // Validate required fields
    if (!title || !instructorId || !subjectId || !startDate || !endDate || !term) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
      });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(instructorId) || !mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ",
      });
    }

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Ngày bắt đầu phải trước ngày kết thúc",
      });
    }

    // Validate modules and lessons
    if (modules && Array.isArray(modules)) {
      for (const module of modules) {
        if (!module.title?.trim()) {
          return res.status(400).json({
            success: false,
            message: "Tên chương là bắt buộc",
          });
        }
        if (module.lessons && Array.isArray(module.lessons)) {
          for (const lesson of module.lessons) {
            if (!lesson.title?.trim()) {
              return res.status(400).json({
                success: false,
                message: "Tên bài học là bắt buộc",
              });
            }
          }
        } else {
          return res.status(400).json({
            success: false,
            message: "Mỗi chương phải có ít nhất một bài học",
          });
        }
      }
    }

    // Create new course
    const course = new Course({
      title,
      description: description || "",
      instructorId,
      subjectId: sId,
      startDate,
      endDate,
      credits: credits || 0,
      term: Array.isArray(term) ? term : [term],
      status: "draft",
      modules: modules || [],
    });

    await course.save();

    // Populate course data
    const populatedCourse = await Course.findById(course._id)
      .populate("instructorId", "profile.fullName email")
      .populate("subjectId", "name code")
      .lean();

    return res.status(201).json({
      success: true,
      message: "Tạo khóa học thành công",
      data: populatedCourse,
    });
  } catch (err) {
    console.error("Error creating course:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server: " + err.message,
    });
  }
};

// Các hàm khác giữ nguyên như trong file gốc
exports.getCourseDetail = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Course ID không hợp lệ",
      });
    }

    const course = await Course.findById(courseId)
      .populate({
        path: "instructorId",
        select: "profile email username",
        model: "User",
      })
      .populate({
        path: "subjectId",
        select: "name code description",
        model: "Subject",
      })
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khóa học",
      });
    }

    if (req.user.role === "instructor" && course.instructorId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ có thể xem chi tiết khóa học của mình",
      });
    }

    const enrollmentStats = await Enrollment.aggregate([
      { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalEnrollments = await Enrollment.countDocuments({ courseId });
    const activeEnrollments = enrollmentStats.find((stat) => stat._id === "active")?.count || 0;

    const totalModules = course.modules?.length || 0;
    const totalLessons =
      course.modules?.reduce((total, module) => {
        return total + (module.lessons?.length || 0);
      }, 0) || 0;

    const visibleModules = course.modules?.filter((module) => module.isVisible !== false).length || 0;
    const visibleLessons =
      course.modules?.reduce((total, module) => {
        if (module.isVisible !== false) {
          return total + (module.lessons?.filter((lesson) => lesson.isVisible !== false).length || 0);
        }
        return total;
      }, 0) || 0;

    const courseDetail = {
      ...course,
      statistics: {
        totalEnrollments,
        activeEnrollments,
        totalModules,
        totalLessons,
        visibleModules,
        visibleLessons,
        completionRate: totalEnrollments > 0 ? Math.round((activeEnrollments / totalEnrollments) * 100) : 0,
      },
      enrollmentStats: enrollmentStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      formattedDates: {
        startDate: new Date(course.startDate).toLocaleDateString("vi-VN"),
        endDate: new Date(course.endDate).toLocaleDateString("vi-VN"),
        createdAt: new Date(course.createdAt).toLocaleDateString("vi-VN"),
        updatedAt: new Date(course.updatedAt).toLocaleDateString("vi-VN"),
      },
    };

    return res.status(200).json({
      success: true,
      data: courseDetail,
      message: "Lấy chi tiết khóa học thành công",
    });
  } catch (error) {
    console.error("Error in getCourseDetail:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message,
    });
  }
};

exports.getCourseModules = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Course ID không hợp lệ",
      });
    }

    const course = await Course.findById(courseId).select("modules title instructorId").lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khóa học",
      });
    }

    if (req.user.role === "instructor" && course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ có thể xem modules của khóa học mình dạy",
      });
    }

    const modules =
      course.modules?.map((module) => ({
        moduleId: module.moduleId,
        title: module.title,
        isVisible: module.isVisible !== false,
        lessonsCount: module.lessons?.length || 0,
        visibleLessonsCount: module.lessons?.filter((lesson) => lesson.isVisible !== false).length || 0,
        lessons:
          module.lessons?.map((lesson) => ({
            lessonId: lesson.lessonId,
            title: lesson.title,
            isVisible: lesson.isVisible !== false,
            hasContent: !!(lesson.content && lesson.content.trim()),
          })) || [],
      })) || [];

    return res.status(200).json({
      success: true,
      data: {
        courseId: course._id,
        courseTitle: course.title,
        modules,
        totalModules: modules.length,
        totalLessons: modules.reduce((total, module) => total + module.lessonsCount, 0),
      },
      message: "Lấy danh sách modules thành công",
    });
  } catch (error) {
    console.error("Error in getCourseModules:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message,
    });
  }
};

exports.getLessonContent = async (req, res) => {
  try {
    const { courseId, moduleId, lessonId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(courseId) ||
      !mongoose.Types.ObjectId.isValid(moduleId) ||
      !mongoose.Types.ObjectId.isValid(lessonId)
    ) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ",
      });
    }

    const course = await Course.findById(courseId).select("modules title instructorId").lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khóa học",
      });
    }

    if (req.user.role === "instructor" && course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ có thể xem nội dung bài học của khóa học mình dạy",
      });
    }

    const module = course.modules?.find((m) => m.moduleId.toString() === moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy module",
      });
    }

    const lesson = module.lessons?.find((l) => l.lessonId.toString() === lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài học",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        courseId: course._id,
        courseTitle: course.title,
        moduleId: module.moduleId,
        moduleTitle: module.title,
        lesson: {
          lessonId: lesson.lessonId,
          title: lesson.title,
          content: lesson.content || "",
          isVisible: lesson.isVisible !== false,
        },
      },
      message: "Lấy nội dung bài học thành công",
    });
  } catch (error) {
    console.error("Error in getLessonContent:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message,
    });
  }
};

exports.getCoursesByInstructor = async (req, res) => {
  try {
    const instructorId = req.params.instructorId;

    if (req.user.role === "instructor" && req.user._id.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ có thể xem khóa học của mình.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(instructorId)) {
      return res.status(400).json({
        success: false,
        message: "Instructor ID không hợp lệ.",
      });
    }

    const courses = await Course.find({ instructorId })
      .populate("instructorId", "profile")
      .populate("subjectId", "name code")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: courses,
      count: courses.length,
    });
  } catch (error) {
    console.error("Error in getCoursesByInstructor:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message,
    });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, startDate, endDate, credits, term, modules,lessons,assignments } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Course ID không hợp lệ",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khóa học",
      });
    }

    if (req.user.role === "instructor" && course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ có thể chỉnh sửa khóa học của mình",
      });
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Ngày bắt đầu phải trước ngày kết thúc",
      });
    }

    if (title) course.title = title;
    if (description !== undefined) course.description = description;
    if (startDate) course.startDate = startDate;
    if (endDate) course.endDate = endDate;
    if (credits !== undefined) course.credits = credits;
    if (term) course.term = Array.isArray(term) ? term : [term];
  if (modules) {
      course.modules = modules;
      course.markModified('modules');
    }

    if (assignments) {
      course.assignments = assignments;
      course.markModified('assignments');
    }
    await course.save();

    const populatedCourse = await Course.findById(course._id)
      .populate("instructorId", "profile.fullName email")
      .populate("subjectId", "name code")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Cập nhật khóa học thành công",
      data: populatedCourse,
    });
  } catch (err) {
    console.error("Error updating course:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server: " + err.message,
    });
  }
};

exports.getCourseParticipants = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Course ID không hợp lệ",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khóa học",
      });
    }

    if (req.user.role !== "instructor" && course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ có thể xem danh sách học viên của khóa học mình dạy",
      });
    }

    const enrollments = await Enrollment.find({ courseId })
      .populate("studentId", "profile.fullName email profile.studentId")
      .sort({ enrolledAt: 1 })
      .lean();

    const participants = enrollments.map((e) => ({
      studentId: e.studentId._id,
      fullName: e.studentId.profile.fullName,
      email: e.studentId.email,
      studentCode: e.studentId.profile.studentId,
      enrolledAt: e.enrolledAt,
      status: e.status || "active",
    }));

    return res.status(200).json({
      success: true,
      data: participants,
      count: participants.length,
    });
  } catch (err) {
    console.error("Error in getCourseParticipants:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server: " + err.message,
    });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Course ID không hợp lệ",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khóa học",
      });
    }

    if (req.user.role !== "instructor" && course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ có thể xóa khóa học của mình",
      });
    }

    const enrollmentCount = await Enrollment.countDocuments({ courseId });
    if (enrollmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa khóa học đang có học viên tham gia",
      });
    }

    await Course.findByIdAndDelete(courseId);

    return res.status(200).json({
      success: true,
      message: "Xóa khóa học thành công",
    });
  } catch (err) {
    console.error("Error deleting course:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server: " + err.message,
    });
  }
};

exports.toggleMaterialVisibility = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { materialType, materialId, isVisible } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(courseId) ||
      !mongoose.Types.ObjectId.isValid(materialId) ||
      !["module", "lesson"].includes(materialType) ||
      typeof isVisible !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu đầu vào không hợp lệ",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khóa học",
      });
    }

    if (req.user.role === "instructor" && course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ có thể chỉnh sửa tài liệu của khóa học mình dạy",
      });
    }

    let updated = false;
    if (materialType === "module") {
      const module = course.modules.find((m) => m.moduleId.toString() === materialId);
      if (module) {
        module.isVisible = isVisible;
        updated = true;
      }
    } else {
      for (const module of course.modules) {
        const lesson = module.lessons.find((l) => l.lessonId.toString() === materialId);
        if (lesson) {
          lesson.isVisible = isVisible;
          updated = true;
          break;
        }
      }
    }

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài liệu",
      });
    }

    await course.save();
    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái hiển thị thành công",
      data: course,
    });
  } catch (err) {
    console.error("Error toggling material visibility:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server: " + err.message,
    });
  }
};

exports.createNewTerm = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { term, startDate, endDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId) || !term || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc: term, startDate, endDate",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khóa học",
      });
    }

    if (req.user.role !== "instructor" && course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ có thể tạo kỳ học mới cho khóa học của mình",
      });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Ngày bắt đầu phải trước ngày kết thúc",
      });
    }

    if (new Date(course.endDate) > new Date()) {
      return res.status(400).json({
        success: false,
        message: "Không thể tạo kỳ học mới khi kỳ học hiện tại chưa kết thúc",
      });
    }

    course.startDate = new Date(startDate);
    course.endDate = new Date(endDate);

    if (!Array.isArray(course.term)) {
      course.term = [course.term];
    }
    course.term.push(term);

    await course.save();

    return res.status(200).json({
      success: true,
      message: `Tạo kỳ học mới '${term}' thành công`,
      data: course,
    });
  } catch (err) {
    console.error("Error creating new term for course:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server: " + err.message,
    });
  }
};
