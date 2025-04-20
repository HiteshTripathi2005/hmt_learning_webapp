import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AuthContext } from "@/context/auth-context";
import {
  getQuizzesByCourseService,
  fetchInstructorCourseListService,
  deleteQuizService,
} from "@/services";
import { PlusCircle, Edit, Trash2, BookOpen } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import InstructorSidebar from "@/components/instructor-view/sidebar";

function InstructorQuizzesPage() {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Get courseId from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const courseIdFromUrl = queryParams.get("courseId");

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchQuizzes(selectedCourse._id);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    setLoading(true);
    const response = await fetchInstructorCourseListService();

    if (response.success) {
      setCourses(response.data);

      // If we have a courseId from URL and courses are loaded, select that course
      if (courseIdFromUrl && response.data.length > 0) {
        const courseFromUrl = response.data.find(
          (course) => course._id === courseIdFromUrl
        );
        if (courseFromUrl) {
          setSelectedCourse(courseFromUrl);
        } else {
          // If the courseId from URL doesn't match any course, select the first one
          setSelectedCourse(response.data[0]);
        }
      } else if (response.data.length > 0) {
        // Default to first course if no courseId in URL
        setSelectedCourse(response.data[0]);
      }
    } else {
      toast.error("Failed to fetch courses");
    }

    setLoading(false);
  };

  const fetchQuizzes = async (courseId) => {
    setLoading(true);
    const response = await getQuizzesByCourseService(courseId);

    if (response.success) {
      setQuizzes(response.data);
    } else {
      toast.error("Failed to fetch quizzes");
      setQuizzes([]);
    }

    setLoading(false);
  };

  const handleCreateQuiz = () => {
    if (!selectedCourse) {
      toast.error("Please select a course first");
      return;
    }

    navigate(`/instructor/quizzes/create/${selectedCourse._id}`);
  };

  const handleEditQuiz = (quizId) => {
    navigate(`/instructor/quizzes/edit/${quizId}`);
  };

  const handleDeleteQuiz = (quizId) => {
    setQuizToDelete(quizId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteQuiz = async () => {
    if (!quizToDelete) return;

    setDeleting(true);
    const response = await deleteQuizService(quizToDelete);

    if (response.success) {
      toast.success("Quiz deleted successfully");
      // Refresh the quizzes list
      if (selectedCourse) {
        fetchQuizzes(selectedCourse._id);
      }
    } else {
      toast.error(response.message || "Failed to delete quiz");
    }

    setDeleting(false);
    setDeleteDialogOpen(false);
    setQuizToDelete(null);
  };

  if (loading && courses.length === 0) {
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Manage Quizzes</h1>
            <Button onClick={handleCreateQuiz}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Quiz
            </Button>
          </div>

          {courses.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <h2 className="text-2xl font-bold mb-4">No Courses Found</h2>
                  <p className="text-gray-500 mb-4">
                    You need to create a course before you can add quizzes.
                  </p>
                  <Button
                    onClick={() => navigate("/instructor/create-new-course")}
                  >
                    Create Course
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Select Course
                </label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedCourse?._id || ""}
                  onChange={(e) => {
                    const course = courses.find(
                      (c) => c._id === e.target.value
                    );
                    setSelectedCourse(course);
                  }}
                >
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCourse && (
                <div>
                  <h2 className="text-xl font-bold mb-4">
                    Quizzes for {selectedCourse.title}
                  </h2>

                  {quizzes.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center py-8">
                          <h3 className="text-xl font-bold mb-4">
                            No Quizzes Found
                          </h3>
                          <p className="text-gray-500 mb-4">
                            You haven't created any quizzes for this course yet.
                          </p>
                          <Button onClick={handleCreateQuiz}>
                            Create First Quiz
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {quizzes.map((quiz) => (
                        <Card key={quiz._id}>
                          <CardHeader className="pb-2">
                            <CardTitle className="flex items-center">
                              <BookOpen className="mr-2 h-5 w-5" />
                              {quiz.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-500 mb-4">
                              {quiz.description || "No description provided"}
                            </p>
                            <div className="text-sm mb-4">
                              <div className="flex justify-between mb-1">
                                <span>Questions:</span>
                                <span>{quiz.questions.length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Passing Score:</span>
                                <span>{quiz.passingScore}%</span>
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditQuiz(quiz._id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteQuiz(quiz._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Quiz</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this quiz? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteQuiz}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Deleting...
                    </>
                  ) : (
                    "Delete Quiz"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}

export default InstructorQuizzesPage;
