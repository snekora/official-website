const authService = require("./auth.service");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

const googleLogin = asyncHandler(async (req, res, next) => {
  const { code } = req.body;

  if (!code) {
    throw new ApiError(400, "Google authorization code is required");
  }

  const { user, token } = await authService.googleLogin(code);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json(
    ApiResponse.success({ user, token }, "Login successful")
  );
});

/**
 * Returns the currently authenticated user.
 * Relies on the `authenticate` middleware having already
 * verified the JWT and attached `req.user`.
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(
    ApiResponse.success({ user: req.user }, "User fetched successfully")
  );
});

/**
 * Logs out the user by clearing the HTTP-only token cookie.
 */
const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    expires: new Date(0),
  });

  res.status(200).json(
    ApiResponse.success(null, "Logged out successfully")
  );
});

module.exports = {
  googleLogin,
  getMe,
  logout,
};
