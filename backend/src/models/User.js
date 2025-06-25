// models/User.js
const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin', 'parent'],
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    lastLoginAt: {
      type: Date,
      default: null
    },
    profile: {
      fullName: { type: String, required: true },
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
      bio: { type: String, default: '' },
      avatarUrl: { type: String, default: '' },
      // Chỉ có khi role === 'student'
      studentId: { type: String, default: '' },
      className: { type: String, default: '' },
      parentIds: [
        {
          type: Types.ObjectId,
          ref: 'User'
        }
      ],
      // Chỉ có khi role === 'instructor'
      department: { type: String, default: '' },
      expertise: { type: [String], default: [] }
    }
    // timestamps sẽ tự động tạo ra createdAt / updatedAt
  },
  {
    timestamps: true,
    // collection: 'Users'
  }
);

module.exports = mongoose.model('User', UserSchema);
