import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

/**
 * Protects routes that require authentication.
 * Renders children when authenticated, redirects to /login otherwise.
 * Returns null while the initial session check is in progress.
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, sessionChecked } = useSelector(
    (state) => state.auth,
  );

  if (!sessionChecked) return null;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
