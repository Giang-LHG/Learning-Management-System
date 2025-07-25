const mongoose = require("mongoose")
const Assignment = require("../../models/Assignment")
const Course = require("../../models/Course")

// Get assignments for a specific course (for course detail page)
const getAssignmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Course ID không hợp lệ",
      })
    }

    // Check if course exists and user has permission
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khóa học",
      })
    }

    // Check permission - instructor can only view assignments of their own courses
    if (req.user.role !== "instructor" && course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ có thể xem assignments của khóa học mình dạy",
      })
    }

    const assignments = await Assignment.find({ courseId })
      .select("title description type dueDate isVisible term questions createdAt updatedAt")
      .sort({ dueDate: 1 })
      .lean()

    return res.status(200).json({
      success: true,
      data: assignments,
      count: assignments.length,
      message: "Lấy danh sách assignments thành công",
    })
  } catch (error) {
    console.error("Error in getAssignmentsByCourse:", error)
    return res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message,
    })
  }
}

const createAssignment = async (req, res) => {
  try {
    const { courseId, title, description, type, dueDate, questions } = req.body
    if (!courseId || !title || !type || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "courseId, title, type, and dueDate are required.",
      })
    }

    const course = await Course.findById(courseId).lean()
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." })
    }

    // Check permission
    if (req.user.role !== "instructor" && course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ có thể tạo assignments cho khóa học của mình",
      })
    }

    const currentTerm = course.term[course.term.length - 1]
    if (new Date(dueDate) > new Date(course.endDate)) {
      return res.status(400).json({
        success: false,
        message: "Assignment due date cannot be later than the course end date.",
      })
    }
    if (type === "quiz" && (!Array.isArray(questions) || questions.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "For quiz type, questions array is required and cannot be empty.",
      })
    }
    const newAssignment = new Assignment({
      courseId,
      title,
      description: description || "",
      type,
      dueDate: new Date(dueDate),
      questions: type === "quiz" ? questions : undefined,
      term: [currentTerm],
    })
    await newAssignment.save()
    res.status(201).json({ success: true, data: newAssignment })
  } catch (err) {
    console.error("Error creating assignment:", err)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

const createNewTerm = async (req, res) => {
  try {
    const { assignmentId } = req.params
    const { dueDate } = req.body
    if (!mongoose.Types.ObjectId.isValid(assignmentId) || !dueDate) {
      return res.status(400).json({ success: false, message: "Invalid input. dueDate is required." })
    }
    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" })
    }

    // Check permission
    const course = await Course.findById(assignment.courseId)
    if (req.user.role !== "instructor" && course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ có thể chỉnh sửa assignments của khóa học mình dạy",
      })
    }

 

    if (!course) {
      return res.status(404).json({ success: false, message: "Parent course not found." })
    }
    const newTerm = course.term[course.term.length - 1]
    if (new Date(dueDate) < new Date(course.startDate) || new Date(dueDate) > new Date(course.endDate)) {
      return res.status(400).json({
        success: false,
        message: `New due date must be between the course's new term dates (${new Date(
          course.startDate,
        ).toLocaleDateString()} and ${new Date(course.endDate).toLocaleDateString()}).`,
      })
    }
    assignment.dueDate = new Date(dueDate)
    if (!assignment.term.includes(newTerm)) {
      assignment.term.push(newTerm)
    }
    await assignment.save()
    return res.status(200).json({
      success: true,
      message: `Assignment updated for new term '${newTerm}'.`,
      data: assignment,
    })
  } catch (err) {
    console.error("Error creating new term for assignment:", err)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

const getAssignmentsForCalendar = async (req, res) => {
  try {
    const { courseId } = req.params
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid courseId" })
    }

    // Check permission
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" })
    }

    if (req.user.role !== "instructor" && course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ có thể xem assignments của khóa học mình dạy",
      })
    }

    const assignments = await Assignment.find({ courseId }).select("title dueDate").lean()
    const events = assignments.map((a) => ({
      title: a.title,
      date: a.dueDate,
      id: a._id,
    }))
    res.status(200).json({ success: true, data: events })
  } catch (err) {
    console.error("Error in getAssignmentsForCalendar:", err)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

const toggleAssignmentVisibility = async (req, res) => {
  try {
    const { assignmentId } = req.params
    const { isVisible } = req.body
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ success: false, message: "Invalid assignmentId" })
    }
    if (typeof isVisible !== "boolean") {
      return res.status(400).json({ success: false, message: "isVisible must be a boolean." })
    }

    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" })
    }

    // Check permission
    const course = await Course.findById(assignment.courseId)
    if (req.user.role !== "instructor" && course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ có thể chỉnh sửa assignments của khóa học mình dạy",
      })
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(assignmentId, { isVisible }, { new: true })

    res.status(200).json({ success: true, message: "Visibility updated", data: updatedAssignment })
  } catch (err) {
    console.error("Error in toggleAssignmentVisibility:", err)
    res.status(500).json({ success: false, message: "Server error" })
  }
}
const updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const updates = req.body;

    // 1. Kiểm tra assignmentId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid assignmentId.' });
    }

    // 2. Tìm assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    // 3. Lấy course để kiểm tra quyền và dueDate
    const course = await Course.findById(assignment.courseId).lean();
    if (!course) {
      return res.status(404).json({ success: false, message: 'Associated course not found.' });
    }

    // 4. Permission check: chỉ instructor của khóa học mới được chỉnh sửa
    if (req.user.role !== 'instructor' && course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn chỉ có thể chỉnh sửa assignment của khóa học mình quản lý.',
      });
    }

    // 5. Nếu có cập nhật dueDate thì kiểm tra không vượt quá endDate của course
    if (updates.dueDate) {
      const newDue = new Date(updates.dueDate);
      if (newDue > new Date(course.endDate)) {
        return res.status(400).json({
          success: false,
          message: 'Assignment due date cannot be later than the course end date.',
        });
      }
      assignment.dueDate = newDue;

      // --- MỚI: xử lý term ---
      const currentTerm = course.term[course.term.length - 1];
      const lastAssignedTerm = assignment.term[assignment.term.length - 1];
      if (currentTerm && currentTerm !== lastAssignedTerm) {
        assignment.term.push(currentTerm);
      }
    }

    // 6. Nếu cập nhật type thành quiz, bắt buộc phải có questions
    if (updates.type) {
      if (!['essay', 'quiz'].includes(updates.type)) {
        return res.status(400).json({ success: false, message: 'Invalid assignment type.' });
      }
      assignment.type = updates.type;
    }
    if (assignment.type === 'quiz') {
      const qs = updates.questions || assignment.questions;
      if (!Array.isArray(qs) || qs.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'For quiz type, questions array is required and cannot be empty.',
        });
      }
      if (updates.questions) assignment.questions = updates.questions;
    } else {
      assignment.questions = undefined;
    }

    // 7. Các trường text-based có thể cập nhật bình thường
    if (updates.title !== undefined)      assignment.title       = updates.title;
    if (updates.description !== undefined)assignment.description = updates.description;
    if (updates.isVisible !== undefined)  assignment.isVisible  = updates.isVisible;

    // 8. Lưu và trả về kết quả
    await assignment.save();
    return res.status(200).json({ success: true, data: assignment });
  } catch (err) {
    console.error('Error updating assignment:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // 1. Kiểm tra assignmentId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid assignmentId.' });
    }

    // 2. Tìm assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    // 3. Lấy course để kiểm tra quyền
    const course = await Course.findById(assignment.courseId).lean();
    if (!course) {
      return res.status(404).json({ success: false, message: 'Associated course not found.' });
    }

    // 4. Permission check: chỉ instructor của khóa học mới được xóa
    if (req.user.role !== 'instructor' && course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn chỉ có thể xóa assignment của khóa học mình quản lý.',
      });
    }

    // 5. Thực hiện xóa
    await Assignment.findByIdAndDelete(assignmentId);
    return res.status(200).json({ success: true, message: 'Assignment deleted successfully.' });
  } catch (err) {
    console.error('Error deleting assignment:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
module.exports = {
  getAssignmentsByCourse,
  createAssignment,
  createNewTerm,
  getAssignmentsForCalendar,
  toggleAssignmentVisibility,
  updateAssignment,
  deleteAssignment,
}
