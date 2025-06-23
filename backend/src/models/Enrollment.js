
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
    subjectId: {
      type: Types.ObjectId,
      ref: 'Subject',
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
    },
   term:{
      type:String,
      required:true,
      trim:true
    }
  },
  { timestamps: false }
);

module.exports = mongoose.model('Enrollment', EnrollmentSchema);