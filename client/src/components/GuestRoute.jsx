import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

/**
 * Protects guest-only routes (e.g. /login).
 * Redirects authenticated users to "/" so they can't visit login again.
 * Returns null while the initial session check is in progress.
 */
const GuestRoute = ({ children }) => {
  const { isAuthenticated, sessionChecked } = useSelector(
    (state) => state.auth,
  );

  if (!sessionChecked) return null;

  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

export default GuestRoute;
