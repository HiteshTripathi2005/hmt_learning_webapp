const express = require("express");
const {
  getQuizForCourse,
  submitQuizAttempt,
  getQuizAttempts,
} = require("../../controllers/student-controller/quiz-controller");
const authenticateMiddleware = require("../../middleware/auth-middleware");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateMiddleware);

// Get quiz for a course
router.get("/course/:courseId", getQuizForCourse);

// Submit a quiz attempt
router.post("/submit", submitQuizAttempt);

// Get quiz attempts for a student
router.get("/attempts/:quizId", getQuizAttempts);

module.exports = router;
