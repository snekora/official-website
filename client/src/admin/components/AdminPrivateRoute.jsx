import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

/**
 * Protects admin routes that require admin authentication.
 * Renders children when admin is authenticated, redirects to /admin/login otherwise.
 * Returns null while the initial session check is in progress.
 */
const AdminPrivateRoute = ({ children }) => {
  const { isAuthenticated, sessionChecked } = useSelector(
    (state) => state.adminAuth,
  );

  if (!sessionChecked) return null;

  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

export default AdminPrivateRoute;
