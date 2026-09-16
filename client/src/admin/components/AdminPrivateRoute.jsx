import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

/**
 * Protects admin routes that require admin authentication.
 * Renders children when admin is authenticated, redirects to /mQ8vR2kX9Lp7N4/login otherwise.
 * Returns null while the initial session check is in progress.
 */
const AdminPrivateRoute = ({ children }) => {
  const { isAuthenticated, sessionChecked } = useSelector(
    (state) => state.adminAuth,
  );

  if (!sessionChecked) return null;

  return isAuthenticated ? children : <Navigate to="/mQ8vR2kX9Lp7N4/login" replace />;
};

export default AdminPrivateRoute;
