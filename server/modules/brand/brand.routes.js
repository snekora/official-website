const express = require("express");
const brandController = require("./brand.controller");
const { authenticateAdmin } = require("../../middleware/auth.middleware");
const upload = require("../../middleware/upload.middleware");

const router = express.Router();

// ─── PUBLIC ROUTES ───────────────────────────────────────────────

/**
 * @route   GET /api/brands
 * @desc    Get all active brands
 * @access  Public
 */
router.get("/", brandController.getAllBrands);

/**
 * @route   GET /api/brands/:slug
 * @desc    Get a single brand by slug
 * @access  Public
 */
router.get("/:slug", brandController.getBrandBySlug);

// ─── ADMIN ROUTES ────────────────────────────────────────────────

/**
 * @route   GET /api/brands/admin/all
 * @desc    Get all brands (including inactive)
 * @access  Private (admin only)
 */
router.get("/admin/all", authenticateAdmin, brandController.getAllBrandsAdmin);

/**
 * @route   POST /api/brands
 * @desc    Create a new brand (with optional image upload)
 * @access  Private (admin only)
 */
router.post(
  "/",
  authenticateAdmin,
  upload.single("logo"),
  brandController.createBrand,
);

/**
 * @route   PUT /api/brands/:id
 * @desc    Update a brand (with optional image upload)
 * @access  Private (admin only)
 */
router.put(
  "/:id",
  authenticateAdmin,
  upload.single("logo"),
  brandController.updateBrand,
);

/**
 * @route   DELETE /api/brands/:id
 * @desc    Delete a brand
 * @access  Private (admin only)
 */
router.delete("/:id", authenticateAdmin, brandController.deleteBrand);

/**
 * @route   PATCH /api/brands/:id/toggle
 * @desc    Toggle brand active/inactive status
 * @access  Private (admin only)
 */
router.patch(
  "/:id/toggle",
  authenticateAdmin,
  brandController.toggleBrandStatus,
);

module.exports = router;
