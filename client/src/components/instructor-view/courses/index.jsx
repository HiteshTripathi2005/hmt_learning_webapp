import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  courseCurriculumInitialFormData,
  courseLandingInitialFormData,
} from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import { Delete, Edit, Users, IndianRupee, FileQuestion } from "lucide-react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

function InstructorCourses({ listOfCourses }) {
  const navigate = useNavigate();
  const {
    setCurrentEditedCourseId,
    setCourseLandingFormData,
    setCourseCurriculumFormData,
  } = useContext(InstructorContext);

  // Calculate revenue for each course
  const calculateCourseRevenue = (students) => {
    return students.reduce((total, student) => {
      return total + parseFloat(student.paidAmount || 0);
    }, 0);
  };

  return (
    <Card>
      <CardHeader className="flex justify-between flex-row items-center">
        <CardTitle className="text-3xl font-extrabold">All Courses</CardTitle>
        <Button
          onClick={() => {
            setCurrentEditedCourseId(null);
            setCourseLandingFormData(courseLandingInitialFormData);
            setCourseCurriculumFormData(courseCurriculumInitialFormData);
            navigate("/instructor/create-new-course");
          }}
          className="p-6"
        >
          Create New Course
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listOfCourses && listOfCourses.length > 0
                ? listOfCourses.map((course) => {
                    const revenue = calculateCourseRevenue(
                      course?.students || []
                    );
                    return (
                      <TableRow key={course?._id}>
                        <TableCell className="font-medium">
                          {course?.title}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-blue-500" />
                            <span>{course?.students?.length || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <IndianRupee className="h-4 w-4 mr-2 text-green-500" />
                            <span>₹{revenue.toFixed(2)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <IndianRupee className="h-4 w-4 mr-2 text-green-500" />
                            <span>
                              ₹{parseFloat(course?.pricing || 0).toFixed(2)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={() => {
                              navigate(
                                `/instructor/edit-course/${course?._id}`
                              );
                            }}
                            variant="ghost"
                            size="sm"
                            title="Edit Course"
                          >
                            <Edit className="h-6 w-6" />
                          </Button>
                          <Button
                            onClick={() => {
                              navigate(
                                `/instructor/quizzes?courseId=${course?._id}`
                              );
                            }}
                            variant="ghost"
                            size="sm"
                            title="Manage Quizzes"
                          >
                            <FileQuestion className="h-6 w-6 text-purple-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Delete Course"
                          >
                            <Delete className="h-6 w-6" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                : null}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default InstructorCourses;
