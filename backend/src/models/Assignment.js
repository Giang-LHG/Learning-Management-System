
// models/Assignment.js
const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const OptionSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true
    },
    text: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const QuestionSchema = new Schema(
  {
    questionId: {
      type: Types.ObjectId,
      default: () => new Types.ObjectId()
    },
    text: {
      type: String,
      required: true
    },
    options: [OptionSchema],
    correctOption: {
      type: String,
      trim: true
    },
    points: {
      type: Number,
      default: 1
    }
  },
  { _id: false }
);

const AssignmentSchema = new Schema(
  {
    courseId: {
      type: Types.ObjectId,
      ref: 'Course',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      enum: ['essay', 'quiz'],
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    isVisible: {
      type: Boolean,
      default: true
    },
    term: {
      type: [String],
      required: true
    },
    questions: {
      type: [QuestionSchema],
      default: undefined
    }

    , term: {
      type: [String],
      required: true,
      validate: v => Array.isArray(v) && v.length > 0
    }
  })
// timestamps tự động tạo createdAt / updatedAt



module.exports = mongoose.model('Assignment', AssignmentSchema);