const Quiz = require("../../models/Quiz");
const Course = require("../../models/Course");

// Create a new quiz for a course
const createQuiz = async (req, res) => {
  try {
    const { courseId, title, description, questions, passingScore } = req.body;

    // Verify the course exists and belongs to the instructor
    const course = await Course.findOne({
      _id: courseId,
      instructorId: req.user._id,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or you don't have permission",
      });
    }

    // Create the quiz
    const quiz = new Quiz({
      courseId,
      title,
      description,
      questions,
      passingScore: passingScore || 70,
    });

    await quiz.save();

    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: quiz,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error creating quiz",
    });
  }
};

// Get a quiz by ID
const getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Verify the course belongs to the instructor
    const course = await Course.findOne({
      _id: quiz.courseId,
      instructorId: req.user._id,
    });

    if (!course) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access this quiz",
      });
    }

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error fetching quiz",
    });
  }
};

// Update a quiz
const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { title, description, questions, passingScore } = req.body;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Verify the course belongs to the instructor
    const course = await Course.findOne({
      _id: quiz.courseId,
      instructorId: req.user._id,
    });

    if (!course) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this quiz",
      });
    }

    // Update the quiz
    quiz.title = title || quiz.title;
    quiz.description = description || quiz.description;
    quiz.questions = questions || quiz.questions;
    quiz.passingScore = passingScore || quiz.passingScore;

    await quiz.save();

    res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      data: quiz,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error updating quiz",
    });
  }
};

// Delete a quiz
const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Verify the course belongs to the instructor
    const course = await Course.findOne({
      _id: quiz.courseId,
      instructorId: req.user._id,
    });

    if (!course) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this quiz",
      });
    }

    await Quiz.findByIdAndDelete(quizId);

    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error deleting quiz",
    });
  }
};

// Get all quizzes for a course
const getQuizzesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Verify the course belongs to the instructor
    const course = await Course.findOne({
      _id: courseId,
      instructorId: req.user._id,
    });

    if (!course) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access quizzes for this course",
      });
    }

    const quizzes = await Quiz.find({ courseId });

    res.status(200).json({
      success: true,
      data: quizzes,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error fetching quizzes",
    });
  }
};

module.exports = {
  createQuiz,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getQuizzesByCourse,
};
