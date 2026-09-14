const express = require("express");
const adminAuthController = require("./admin.auth.controller");
const { authenticateAdmin } = require("../../middleware/auth.middleware");

const router = express.Router();

/**
 * @route   POST /api/auth/admin/login
 * @desc    Authenticate admin via username & password
 * @access  Public
 * @body    { username: string, password: string }
 */
router.post("/login", adminAuthController.adminLogin);

/**
 * @route   POST /api/auth/admin/register
 * @desc    Register a new admin (no secret needed if it's the first admin, secret required otherwise)
 * @access  Public (conditional)
 * @body    { username: string, password: string, secret?: string }
 */
router.post("/register", adminAuthController.registerAdmin);

/**
 * @route   GET /api/auth/admin/me
 * @desc    Return the currently authenticated admin
 * @access  Private (requires valid admin JWT cookie)
 */
router.get("/me", authenticateAdmin, adminAuthController.getAdminMe);

/**
 * @route   POST /api/auth/admin/logout
 * @desc    Log out the admin by clearing the JWT cookie
 * @access  Public
 */
router.post("/logout", adminAuthController.adminLogout);

/**
 * @route   GET /api/auth/admin
 * @desc    Get all admins
 * @access  Private (admin only)
 */
router.get("/", authenticateAdmin, adminAuthController.getAllAdmins);

/**
 * @route   DELETE /api/auth/admin/:id
 * @desc    Delete an admin
 * @access  Private (admin only)
 */
router.delete("/:id", authenticateAdmin, adminAuthController.deleteAdmin);

module.exports = router;
