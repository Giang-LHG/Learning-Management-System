// models/Notification.js
const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const NotificationSchema = new Schema(
  {
    toUserId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['newSubmission', 'gradePosted', 'reportReady'],
      required: true
    },
    payload: {
      type: Schema.Types.Mixed,
      default: {}
    },
    read: {
      type: Boolean,
      default: false
    }
    // createdAt sẽ dùng timestamps
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
