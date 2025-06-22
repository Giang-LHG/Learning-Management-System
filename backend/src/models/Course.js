
// models/Course.js
const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const LessonSchema = new Schema(
  {
    lessonId: {
      type: Types.ObjectId,
      default: () => new Types.ObjectId()
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      default: ''
    },
    isVisible: {
      type: Boolean,
      default: true
    }
  },
  { _id: false }
);

const ModuleSchema = new Schema(
  {
    moduleId: {
      type: Types.ObjectId,
      default: () => new Types.ObjectId()
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    isVisible: {
      type: Boolean,
      default: true
    },
    lessons: [LessonSchema]
  },
  { _id: false }
);

const CourseSchema = new Schema(
  {
    subjectId: {
      type: Types.ObjectId,
      ref: 'Subject',
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
    instructorId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true
    },
    modules: [ModuleSchema],
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    credits: {
      type: Number,
      default: 0
    },
    term: {
      type: [String],
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', CourseSchema);