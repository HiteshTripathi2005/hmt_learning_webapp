import { Button } from "@/components/ui/button";
import { AuthContext } from "@/context/auth-context";
import {
  BarChart,
  Book,
  LogOut,
  TicketIcon,
  IndianRupee,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function InstructorSidebar() {
  const { resetCredentials } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active route based on current path
  const currentPath = location.pathname;

  const menuItems = [
    {
      icon: BarChart,
      label: "Dashboard",
      path: "/instructor",
      value: "dashboard",
    },
    {
      icon: Book,
      label: "Courses",
      path: "/instructor",
      value: "courses",
    },
    {
      icon: BookOpen,
      label: "Quizzes",
      path: "/instructor/quizzes",
      value: "quizzes",
    },
    {
      icon: IndianRupee,
      label: "Revenue & Analytics",
      path: "/instructor",
      value: "revenue",
    },
    {
      icon: TicketIcon,
      label: "Help Tickets",
      path: "/instructor/tickets",
      value: "tickets",
    },
    {
      icon: MessageSquare,
      label: "Discussion Forum",
      path: "/instructor/discussion",
    },
    {
      icon: LogOut,
      label: "Logout",
      path: "/auth",
      value: "logout",
    },
  ];

  function handleLogout() {
    resetCredentials();
    sessionStorage.clear();
    navigate("/auth");
  }

  function isActive(menuItem) {
    if (menuItem.value === "dashboard" && currentPath === "/instructor") {
      return true;
    }
    if (
      menuItem.path === "/instructor" &&
      menuItem.value === "courses" &&
      currentPath === "/instructor"
    ) {
      return false; // Don't highlight courses on dashboard
    }
    return (
      currentPath.includes(menuItem.path) && menuItem.path !== "/instructor"
    );
  }

  function handleNavigation(menuItem) {
    if (menuItem.value === "logout") {
      handleLogout();
      return;
    }

    if (menuItem.path === "/instructor") {
      if (menuItem.value === "dashboard") {
        navigate("/instructor");
      } else {
        // For tabs within the main instructor page
        navigate("/instructor", { state: { activeTab: menuItem.value } });
      }
    } else {
      navigate(menuItem.path);
    }
  }

  return (
    <aside className="w-64 bg-white shadow-md hidden md:block h-screen">
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Instructor View</h2>
        <nav>
          {menuItems.map((menuItem) => (
            <Button
              className="w-full justify-start mb-2"
              key={menuItem.value}
              variant={isActive(menuItem) ? "secondary" : "ghost"}
              onClick={() => handleNavigation(menuItem)}
            >
              <menuItem.icon className="mr-2 h-4 w-4" />
              {menuItem.label}
            </Button>
          ))}
        </nav>
      </div>
    </aside>
  );
}

export default InstructorSidebar;
