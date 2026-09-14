const adminAuthService = require("./admin.auth.service");
const Admin = require("../users/admin.model");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

/**
 * @desc    Admin login with username & password
 * @route   POST /api/auth/admin/login
 * @access  Public
 */
const adminLogin = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new ApiError(400, "Username and password are required");
  }

  const { admin, token } = await adminAuthService.adminLogin(
    username,
    password,
  );

  res.cookie("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json(
    ApiResponse.success({ admin, token }, "Admin login successful")
  );
});

/**
 * @desc    Returns the currently authenticated admin
 * @route   GET /api/auth/admin/me
 * @access  Private (admin only)
 */
const getAdminMe = asyncHandler(async (req, res) => {
  res.status(200).json(
    ApiResponse.success({ admin: req.admin }, "Admin fetched successfully")
  );
});

/**
 * @desc    Logs out the admin by clearing the HTTP-only cookie
 * @route   POST /api/auth/admin/logout
 * @access  Public
 */
const adminLogout = asyncHandler(async (req, res) => {
  res.cookie("admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    expires: new Date(0),
  });

  res.status(200).json(
    ApiResponse.success(null, "Admin logged out successfully")
  );
});

/**
 * @desc    Register a new admin.
 *          If no admins exist, anyone can register the first admin.
 *          If admins exist, a secret key (ADMIN_REGISTRATION_SECRET) is required.
 * @route   POST /api/auth/admin/register
 * @access  Public (conditional)
 */
const registerAdmin = asyncHandler(async (req, res, next) => {
  const { username, password, secret } = req.body;

  if (!username || !password) {
    throw new ApiError(400, "Username and password are required");
  }

  const adminExists = await Admin.exists({});

  if (adminExists) {
    const registrationSecret =
      process.env.ADMIN_REGISTRATION_SECRET || "snekora_super_secret_key_123";
    if (secret !== registrationSecret) {
      throw new ApiError(
        403,
        "Admin registration is locked. A valid registration secret is required to register subsequent admins.",
      );
    }
  }

  const admin = await adminAuthService.createAdmin(username, password);

  res.status(201).json(
    ApiResponse.success(
      { admin },
      adminExists
        ? "Admin registered successfully"
        : "First admin registered successfully! You can now log in.",
      201
    )
  );
});

/**
 * @desc    Get all admins
 * @route   GET /api/auth/admin
 * @access  Private (admin only)
 */
const getAllAdmins = asyncHandler(async (req, res, next) => {
  const admins = await adminAuthService.getAllAdmins();
  res.status(200).json(
    ApiResponse.success({ admins }, "Admins fetched successfully")
  );
});

/**
 * @desc    Delete an admin
 * @route   DELETE /api/auth/admin/:id
 * @access  Private (admin only)
 */
const deleteAdmin = asyncHandler(async (req, res, next) => {
  // Prevent an admin from deleting themselves
  if (req.params.id === req.admin._id.toString()) {
    throw new ApiError(400, "You cannot delete your own admin account");
  }

  const admin = await adminAuthService.deleteAdmin(req.params.id);
  res.status(200).json(
    ApiResponse.success({ admin }, "Admin deleted successfully")
  );
});

module.exports = {
  adminLogin,
  getAdminMe,
  adminLogout,
  registerAdmin,
  getAllAdmins,
  deleteAdmin,
};
