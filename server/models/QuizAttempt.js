const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema({
  questionId: String,
  selectedOptionIndices: [Number],
  isCorrect: Boolean,
});

const QuizAttemptSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  courseId: {
    type: String,
    required: true,
  },
  quizId: {
    type: String,
    required: true,
  },
  answers: [AnswerSchema],
  score: {
    type: Number,
    required: true,
  },
  passed: {
    type: Boolean,
    required: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("QuizAttempt", QuizAttemptSchema);
