import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  fetchStudentBoughtCoursesService,
  getCurrentCourseProgressService,
  generateCourseCertificateService,
} from "@/services";
import { Watch, Download, BookOpen } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function StudentCoursesPage() {
  const { auth } = useContext(AuthContext);
  const { studentBoughtCoursesList, setStudentBoughtCoursesList } =
    useContext(StudentContext);
  const [courseCompletionStatus, setCourseCompletionStatus] = useState({});
  const navigate = useNavigate();

  async function fetchStudentBoughtCourses() {
    const response = await fetchStudentBoughtCoursesService(auth?.user?._id);
    if (response?.success) {
      setStudentBoughtCoursesList(response?.data);

      // Check completion status for each course
      if (response?.data && response.data.length > 0) {
        const statusPromises = response.data.map((course) =>
          getCurrentCourseProgressService(auth?.user?._id, course.courseId)
        );

        const statusResults = await Promise.all(statusPromises);

        const completionStatus = {};
        statusResults.forEach((result, index) => {
          if (result?.success && result?.data?.completed) {
            completionStatus[response.data[index].courseId] = true;
          }
        });

        setCourseCompletionStatus(completionStatus);
      }
    }
  }

  async function handleDownloadCertificate(courseId) {
    const response = await generateCourseCertificateService(
      auth?.user?._id,
      courseId
    );

    if (!response.success) {
      toast.error(response.message);
    } else {
      toast.success("Certificate downloaded successfully");
    }
  }

  useEffect(() => {
    fetchStudentBoughtCourses();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-8">My Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {studentBoughtCoursesList && studentBoughtCoursesList.length > 0 ? (
          studentBoughtCoursesList.map((course, index) => (
            <Card key={index} className="flex flex-col">
              <CardContent className="p-4 flex-grow">
                <img
                  src={course?.courseImage}
                  alt={course?.title}
                  className="h-52 w-full object-cover rounded-md mb-4"
                />
                <h3 className="font-bold mb-1">{course?.title}</h3>
                <p className="text-sm text-gray-700 mb-2">
                  {course?.instructorName}
                </p>
                {courseCompletionStatus[course.courseId] && (
                  <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full inline-block mb-2">
                    Completed
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2 flex-wrap">
                <Button
                  onClick={() =>
                    navigate(`/course-progress/${course?.courseId}`)
                  }
                  className="flex-1"
                >
                  <Watch className="mr-2 h-4 w-4" />
                  {courseCompletionStatus[course.courseId]
                    ? "Review Course"
                    : "Start Watching"}
                </Button>
                {courseCompletionStatus[course.courseId] && (
                  <>
                    <Button
                      onClick={() => handleDownloadCertificate(course.courseId)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() =>
                        navigate(`/course-quiz/${course.courseId}`)
                      }
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          ))
        ) : (
          <h1 className="text-3xl font-bold">No Courses found</h1>
        )}
      </div>
    </div>
  );
}

export default StudentCoursesPage;
