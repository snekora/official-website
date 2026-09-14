const express = require("express");
const categoryController = require("./category.controller");
const { authenticateAdmin } = require("../../middleware/auth.middleware");

const router = express.Router();

// ─── PUBLIC ROUTES ───────────────────────────────────────────────

/**
 * @route   GET /api/categories
 * @desc    Get all active categories
 * @access  Public
 */
router.get("/", categoryController.getAllCategories);

/**
 * @route   GET /api/categories/:slug
 * @desc    Get a single category by slug
 * @access  Public
 */
router.get("/:slug", categoryController.getCategoryBySlug);

// ─── ADMIN ROUTES ────────────────────────────────────────────────

/**
 * @route   GET /api/categories/admin/all
 * @desc    Get all categories (including inactive)
 * @access  Private (admin only)
 */
router.get("/admin/all", authenticateAdmin, categoryController.getAllCategoriesAdmin);

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Private (admin only)
 */
router.post("/", authenticateAdmin, categoryController.createCategory);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update a category
 * @access  Private (admin only)
 */
router.put("/:id", authenticateAdmin, categoryController.updateCategory);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete a category
 * @access  Private (admin only)
 */
router.delete("/:id", authenticateAdmin, categoryController.deleteCategory);

/**
 * @route   PATCH /api/categories/:id/toggle
 * @desc    Toggle category active/inactive status
 * @access  Private (admin only)
 */
router.patch(
  "/:id/toggle",
  authenticateAdmin,
  categoryController.toggleCategoryStatus,
);

module.exports = router;
