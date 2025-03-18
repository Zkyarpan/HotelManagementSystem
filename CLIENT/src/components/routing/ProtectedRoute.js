// client/src/components/routing/ProtectedRoute.js
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

// For routes that need authentication
export const ProtectedRoute = () => {
  const { auth } = useContext(AuthContext);

  if (auth.loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return auth.isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

// For admin-only routes
export const AdminRoute = () => {
  const { auth } = useContext(AuthContext);

  if (auth.loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return auth.isAuthenticated && auth.user.role === "admin" ? (
    <Outlet />
  ) : (
    <Navigate to="/unauthorized" />
  );
};

// For non-authenticated routes (login, register)
export const PublicRoute = () => {
  const { auth } = useContext(AuthContext);

  if (auth.loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return !auth.isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" />;
};
