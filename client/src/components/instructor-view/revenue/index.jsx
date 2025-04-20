import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IndianRupee, Users, TrendingUp, Calendar } from "lucide-react";

function InstructorRevenue({ listOfCourses }) {
  // Calculate metrics for revenue and students
  function calculateRevenueMetrics() {
    if (!listOfCourses || listOfCourses.length === 0) {
      return {
        totalRevenue: 0,
        totalStudents: 0,
        averageRevenuePerStudent: 0,
        courseData: [],
        monthlyData: {},
      };
    }

    // Initialize monthly data structure
    const monthlyData = {};
    const currentYear = new Date().getFullYear();
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    months.forEach((month) => {
      monthlyData[month] = {
        revenue: 0,
        students: 0,
      };
    });

    // Process course data
    const courseData = listOfCourses.map((course) => {
      const students = course.students || [];
      const revenue = students.reduce(
        (sum, student) => sum + parseFloat(student.paidAmount || 0),
        0
      );

      // Process monthly data
      students.forEach((student) => {
        const enrollmentDate = new Date(student.dateOfPurchase || Date.now());
        if (enrollmentDate.getFullYear() === currentYear) {
          const monthName = months[enrollmentDate.getMonth()];
          monthlyData[monthName].revenue += parseFloat(student.paidAmount || 0);
          monthlyData[monthName].students += 1;
        }
      });

      return {
        id: course._id,
        title: course.title,
        price: parseFloat(course.pricing || 0),
        students: students.length,
        revenue: revenue,
        averageRevenue: students.length > 0 ? revenue / students.length : 0,
      };
    });

    // Calculate totals
    const totalRevenue = courseData.reduce(
      (sum, course) => sum + course.revenue,
      0
    );
    const totalStudents = courseData.reduce(
      (sum, course) => sum + course.students,
      0
    );
    const averageRevenuePerStudent =
      totalStudents > 0 ? totalRevenue / totalStudents : 0;

    return {
      totalRevenue,
      totalStudents,
      averageRevenuePerStudent,
      courseData,
      monthlyData,
    };
  }

  const metrics = calculateRevenueMetrics();

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <IndianRupee className="h-8 w-8 text-green-500 mr-2" />
              <div className="text-3xl font-bold text-green-700">
                ₹{metrics.totalRevenue.toFixed(2)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500 mr-2" />
              <div className="text-3xl font-bold text-blue-700">
                {metrics.totalStudents}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Avg. Revenue Per Student
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500 mr-2" />
              <div className="text-3xl font-bold text-purple-700">
                ₹{metrics.averageRevenuePerStudent.toFixed(2)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Monthly Revenue & Enrollments ({new Date().getFullYear()})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Students</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(metrics.monthlyData).map(([month, data]) => (
                  <TableRow key={month}>
                    <TableCell className="font-medium">{month}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <IndianRupee className="h-4 w-4 mr-1 text-green-500" />
                        <span>₹{data.revenue.toFixed(2)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-blue-500" />
                        <span>{data.students}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Course Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Course Revenue Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Total Revenue</TableHead>
                  <TableHead>Avg. Revenue/Student</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.courseData.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">
                      {course.title}
                    </TableCell>
                    <TableCell>₹{course.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-blue-500" />
                        <span>{course.students}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <IndianRupee className="h-4 w-4 mr-1 text-green-500" />
                        <span>₹{course.revenue.toFixed(2)}</span>
                      </div>
                    </TableCell>
                    <TableCell>₹{course.averageRevenue.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default InstructorRevenue;
