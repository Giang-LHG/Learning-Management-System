// models/Subject.js
const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const SubjectSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    createdBy: {
      type: Types.ObjectId,
      ref: 'User',
      required: true
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    // Danh sách subject cần học trước (prerequisites)
    prerequisites: [
      {
        type: Types.ObjectId,
        ref: 'Subject'
      }
    ]
    // timestamps sẽ tự động tạo ra createdAt / updatedAt
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', SubjectSchema);
