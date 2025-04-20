const express = require("express");
const {
  createQuiz,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getQuizzesByCourse,
} = require("../../controllers/instructor-controller/quiz-controller");
const authenticateMiddleware = require("../../middleware/auth-middleware");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateMiddleware);

// Create a new quiz
router.post("/create", createQuiz);

// Get a quiz by ID
router.get("/:quizId", getQuizById);

// Update a quiz
router.put("/:quizId", updateQuiz);

// Delete a quiz
router.delete("/:quizId", deleteQuiz);

// Get all quizzes for a course
router.get("/course/:courseId", getQuizzesByCourse);

module.exports = router;
