const jwt = require("jsonwebtoken");
const User = require("../modules/users/user.model");
const Admin = require("../modules/users/admin.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Authentication middleware.
 *
 * Extracts JWT from:
 *   1. HTTP-only cookie (`req.cookies.token`)  — primary method
 *   2. Authorization header (`Bearer <token>`) — fallback for API clients
 *
 * Verifies the token, fetches the user from the database,
 * and attaches the user object to `req.user`.
 *
 * @throws {ApiError} 401 if token is missing, invalid, expired, or user not found
 */
const authenticate = asyncHandler(async (req, res, next) => {
  try {
    let token;

    // 1. Check cookies first (primary method for browser clients)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Fallback to Authorization header (for API/mobile clients)
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new ApiError(401, "Authentication required. Please log in.");
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user and attach to request
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(
        401,
        "User associated with this token no longer exists",
      );
    }

    req.user = user;
    next();
  } catch (error) {
    // Handle specific JWT errors with clear messages
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid token. Please log in again.");
    }
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Token has expired. Please log in again.");
    }

    throw error;
  }
});

/**
 * Admin authentication middleware.
 *
 * Extracts JWT from:
 *   1. HTTP-only cookie (`req.cookies.admin_token`)  — primary method
 *   2. Authorization header (`Bearer <token>`) — fallback for API clients
 *
 * Verifies the token has `role: "admin"`, fetches the admin from
 * the database, and attaches the admin object to `req.admin`.
 *
 * @throws {ApiError} 401 if token is missing, invalid, expired, or admin not found
 * @throws {ApiError} 403 if the token does not belong to an admin
 */
const authenticateAdmin = asyncHandler(async (req, res, next) => {
  try {
    let token;

    // 1. Check cookies first (admin uses a separate cookie)
    if (req.cookies && req.cookies.admin_token) {
      token = req.cookies.admin_token;
    }
    // 2. Fallback to Authorization header
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new ApiError(401, "Admin authentication required. Please log in.");
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure the token was issued for an admin
    if (decoded.role !== "admin") {
      throw new ApiError(403, "Access denied. Admin privileges required.");
    }

    // Fetch the admin and attach to request
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      throw new ApiError(
        401,
        "Admin associated with this token no longer exists",
      );
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid token. Please log in again.");
    }
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Token has expired. Please log in again.");
    }

    throw error;
  }
});

module.exports = {
  authenticate,
  authenticateAdmin,
};
