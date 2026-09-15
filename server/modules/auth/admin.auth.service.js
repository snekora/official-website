const jwt = require("jsonwebtoken");
const Admin = require("../users/admin.model");
const ApiError = require("../../utils/ApiError");

/**
 * Generates a JWT for the given admin ID.
 * Includes a `role` claim so the middleware can distinguish
 * admin tokens from regular user tokens.
 */
const generateAdminToken = (adminId) => {
  let expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  // Remove any accidental quotes or spaces from Railway env vars
  expiresIn = expiresIn.replace(/['"]/g, "").trim();

  return jwt.sign({ id: adminId, role: "admin" }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

/**
 * Authenticates an admin with username & password credentials.
 *
 * @param {string} username
 * @param {string} password
 * @returns {{ admin: object, token: string }}
 * @throws {ApiError} 401 if credentials are invalid
 */
const adminLogin = async (username, password) => {
  // `.select('+password')` because password has `select: false` on the schema
  const admin = await Admin.findOne({ username }).select("+password");

  if (!admin) {
    throw new ApiError(401, "Invalid username or password");
  }

  const isMatch = await admin.comparePassword(password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid username or password");
  }

  const token = generateAdminToken(admin._id);

  return { admin, token };
};

/**
 * Creates a new admin account.
 * 
 * @param {string} username
 * @param {string} password
 * @returns {object} Created admin
 */
const createAdmin = async (username, password) => {
  const existing = await Admin.findOne({ username });
  if (existing) {
    throw new ApiError(400, "Username is already taken");
  }

  const admin = await Admin.create({
    username,
    password,
  });

  return admin;
};

const getAllAdmins = async () => {
  const admins = await Admin.find({}).sort({ createdAt: -1 });
  return admins;
};

/**
 * Deletes an admin account by ID.
 * 
 * @param {string} adminId
 * @returns {object} Deleted admin
 */
const deleteAdmin = async (adminId) => {
  const admin = await Admin.findByIdAndDelete(adminId);
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }
  return admin;
};

module.exports = {
  adminLogin,
  generateAdminToken,
  createAdmin,
  getAllAdmins,
  deleteAdmin,
};
