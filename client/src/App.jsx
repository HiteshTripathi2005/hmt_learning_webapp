import { Route, Routes } from "react-router-dom";
import AuthPage from "./pages/auth";
import RouteGuard from "./components/route-guard";
import { useContext } from "react";
import { AuthContext } from "./context/auth-context";
import InstructorDashboardpage from "./pages/instructor";
import StudentViewCommonLayout from "./components/student-view/common-layout";
import StudentHomePage from "./pages/student/home";
import NotFoundPage from "./pages/not-found";
import AddNewCoursePage from "./pages/instructor/add-new-course";
import StudentViewCoursesPage from "./pages/student/courses";
import StudentViewCourseDetailsPage from "./pages/student/course-details";
import RazorpayPaymentReturnPage from "./pages/student/payment-return";
import StudentCoursesPage from "./pages/student/student-courses";
import StudentViewCourseProgressPage from "./pages/student/course-progress";
import StudentQuizPage from "./pages/student/quiz";
import InstructorLoginPage from "./pages/instructor/auth/login";
import InstructorRegisterPage from "./pages/instructor/auth/register";
import { Toaster } from "react-hot-toast";
import HelpPage from "./pages/student/help/HelpPage";
import ManageHelpTickets from "./pages/admin/help/ManageHelpTickets";
import InstructorTicketsPage from "./pages/instructor/tickets";
import InstructorQuizzesPage from "./pages/instructor/quizzes";
import QuizFormPage from "./pages/instructor/quizzes/quiz-form";
import DiscussionForum from "./pages/DiscussionForum";
import InstructorDiscussionForum from "./pages/instructor/discussion";
import ProfilePage from "./pages/profile";

function App() {
  const { auth } = useContext(AuthContext);

  return (
    <div>
      <Routes>
        <Route
          path="/auth"
          element={
            <RouteGuard
              element={<AuthPage />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        />
        <Route
          path="/instructor"
          element={
            <RouteGuard
              element={<InstructorDashboardpage />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        />
        <Route
          path="/instructor/auth/login"
          element={
            <RouteGuard
              element={<InstructorLoginPage />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        />
        <Route
          path="/instructor/auth/register"
          element={
            <RouteGuard
              element={<InstructorRegisterPage />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        />
        <Route
          path="/instructor/create-new-course"
          element={
            <RouteGuard
              element={<AddNewCoursePage />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        />
        <Route
          path="/instructor/edit-course/:courseId"
          element={
            <RouteGuard
              element={<AddNewCoursePage />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        />
        <Route
          path="/instructor/tickets"
          element={
            <RouteGuard
              element={<InstructorTicketsPage />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        />
        <Route
          path="/admin/help"
          element={
            <RouteGuard
              element={<ManageHelpTickets />}
              authenticated={auth?.authenticate}
              user={auth?.user}
              adminOnly={true}
            />
          }
        />
        <Route
          path="/instructor/quizzes"
          element={
            <RouteGuard
              element={<InstructorQuizzesPage />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        />
        <Route
          path="/instructor/quizzes/create/:courseId"
          element={
            <RouteGuard
              element={<QuizFormPage />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        />
        <Route
          path="/instructor/quizzes/edit/:quizId"
          element={
            <RouteGuard
              element={<QuizFormPage />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        />
        <Route
          path="/instructor/discussion"
          element={
            <RouteGuard
              element={<InstructorDiscussionForum />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        />
        <Route
          path="/"
          element={
            <RouteGuard
              element={<StudentViewCommonLayout />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        >
          <Route path="" element={<StudentHomePage />} />
          <Route path="home" element={<StudentHomePage />} />
          <Route path="courses" element={<StudentViewCoursesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route
            path="course/details/:id"
            element={<StudentViewCourseDetailsPage />}
          />
          <Route
            path="payment-return"
            element={<RazorpayPaymentReturnPage />}
          />
          <Route path="student-courses" element={<StudentCoursesPage />} />
          <Route
            path="course-progress/:id"
            element={<StudentViewCourseProgressPage />}
          />
          <Route path="course-quiz/:courseId" element={<StudentQuizPage />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="discussion" element={<DiscussionForum />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
