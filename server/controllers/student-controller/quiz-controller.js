const Quiz = require("../../models/Quiz");
const QuizAttempt = require("../../models/QuizAttempt");
const CourseProgress = require("../../models/CourseProgress");
const StudentCourses = require("../../models/StudentCourses");

// Get quiz for a course (student view)
const getQuizForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Verify the student has purchased the course
    const studentCourses = await StudentCourses.findOne({ userId });
    const hasPurchased = studentCourses?.courses?.some(
      (course) => course.courseId === courseId
    );

    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        message: "You need to purchase this course to access the quiz",
      });
    }

    // Verify the student has completed the course
    const progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress || !progress.completed) {
      return res.status(403).json({
        success: false,
        message: "You need to complete the course before taking the quiz",
      });
    }

    // Get the quiz for the course
    const quiz = await Quiz.findOne({ courseId });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "No quiz available for this course",
      });
    }

    // Get previous attempts
    const attempts = await QuizAttempt.find({ userId, quizId: quiz._id })
      .sort({ completedAt: -1 })
      .limit(5);

    // Clean and prepare quiz data for student
    const quizObj = quiz.toObject();

    // Create a clean version of the quiz with properly structured questions
    const cleanQuiz = {
      _id: quizObj._id,
      courseId: quizObj.courseId,
      title: quizObj.title,
      description: quizObj.description,
      passingScore: quizObj.passingScore,
      createdAt: quizObj.createdAt,
      questions: quizObj.questions.map((question) => ({
        _id: question._id,
        questionText: question.questionText,
        explanation: question.explanation,
        // Remove isCorrect property from options for security
        options: question.options.map((option) => ({
          _id: option._id,
          text: option.text,
        })),
      })),
    };

    res.status(200).json({
      success: true,
      data: {
        quiz: cleanQuiz,
        attempts: attempts,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error fetching quiz",
    });
  }
};

// Submit a quiz attempt
const submitQuizAttempt = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const userId = req.user._id;

    // Get the quiz
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Verify the student has purchased the course
    const studentCourses = await StudentCourses.findOne({ userId });
    const hasPurchased = studentCourses?.courses?.some(
      (course) => course.courseId === quiz.courseId
    );

    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        message: "You need to purchase this course to take the quiz",
      });
    }

    // Verify the student has completed the course
    const progress = await CourseProgress.findOne({
      userId,
      courseId: quiz.courseId,
    });

    if (!progress || !progress.completed) {
      return res.status(403).json({
        success: false,
        message: "You need to complete the course before taking the quiz",
      });
    }

    // Convert quiz to plain object to avoid Mongoose document issues
    const quizObj = quiz.toObject();

    // Calculate the score
    let correctAnswers = 0;
    const gradedAnswers = answers.map((answer) => {
      // Find the question by ID
      const question = quizObj.questions.find(
        (q) => q._id.toString() === answer.questionId
      );

      if (!question) {
        console.log(`Question not found for ID: ${answer.questionId}`);
        return {
          ...answer,
          isCorrect: false,
        };
      }

      // Check if the selected options match the correct options
      const selectedOptions = answer.selectedOptionIndices || [];

      // Get indices of correct options
      const correctOptionIndices = [];
      question.options.forEach((option, index) => {
        if (option.isCorrect) {
          correctOptionIndices.push(index);
        }
      });

      console.log(`Question: ${question.questionText}`);
      console.log(`Selected options: ${JSON.stringify(selectedOptions)}`);
      console.log(`Correct options: ${JSON.stringify(correctOptionIndices)}`);

      // For single-choice questions (only one correct answer)
      if (correctOptionIndices.length === 1 && selectedOptions.length === 1) {
        const isCorrect = selectedOptions[0] === correctOptionIndices[0];
        console.log(`Single choice result: ${isCorrect}`);
        if (isCorrect) {
          correctAnswers++;
        }
        return {
          ...answer,
          isCorrect,
        };
      }

      // For multiple-choice questions
      const isCorrect =
        selectedOptions.length === correctOptionIndices.length &&
        selectedOptions.every((index) =>
          correctOptionIndices.includes(index)
        ) &&
        correctOptionIndices.every((index) => selectedOptions.includes(index));

      console.log(`Multiple choice result: ${isCorrect}`);

      if (isCorrect) {
        correctAnswers++;
      }

      return {
        ...answer,
        isCorrect,
      };
    });

    const score =
      quiz.questions.length > 0
        ? (correctAnswers / quiz.questions.length) * 100
        : 0;
    const passed = score >= quiz.passingScore;

    console.log(`Final score: ${score}, Passed: ${passed}`);

    // Create the attempt
    const attempt = new QuizAttempt({
      userId,
      courseId: quiz.courseId,
      quizId,
      answers: gradedAnswers,
      score,
      passed,
    });

    await attempt.save();

    res.status(200).json({
      success: true,
      message: passed
        ? "Congratulations! You passed the quiz."
        : "You did not pass the quiz. Try again!",
      data: {
        attempt,
        correctAnswers,
        totalQuestions: quiz.questions.length,
        score,
        passed,
        passingScore: quiz.passingScore,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error submitting quiz attempt",
    });
  }
};

// Get quiz attempts for a student
const getQuizAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user._id;

    const attempts = await QuizAttempt.find({ userId, quizId }).sort({
      completedAt: -1,
    });

    res.status(200).json({
      success: true,
      data: attempts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error fetching quiz attempts",
    });
  }
};

module.exports = {
  getQuizForCourse,
  submitQuizAttempt,
  getQuizAttempts,
};
