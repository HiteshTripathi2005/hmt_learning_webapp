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
  IndianRupee,
  Users,
  TrendingUp,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";

function InstructorDashboard({ listOfCourses }) {
  function calculateDashboardMetrics() {
    const { totalStudents, totalRevenue, studentList, courseRevenue } =
      listOfCourses.reduce(
        (acc, course) => {
          const studentCount = course.students.length;
          const courseTotal = course.students.reduce((sum, student) => {
            return sum + parseFloat(student.paidAmount || 0);
          }, 0);

          acc.totalStudents += studentCount;
          acc.totalRevenue += courseTotal;
          acc.courseRevenue.push({
            courseTitle: course.title,
            revenue: courseTotal,
            students: studentCount,
            averageRevenue: studentCount > 0 ? courseTotal / studentCount : 0,
          });

          course.students.forEach((student) => {
            acc.studentList.push({
              courseTitle: course.title,
              studentName: student.studentName,
              studentEmail: student.studentEmail,
              paidAmount: student.paidAmount,
              coursePricing: course.pricing,
            });
          });

          return acc;
        },
        {
          totalStudents: 0,
          totalRevenue: 0,
          studentList: [],
          courseRevenue: [],
        }
      );

    return {
      totalRevenue,
      totalStudents,
      studentList,
      courseRevenue,
      averageRevenuePerStudent:
        totalStudents > 0 ? totalRevenue / totalStudents : 0,
    };
  }

  const metrics = calculateDashboardMetrics();

  const config = [
    {
      icon: Users,
      label: "Total Students",
      value: metrics.totalStudents,
      color: "bg-blue-50 text-blue-700",
      iconColor: "text-blue-500",
      growth: metrics.totalStudents > 0 ? "+100%" : "0%",
    },
    {
      icon: IndianRupee,
      label: "Total Revenue",
      value: `₹${metrics.totalRevenue.toFixed(2)}`,
      color: "bg-green-50 text-green-700",
      iconColor: "text-green-500",
      growth: metrics.totalRevenue > 0 ? "+100%" : "0%",
    },
    {
      icon: TrendingUp,
      label: "Avg. Revenue/Student",
      value: `₹${metrics.averageRevenuePerStudent.toFixed(2)}`,
      color: "bg-purple-50 text-purple-700",
      iconColor: "text-purple-500",
      growth: metrics.averageRevenuePerStudent > 0 ? "+100%" : "0%",
    },
    {
      icon: BookOpen,
      label: "Total Courses",
      value: listOfCourses.length,
      color: "bg-amber-50 text-amber-700",
      iconColor: "text-amber-500",
      growth: listOfCourses.length > 0 ? "+100%" : "0%",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {config.map((item, index) => (
          <Card key={index} className={`${item.color} border-none shadow-md`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.label}
              </CardTitle>
              <div className={`p-2 rounded-full ${item.color}`}>
                <item.icon className={`h-5 w-5 ${item.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <div className="flex items-center text-xs mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                <span>{item.growth} from start</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue by Course</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Total Revenue</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Avg. Revenue/Student</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.courseRevenue.map((course, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {course.courseTitle}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <IndianRupee className="h-4 w-4 mr-1 text-green-500" />
                        <span>₹{course.revenue.toFixed(2)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-blue-500" />
                        <span>{course.students}</span>
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

      <Card>
        <CardHeader>
          <CardTitle>Recent Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Student Email</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Course Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.studentList.slice(0, 5).map((studentItem, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {studentItem.courseTitle}
                    </TableCell>
                    <TableCell>{studentItem.studentName}</TableCell>
                    <TableCell>{studentItem.studentEmail}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <IndianRupee className="h-4 w-4 mr-1 text-green-500" />
                        <span>
                          ₹{parseFloat(studentItem.paidAmount || 0).toFixed(2)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      ₹{parseFloat(studentItem.coursePricing || 0).toFixed(2)}
                    </TableCell>
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

export default InstructorDashboard;
