import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/auth-context";
import axiosInstance from "@/config/axios";
import { toast } from "react-hot-toast";

const ProfilePage = () => {
  const { auth } = useContext(AuthContext);
  const [userCourses, setUserCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserCourses();
  }, []);

  const fetchUserCourses = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/courses/user-courses");
      if (response.data?.success) {
        setUserCourses(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching user courses:", error);
      toast.error("Failed to fetch your courses");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-600">
                {auth.user?.userName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{auth.user?.userName}</h1>
              <p className="text-gray-600 capitalize">{auth.user?.role}</p>
              <p className="text-gray-500">{auth.user?.email}</p>
            </div>
          </div>
        </div>

        {/* User Courses */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Your Courses</h2>
          {userCourses.length === 0 ? (
            <p className="text-gray-500">
              You haven't enrolled in any courses yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userCourses.map((course) => (
                <div
                  key={course._id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {course.description?.slice(0, 100)}...
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Instructor: {course.instructorName}
                    </span>
                    <span className="text-sm font-medium text-blue-600">
                      {course.pricing === 0 ? "Free" : `₹${course.pricing}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-bold mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700">Account Created</h3>
              <p className="text-gray-600">
                {new Date(auth.user?.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Last Updated</h3>
              <p className="text-gray-600">
                {new Date(auth.user?.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
