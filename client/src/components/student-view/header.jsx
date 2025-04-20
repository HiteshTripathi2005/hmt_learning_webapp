import {
  GraduationCap,
  TvMinimalPlay,
  HelpCircle,
  MessageSquare,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";

function StudentViewCommonHeader() {
  const navigate = useNavigate();
  const { resetCredentials, auth } = useContext(AuthContext);

  function handleLogout() {
    resetCredentials();
    sessionStorage.clear();
    navigate("/auth");
  }

  return (
    <header className="flex items-center justify-between p-4 border-b relative">
      <div className="flex items-center space-x-4">
        <Link to="/home" className="flex items-center hover:text-black">
          <GraduationCap className="h-8 w-8 mr-4 " />
          <span className="font-extrabold md:text-xl text-[14px]">
            LMS LEARN
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              location.pathname.includes("/courses")
                ? null
                : navigate("/courses");
            }}
            className="text-[14px] md:text-[16px] font-medium hover:text-gray-600"
          >
            Explore Courses
          </button>
          <Link
            to="/discussion"
            className="flex items-center text-[14px] md:text-[16px] font-medium hover:text-gray-600"
          >
            <MessageSquare className="h-5 w-5 mr-1" />
            Discussion Forum
          </Link>
          <Link
            to="/help"
            className="flex items-center text-[14px] md:text-[16px] font-medium hover:text-gray-600"
          >
            <HelpCircle className="h-5 w-5 mr-1" />
            Help
          </Link>
          <Link
            to="/profile"
            className="flex items-center text-[14px] md:text-[16px] font-medium hover:text-gray-600"
          >
            <User className="h-5 w-5 mr-1" />
            Profile
          </Link>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {auth?.authenticate ? (
          <div className="flex gap-4 items-center">
            <div
              onClick={() => navigate("/student-courses")}
              className="flex cursor-pointer items-center gap-3"
            >
              <span className="font-extrabold md:text-xl text-[14px]">
                My Courses
              </span>
              <TvMinimalPlay className="w-8 h-8 cursor-pointer" />
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex gap-4 items-center">
            <Link to="/auth">
              <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Student Login
              </button>
            </Link>
            <Link to="/instructor/auth/login">
              <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Instructor Login
              </button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default StudentViewCommonHeader;
