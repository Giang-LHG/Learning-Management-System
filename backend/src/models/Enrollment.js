// models/Enrollment.js
const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const EnrollmentSchema = new Schema(
  {
    courseId: {
      type: Types.ObjectId,
      ref: 'Course',
      required: true
    },
    studentId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true
    },
    enrolledAt: {
      type: Date,
      default: () => new Date()
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'dropped'],
      default: 'active'
    }
  },
  { timestamps: false }
  // Không cần timestamps vì chỉ lưu enrolledAt, status; nếu muốn thêm createdAt/updatedAt thì set { timestamps: true }.
);

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
