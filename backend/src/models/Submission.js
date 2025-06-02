// models/Submission.js
const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const AnswerSchema = new Schema(
  {
    questionId: {
      type: Types.ObjectId,
      required: true
    },
    selectedOption: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const GradeSchema = new Schema(
  {
    score: {
      type: Number,
      default: null
    },
    gradedAt: {
      type: Date,
      default: null
    },
    graderId: {
      type: Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { _id: false }
);

const CommentSchema = new Schema(
  {
    by: {
      type: Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    at: {
      type: Date,
      default: () => new Date()
    }
  },
  { _id: false }
);

const AppealSchema = new Schema(
  {
    appealId: {
      type: Types.ObjectId,
      default: () => new Types.ObjectId()
    },
    createdAt: {
      type: Date,
      default: () => new Date()
    },
    status: {
      type: String,
      enum: ['open', 'resolved'],
      default: 'open'
    },
    comments: [CommentSchema]
  },
  { _id: false }
);

const SubmissionSchema = new Schema(
  {
    assignmentId: {
      type: Types.ObjectId,
      ref: 'Assignment',
      required: true
    },
    studentId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true
    },
    submittedAt: {
      type: Date,
      default: () => new Date()
    },
    content: {
      type: String,
      default: ''
    },
    answers: {
      type: [AnswerSchema],
      default: undefined // Chỉ dùng khi assignment.type === 'quiz'
    },
    grade: {
      type: GradeSchema,
      default: {}
    },
    appeals: {
      type: [AppealSchema],
      default: []
    }
    // Không bật timestamps vì đã có submittedAt / grade.gradedAt / appeal.createdAt
  },
  { timestamps: false }
);

module.exports = mongoose.model('Submission', SubmissionSchema);
