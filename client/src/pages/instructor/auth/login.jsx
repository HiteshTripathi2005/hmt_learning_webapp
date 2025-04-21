import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/auth-context";
import toast from "react-hot-toast";
import { GraduationCap } from "lucide-react";
import axiosInstance from "@/api/axiosInstance";

const InstructorLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { auth, checkAuthUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      // Create the login data object directly
      const loginData = {
        userEmail: email.trim(),
        password,
        role: "instructor",
      };

      // Validate again before proceeding
      if (!loginData.userEmail || !loginData.password) {
        toast.error("Please enter email and password");
        setLoading(false);
        return;
      }

      console.log("Login data:", { ...loginData, password: "***" });

      // Call the API directly
      const response = await axiosInstance.post("/auth/login", loginData);
      const data = response.data;

      if (data && data.success) {
        // Store the token
        sessionStorage.setItem(
          "accessToken",
          JSON.stringify(data.data.accessToken)
        );

        // Update the auth context manually
        // We'll use the checkAuthUser function to refresh the auth state
        await checkAuthUser();

        toast.success("Login successful!");
        navigate("/instructor");
      } else {
        toast.error(data?.message || "Login failed");
      }
    } catch (error) {
      // Only handle actual errors here
      console.error("Login error:", error);

      if (error?.response?.data) {
        toast.error(error.response.data.message || "Login failed");
      } else if (error?.request) {
        toast.error("No response from server");
      } else if (error?.message) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center justify-between border-b">
        <Link to={"/"} className="flex items-center justify-center">
          <GraduationCap className="h-8 w-8 mr-4" />
          <span className="font-extrabold text-xl">LMS LEARN</span>
        </Link>
        <div className="flex items-center justify-center gap-4">
          <Link
            to={"/instructor/auth/login"}
            className="flex items-center justify-center"
          >
            <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              Instructor Login
            </button>
          </Link>
          <Link to={"/auth"} className="flex items-center justify-center">
            <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              Student Login
            </button>
          </Link>
        </div>
      </header>
      <div className="flex items-center justify-center flex-1 bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your instructor account
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/instructor/auth/register"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorLoginPage;
