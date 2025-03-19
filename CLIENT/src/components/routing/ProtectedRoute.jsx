import React, { useContext, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// Loading component
const LoadingScreen = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    <span className="ml-3">Loading...</span>
  </div>
);

// Protected route for any authenticated user
export const ProtectedRoute = () => {
  const { auth } = useContext(AuthContext);
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setChecking(false);

      // Debug log
      console.log("ProtectedRoute check:", {
        isAuthenticated: auth.isAuthenticated,
        loading: auth.loading,
        user: auth.user,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [auth]);

  // Show loading screen while auth is loading or during our check
  if (auth.loading || checking) {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the child routes
  return <Outlet />;
};

// Admin-only route
export const AdminRoute = () => {
  const { auth } = useContext(AuthContext);
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setChecking(false);

      // Debug log with detailed info
      console.log("AdminRoute check:", {
        isAuthenticated: auth.isAuthenticated,
        loading: auth.loading,
        user: auth.user,
        role: auth.user?.role,
        isAdmin: auth.user?.role?.toLowerCase() === "admin",
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [auth]);

  // Show loading screen while auth is loading or during our check
  if (auth.loading || checking) {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has admin role (case-insensitive check)
  const isAdmin =
    auth.user &&
    typeof auth.user.role === "string" &&
    auth.user.role.toLowerCase() === "admin";

  // Redirect to unauthorized page if not an admin
  if (!isAdmin) {
    console.log("User is not admin, redirecting to unauthorized");
    return <Navigate to="/unauthorized" replace />;
  }

  // User is an admin, render the child routes
  return <Outlet />;
};
