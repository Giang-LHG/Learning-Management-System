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
    profile: {
      fullName: { type: String, required: true },
      avatarUrl: { type: String, default: '' },
      // Chỉ có khi role === 'student'
      parentIds: [
        {
          type: Types.ObjectId,
          ref: 'User'
        }
      ],
      // Chỉ có khi role === 'instructor'
      bio: { type: String, default: '' },
      expertise: { type: String, default: '' }
    }
    // timestamps sẽ tự động tạo ra createdAt / updatedAt
  },
   {
  timestamps: true,
  collection: 'Users'
}
);

module.exports = mongoose.model('User', UserSchema);
