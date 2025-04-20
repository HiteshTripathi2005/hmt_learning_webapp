import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthContext } from "@/context/auth-context";
import {
  getQuizForCourseService,
  submitQuizAttemptService,
  getCourseDetailsService,
} from "@/services";
import { ArrowLeft, CheckCircle, XCircle, Award } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Certificate from "@/components/certificate";

function StudentQuizPage() {
  const { courseId } = useParams();
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [course, setCourse] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [activeTab, setActiveTab] = useState("quiz");
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    fetchQuiz();
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await getCourseDetailsService(courseId);
      if (response.success) {
        setCourse(response.data);
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
    }
  };

  const fetchQuiz = async () => {
    setLoading(true);
    setError(null);
    const response = await getQuizForCourseService(courseId);

    if (response.success) {
      console.log("Quiz data received:", response.data.quiz);
      setQuiz(response.data.quiz);
      setAttempts(response.data.attempts);

      // Initialize answers array
      if (
        response.data.quiz.questions &&
        response.data.quiz.questions.length > 0
      ) {
        const initialAnswers = response.data.quiz.questions.map((q) => ({
          questionId: q._id.toString(), // Ensure ID is a string
          selectedOptionIndices: [],
        }));
        console.log("Initialized answers:", initialAnswers);
        setAnswers(initialAnswers);
      }
    } else {
      setError(response.message);
      toast.error(response.message);
    }

    setLoading(false);
  };

  const handleOptionChange = (questionIndex, optionIndex, isMultipleChoice) => {
    const newAnswers = [...answers];

    if (isMultipleChoice) {
      // For checkboxes (multiple choice)
      const currentSelections = newAnswers[questionIndex].selectedOptionIndices;

      if (currentSelections.includes(optionIndex)) {
        // Remove if already selected
        newAnswers[questionIndex].selectedOptionIndices =
          currentSelections.filter((index) => index !== optionIndex);
      } else {
        // Add if not selected
        newAnswers[questionIndex].selectedOptionIndices = [
          ...currentSelections,
          optionIndex,
        ];
      }
    } else {
      // For radio buttons (single choice)
      newAnswers[questionIndex].selectedOptionIndices = [optionIndex];
    }

    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    // Check if all questions have been answered
    const unansweredQuestions = answers.filter(
      (answer) => answer.selectedOptionIndices.length === 0
    );

    if (unansweredQuestions.length > 0) {
      toast.error(
        `Please answer all questions before submitting. ${unansweredQuestions.length} questions unanswered.`
      );
      return;
    }

    // Ensure all question IDs are strings
    const formattedAnswers = answers.map((answer) => ({
      ...answer,
      questionId: answer.questionId.toString(),
    }));

    console.log("Submitting answers:", formattedAnswers);

    const response = await submitQuizAttemptService({
      quizId: quiz._id,
      answers: formattedAnswers,
    });

    console.log("Quiz submission response:", response);

    if (response.success) {
      setQuizSubmitted(true);
      setQuizResult(response.data);
      setActiveTab("results");

      // Show certificate if passed
      if (response.data.passed) {
        setShowCertificate(true);
      }

      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  const handleRetakeQuiz = () => {
    setQuizSubmitted(false);
    setQuizResult(null);
    setCurrentQuestion(0);
    setActiveTab("quiz");
    setShowCertificate(false);

    // Reset answers
    if (quiz && quiz.questions) {
      setAnswers(
        quiz.questions.map((q) => ({
          questionId: q._id.toString(),
          selectedOptionIndices: [],
        }))
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Quiz...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Button
          onClick={() => navigate(`/course-progress/${courseId}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Button>

        <Card className="max-w-3xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">Quiz Not Available</h2>
              <p className="text-gray-500 mb-4">
                {error || "There is no quiz available for this course yet."}
              </p>
              <p className="text-gray-500 mb-4">
                Please contact your instructor if you believe this is an error.
              </p>
              <Button onClick={() => navigate(`/course-progress/${courseId}`)}>
                Return to Course
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto py-8">
        <Button
          onClick={() => navigate(`/course-progress/${courseId}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Button>

        <Card className="max-w-3xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">No Quiz Available</h2>
              <p className="text-gray-500 mb-4">
                There is no quiz available for this course yet.
              </p>
              <Button onClick={() => navigate(`/course-progress/${courseId}`)}>
                Return to Course
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderQuizResults = () => {
    if (!quizResult) return null;

    return (
      <div>
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-2">
            Your Score: {quizResult.score.toFixed(1)}%
          </h3>

          {quizResult.passed ? (
            <div className="flex items-center justify-center text-green-600">
              <CheckCircle className="mr-2 h-6 w-6" />
              <span className="text-lg font-medium">Passed!</span>
            </div>
          ) : (
            <div className="flex items-center justify-center text-red-600">
              <XCircle className="mr-2 h-6 w-6" />
              <span className="text-lg font-medium">
                Not Passed (Required: {quizResult.passingScore}%)
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-center mb-6">
          <div className="text-center px-4">
            <div className="text-3xl font-bold text-green-600">
              {quizResult.correctAnswers}
            </div>
            <div className="text-sm text-gray-500">Correct</div>
          </div>

          <div className="text-center px-4">
            <div className="text-3xl font-bold text-red-600">
              {quizResult.totalQuestions - quizResult.correctAnswers}
            </div>
            <div className="text-sm text-gray-500">Incorrect</div>
          </div>

          <div className="text-center px-4">
            <div className="text-3xl font-bold">
              {quizResult.totalQuestions}
            </div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <Button onClick={handleRetakeQuiz} className="mr-2">
            Retake Quiz
          </Button>

          {quizResult.passed && (
            <Button
              onClick={() => setActiveTab("certificate")}
              variant="outline"
              className="flex items-center"
            >
              <Award className="mr-2 h-4 w-4" />
              View Certificate
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <Button
        onClick={() => navigate(`/course-progress/${courseId}`)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Course
      </Button>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
          <p className="text-gray-500">{quiz.description}</p>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quiz" disabled={quizSubmitted}>
              Quiz
            </TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="certificate" disabled={!quizResult?.passed}>
              Certificate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quiz">
            {quiz.questions && quiz.questions.length > 0 && (
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">
                      Question {currentQuestion + 1} of {quiz.questions.length}
                    </span>
                    <span className="text-sm text-gray-500">
                      Passing Score: {quiz.passingScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{
                        width: `${
                          ((currentQuestion + 1) / quiz.questions.length) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">
                    {quiz.questions[currentQuestion].questionText}
                  </h3>

                  {/* Check if multiple correct answers are possible */}
                  {quiz.questions[currentQuestion].options.filter(
                    (o) => o.isCorrect
                  ).length > 1 ? (
                    <div className="space-y-3">
                      {quiz.questions[currentQuestion].options.map(
                        (option, optionIndex) => (
                          <div
                            key={option._id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`option-${optionIndex}`}
                              checked={answers[
                                currentQuestion
                              ].selectedOptionIndices.includes(optionIndex)}
                              onCheckedChange={(checked) => {
                                handleOptionChange(
                                  currentQuestion,
                                  optionIndex,
                                  true
                                );
                              }}
                            />
                            <Label htmlFor={`option-${optionIndex}`}>
                              {option.text}
                            </Label>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <RadioGroup
                      value={
                        answers[currentQuestion].selectedOptionIndices.length >
                        0
                          ? answers[
                              currentQuestion
                            ].selectedOptionIndices[0].toString()
                          : undefined
                      }
                      onValueChange={(value) => {
                        handleOptionChange(
                          currentQuestion,
                          parseInt(value),
                          false
                        );
                      }}
                    >
                      {quiz.questions[currentQuestion].options.map(
                        (option, optionIndex) => (
                          <div
                            key={option._id}
                            className="flex items-center space-x-2"
                          >
                            <RadioGroupItem
                              value={optionIndex.toString()}
                              id={`option-${optionIndex}`}
                            />
                            <Label htmlFor={`option-${optionIndex}`}>
                              {option.text}
                            </Label>
                          </div>
                        )
                      )}
                    </RadioGroup>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestion === 0}
                    variant="outline"
                  >
                    Previous
                  </Button>

                  {currentQuestion < quiz.questions.length - 1 ? (
                    <Button onClick={handleNextQuestion}>Next</Button>
                  ) : (
                    <Button onClick={handleSubmitQuiz}>Submit Quiz</Button>
                  )}
                </div>
              </CardContent>
            )}
          </TabsContent>

          <TabsContent value="results">
            <CardContent>
              {quizResult ? (
                renderQuizResults()
              ) : (
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Previous Attempts
                  </h3>

                  {attempts && attempts.length > 0 ? (
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {attempts.map((attempt, index) => (
                          <div
                            key={attempt._id}
                            className="p-4 border rounded-lg"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">
                                Attempt #{attempts.length - index}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(attempt.completedAt).toLocaleString()}
                              </span>
                            </div>

                            <div className="flex items-center">
                              <div className="mr-4">
                                <span className="text-2xl font-bold">
                                  {attempt.score.toFixed(1)}%
                                </span>
                              </div>

                              {attempt.passed ? (
                                <div className="flex items-center text-green-600">
                                  <CheckCircle className="mr-1 h-5 w-5" />
                                  <span>Passed</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-red-600">
                                  <XCircle className="mr-1 h-5 w-5" />
                                  <span>Not Passed</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <p className="text-gray-500">No previous attempts</p>
                  )}
                </div>
              )}
            </CardContent>
          </TabsContent>

          <TabsContent value="certificate">
            <CardContent>
              {quizResult?.passed && course ? (
                <Certificate
                  studentName={auth?.user?.name || "Student"}
                  courseName={course?.title || "Course"}
                  quizName={quiz?.title || "Quiz"}
                  score={quizResult.score.toFixed(1)}
                  date={new Date().toLocaleDateString()}
                />
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-xl font-bold mb-4">
                    Certificate Not Available
                  </h3>
                  <p className="text-gray-500 mb-4">
                    You need to pass the quiz to receive a certificate.
                  </p>
                  <Button onClick={() => setActiveTab("quiz")}>
                    Take Quiz
                  </Button>
                </div>
              )}
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

export default StudentQuizPage;
