const express = require("express");
const productController = require("./product.controller");
const searchController = require("./searchProduct.controller");
const { authenticateAdmin } = require("../../middleware/auth.middleware");
const upload = require("../../middleware/upload.middleware");

const router = express.Router();

// ─── PUBLIC ROUTES ───────────────────────────────────────────────

/**
 * @route   GET /api/products
 * @desc    Search and filter products (Atlas Search powered)
 * @access  Public
 */
router.get("/", searchController.searchProducts);

/**
 * @route   GET /api/products/suggestions
 * @desc    Autocomplete search suggestions
 * @access  Public
 * @note    Must be registered BEFORE /:id to avoid matching "suggestions" as a product ID
 */
router.get("/suggestions", searchController.getSuggestions);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID or slug
 * @access  Public
 */
router.get("/:id", productController.getProductById);

// ─── ADMIN ROUTES ────────────────────────────────────────────────

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private (admin only)
 */
router.post("/", authenticateAdmin, productController.createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product
 * @access  Private (admin only)
 */
router.put("/:id", authenticateAdmin, productController.updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product and all its Cloudinary images
 * @access  Private (admin only)
 */
router.delete("/:id", authenticateAdmin, productController.deleteProduct);

// ─── VARIANT MANAGEMENT (Admin) ──────────────────────────────────

/**
 * @route   POST /api/products/:id/variants
 * @desc    Add a variant to a product (with image upload)
 * @access  Private (admin only)
 * @files   images — up to 10 image files
 */
router.post(
  "/:id/variants",
  authenticateAdmin,
  upload.array("images", 10),
  productController.addVariant,
);

/**
 * @route   PUT /api/products/:id/variants/:variantId
 * @desc    Update a specific variant (with optional image changes)
 * @access  Private (admin only)
 * @files   images — new image files to add
 */
router.put(
  "/:id/variants/:variantId",
  authenticateAdmin,
  upload.array("images", 10),
  productController.updateVariant,
);

/**
 * @route   DELETE /api/products/:id/variants/:variantId
 * @desc    Delete a variant and its Cloudinary images
 * @access  Private (admin only)
 */
router.delete(
  "/:id/variants/:variantId",
  authenticateAdmin,
  productController.deleteVariant,
);

/**
 * @route   PATCH /api/products/:id/variants/:variantId/stock
 * @desc    Update stock for a specific size in a variant
 * @access  Private (admin only)
 */
router.patch(
  "/:id/variants/:variantId/stock",
  authenticateAdmin,
  productController.updateStock,
);



module.exports = router;
