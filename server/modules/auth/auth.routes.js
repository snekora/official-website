const express = require("express");
const authController = require("./auth.controller");
const { authenticate } = require("../../middleware/auth.middleware");

const router = express.Router();

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate user via Google authorization code (Auth Code Flow)
 * @access  Public
 * @body    { code: string } - One-time authorization code from Google
 */
router.post("/google", authController.googleLogin);

/**
 * @route   GET /api/auth/me
 * @desc    Return the currently authenticated user
 * @access  Private (requires valid JWT cookie)
 */
router.get("/me", authenticate, authController.getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Log out the user by clearing the JWT cookie
 * @access  Public
 */
router.post("/logout", authController.logout);

module.exports = router;
