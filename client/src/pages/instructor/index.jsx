import InstructorCourses from "@/components/instructor-view/courses";
import InstructorDashboard from "@/components/instructor-view/dashboard";
import InstructorSidebar from "@/components/instructor-view/sidebar";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AuthContext } from "@/context/auth-context";
import { InstructorContext } from "@/context/instructor-context";
import { fetchInstructorCourseListService } from "@/services";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import InstructorRevenue from "@/components/instructor-view/revenue";

function InstructorDashboardpage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { instructorCoursesList, setInstructorCoursesList } =
    useContext(InstructorContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we have a state with activeTab from navigation
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // Clear the state to avoid persisting the tab selection
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  async function fetchAllCourses() {
    const response = await fetchInstructorCourseListService();
    if (response?.success) setInstructorCoursesList(response?.data);
  }

  useEffect(() => {
    fetchAllCourses();
  }, []);

  const menuItems = [
    {
      value: "dashboard",
      component: <InstructorDashboard listOfCourses={instructorCoursesList} />,
    },
    {
      value: "courses",
      component: <InstructorCourses listOfCourses={instructorCoursesList} />,
    },
    {
      value: "revenue",
      component: <InstructorRevenue listOfCourses={instructorCoursesList} />,
    },
    {
      value: "discussion",
      component: (
        <div className="flex justify-center items-center h-full">
          <button
            onClick={() => navigate("/instructor/discussion")}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Go to Discussion Forum
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-full min-h-screen bg-gray-100">
      <InstructorSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">
            {activeTab === "dashboard" && "Dashboard"}
            {activeTab === "courses" && "Courses"}
            {activeTab === "revenue" && "Revenue & Analytics"}
          </h1>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {menuItems.map((menuItem) => (
              <TabsContent value={menuItem.value} key={menuItem.value}>
                {menuItem.component}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
}

export default InstructorDashboardpage;
