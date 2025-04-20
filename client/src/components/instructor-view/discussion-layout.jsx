import InstructorSidebar from "./sidebar";
import { useLocation } from "react-router-dom";

function DiscussionLayout({ children }) {
  const location = useLocation();
  const isDiscussionPage = location.pathname === "/instructor/discussion";

  return (
    <div className="flex h-full min-h-screen bg-gray-100">
      <InstructorSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {isDiscussionPage && (
            <h1 className="text-3xl font-bold mb-8">Discussion Forum</h1>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}

export default DiscussionLayout;
