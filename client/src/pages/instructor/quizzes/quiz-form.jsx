import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthContext } from "@/context/auth-context";
import {
  createQuizService,
  getQuizByIdService,
  updateQuizService,
  fetchInstructorCourseDetailsService,
} from "@/services";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import InstructorSidebar from "@/components/instructor-view/sidebar";

function QuizFormPage() {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const { courseId, quizId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    passingScore: 70,
    questions: [],
  });

  useEffect(() => {
    if (courseId) {
      fetchCourse(courseId);
    }

    if (quizId) {
      fetchQuiz(quizId);
    } else {
      setLoading(false);
    }
  }, [courseId, quizId]);

  const fetchCourse = async (id) => {
    const response = await fetchInstructorCourseDetailsService(id);

    if (response.success) {
      setCourse(response.data);
    } else {
      toast.error("Failed to fetch course details");
      navigate("/instructor/quizzes");
    }
  };

  const fetchQuiz = async (id) => {
    setLoading(true);
    const response = await getQuizByIdService(id);

    if (response.success) {
      setFormData(response.data);

      // Also fetch the course
      if (response.data.courseId) {
        fetchCourse(response.data.courseId);
      }
    } else {
      toast.error("Failed to fetch quiz");
      navigate("/instructor/quizzes");
    }

    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          questionText: "",
          options: [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
          explanation: "",
        },
      ],
    });
  };

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions.splice(index, 1);

    setFormData({
      ...formData,
      questions: updatedQuestions,
    });
  };

  const handleQuestionChange = (index, e) => {
    const { name, value } = e.target;
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index][name] = value;

    setFormData({
      ...formData,
      questions: updatedQuestions,
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, e) => {
    const { name, value } = e.target;
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options[optionIndex][name] = value;

    setFormData({
      ...formData,
      questions: updatedQuestions,
    });
  };

  const handleOptionCorrectChange = (questionIndex, optionIndex, checked) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options[optionIndex].isCorrect = checked;

    setFormData({
      ...formData,
      questions: updatedQuestions,
    });
  };

  const handleAddOption = (questionIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options.push({
      text: "",
      isCorrect: false,
    });

    setFormData({
      ...formData,
      questions: updatedQuestions,
    });
  };

  const handleRemoveOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);

    setFormData({
      ...formData,
      questions: updatedQuestions,
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Quiz title is required");
      return false;
    }

    if (formData.questions.length === 0) {
      toast.error("At least one question is required");
      return false;
    }

    for (let i = 0; i < formData.questions.length; i++) {
      const question = formData.questions[i];

      if (!question.questionText.trim()) {
        toast.error(`Question ${i + 1} text is required`);
        return false;
      }

      if (question.options.length < 2) {
        toast.error(`Question ${i + 1} must have at least 2 options`);
        return false;
      }

      const hasCorrectOption = question.options.some(
        (option) => option.isCorrect
      );
      if (!hasCorrectOption) {
        toast.error(`Question ${i + 1} must have at least one correct option`);
        return false;
      }

      for (let j = 0; j < question.options.length; j++) {
        if (!question.options[j].text.trim()) {
          toast.error(`Option ${j + 1} in Question ${i + 1} text is required`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    const quizData = {
      ...formData,
      courseId: courseId || formData.courseId,
    };

    let response;

    if (quizId) {
      response = await updateQuizService(quizId, quizData);
    } else {
      response = await createQuizService(quizData);
    }

    setSaving(false);

    if (response.success) {
      toast.success(
        quizId ? "Quiz updated successfully" : "Quiz created successfully"
      );
      navigate("/instructor/quizzes");
    } else {
      toast.error(response.message || "Failed to save quiz");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-screen bg-gray-100">
      <InstructorSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Button
            onClick={() => navigate("/instructor/quizzes")}
            className="mb-6"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quizzes
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>{quizId ? "Edit Quiz" : "Create New Quiz"}</CardTitle>
              {course && (
                <p className="text-sm text-gray-500">Course: {course.title}</p>
              )}
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="title">Quiz Title</Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter quiz title"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">
                        Description (Optional)
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter quiz description"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="passingScore">Passing Score (%)</Label>
                      <Input
                        id="passingScore"
                        name="passingScore"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.passingScore}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Questions</h3>
                      <Button
                        type="button"
                        onClick={handleAddQuestion}
                        variant="outline"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Question
                      </Button>
                    </div>

                    {formData.questions.length === 0 ? (
                      <div className="text-center py-8 border rounded-md">
                        <p className="text-gray-500 mb-4">
                          No questions added yet
                        </p>
                        <Button
                          type="button"
                          onClick={handleAddQuestion}
                          variant="outline"
                        >
                          Add Your First Question
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {formData.questions.map((question, questionIndex) => (
                          <Card key={questionIndex}>
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-start mb-4">
                                <h4 className="font-medium">
                                  Question {questionIndex + 1}
                                </h4>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() =>
                                    handleRemoveQuestion(questionIndex)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor={`question-${questionIndex}`}>
                                    Question Text
                                  </Label>
                                  <Textarea
                                    id={`question-${questionIndex}`}
                                    name="questionText"
                                    value={question.questionText}
                                    onChange={(e) =>
                                      handleQuestionChange(questionIndex, e)
                                    }
                                    placeholder="Enter question text"
                                    required
                                  />
                                </div>

                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <Label>Options</Label>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleAddOption(questionIndex)
                                      }
                                    >
                                      <Plus className="mr-1 h-3 w-3" />
                                      Add Option
                                    </Button>
                                  </div>

                                  {question.options.map(
                                    (option, optionIndex) => (
                                      <div
                                        key={optionIndex}
                                        className="flex items-center space-x-2 mb-2"
                                      >
                                        <Checkbox
                                          id={`option-correct-${questionIndex}-${optionIndex}`}
                                          checked={option.isCorrect}
                                          onCheckedChange={(checked) =>
                                            handleOptionCorrectChange(
                                              questionIndex,
                                              optionIndex,
                                              checked
                                            )
                                          }
                                        />
                                        <Input
                                          name="text"
                                          value={option.text}
                                          onChange={(e) =>
                                            handleOptionChange(
                                              questionIndex,
                                              optionIndex,
                                              e
                                            )
                                          }
                                          placeholder={`Option ${
                                            optionIndex + 1
                                          }`}
                                          className="flex-1"
                                        />
                                        {question.options.length > 2 && (
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() =>
                                              handleRemoveOption(
                                                questionIndex,
                                                optionIndex
                                              )
                                            }
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        )}
                                      </div>
                                    )
                                  )}
                                  <p className="text-xs text-gray-500 mt-1">
                                    Check the box for correct option(s)
                                  </p>
                                </div>

                                <div>
                                  <Label
                                    htmlFor={`explanation-${questionIndex}`}
                                  >
                                    Explanation (Optional)
                                  </Label>
                                  <Textarea
                                    id={`explanation-${questionIndex}`}
                                    name="explanation"
                                    value={question.explanation}
                                    onChange={(e) =>
                                      handleQuestionChange(questionIndex, e)
                                    }
                                    placeholder="Explain the correct answer (shown after quiz completion)"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="w-full md:w-auto"
                    >
                      {saving ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Saving...
                        </div>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {quizId ? "Update Quiz" : "Create Quiz"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default QuizFormPage;
