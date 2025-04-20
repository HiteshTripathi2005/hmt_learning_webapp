import { Navigate, useLocation } from "react-router-dom";
import { Fragment } from "react";

function RouteGuard({ authenticated, user, element, adminOnly }) {
  const location = useLocation();

  console.log("RouteGuard state:", {
    authenticated,
    user,
    path: location.pathname,
  });

  // If not authenticated and trying to access protected routes
  if (!authenticated && !location.pathname.includes("/auth")) {
    console.log("Not authenticated, redirecting to auth");
    return <Navigate to="/auth" />;
  }

  // If trying to access admin-only routes without admin role
  if (adminOnly && user?.role !== "admin") {
    console.log("Non-admin trying to access admin routes, redirecting to home");
    return <Navigate to="/home" />;
  }

  // If authenticated as student and trying to access instructor routes
  if (
    authenticated &&
    user?.role !== "instructor" &&
    (location.pathname.includes("instructor") ||
      location.pathname.includes("/auth"))
  ) {
    console.log(
      "Student trying to access instructor routes, redirecting to home"
    );
    return <Navigate to="/home" />;
  }

  // If authenticated as instructor and trying to access student routes
  if (
    authenticated &&
    user?.role === "instructor" &&
    !location.pathname.includes("instructor")
  ) {
    console.log(
      "Instructor trying to access student routes, redirecting to instructor dashboard"
    );
    return <Navigate to="/instructor" />;
  }

  // If authenticated and trying to access auth pages
  if (authenticated && location.pathname.includes("/auth")) {
    console.log(
      "Authenticated user trying to access auth pages, redirecting based on role"
    );
    return (
      <Navigate to={user?.role === "instructor" ? "/instructor" : "/home"} />
    );
  }

  return <Fragment>{element}</Fragment>;
}

export default RouteGuard;
