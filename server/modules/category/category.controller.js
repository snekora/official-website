const Category = require("./category.model");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

// ─── PUBLIC ENDPOINTS ────────────────────────────────────────────

/**
 * @desc    Get all active categories
 * @route   GET /api/categories
 * @access  Public
 */
const getAllCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({ isActive: true })
    .sort("name")
    .lean();

  res.status(200).json(
    ApiResponse.success(
      { count: categories.length, categories },
      "Categories fetched successfully"
    )
  );
});

/**
 * @desc    Get a single category by slug
 * @route   GET /api/categories/:slug
 * @access  Public
 */
const getCategoryBySlug = asyncHandler(async (req, res, next) => {
  const category = await Category.findOne({
    slug: req.params.slug,
    isActive: true,
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  res.status(200).json(
    ApiResponse.success({ category }, "Category fetched successfully")
  );
});

// ─── ADMIN ENDPOINTS ─────────────────────────────────────────────

/**
 * @desc    Get all categories (including inactive) for admin management
 * @route   GET /api/categories/admin/all
 * @access  Private (admin only)
 */
const getAllCategoriesAdmin = asyncHandler(async (req, res, next) => {
  const categories = await Category.find().sort("-createdAt").lean();

  res.status(200).json(
    ApiResponse.success(
      { count: categories.length, categories },
      "All categories fetched successfully"
    )
  );
});

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private (admin only)
 * @body    { name, slug?, isActive? }
 */
const createCategory = asyncHandler(async (req, res, next) => {
  const { name, slug, isActive } = req.body;

  if (!name) {
    throw new ApiError(400, "Category name is required");
  }

  // Auto-generate slug from name if not provided
  const categorySlug =
    slug ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  try {
    const category = await Category.create({
      name,
      slug: categorySlug,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json(
      ApiResponse.success({ category }, "Category created successfully", 201)
    );
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "A category with that name or slug already exists");
    }
    throw error;
  }
});

/**
 * @desc    Update a category
 * @route   PUT /api/categories/:id
 * @access  Private (admin only)
 * @body    { name?, slug?, isActive? }
 */
const updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  const allowedFields = ["name", "slug", "isActive"];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      category[field] = req.body[field];
    }
  });

  // Re-generate slug if name changed but slug wasn't explicitly provided
  if (req.body.name && !req.body.slug) {
    category.slug = req.body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  try {
    await category.save();

    res.status(200).json(
      ApiResponse.success({ category }, "Category updated successfully")
    );
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "A category with that name or slug already exists");
    }
    throw error;
  }
});

/**
 * @desc    Delete a category
 * @route   DELETE /api/categories/:id
 * @access  Private (admin only)
 */
const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  await category.deleteOne();

  res.status(200).json(
    ApiResponse.success(null, "Category deleted successfully")
  );
});

/**
 * @desc    Toggle category active status
 * @route   PATCH /api/categories/:id/toggle
 * @access  Private (admin only)
 */
const toggleCategoryStatus = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  category.isActive = !category.isActive;
  await category.save();

  res.status(200).json(
    ApiResponse.success(
      { category },
      `Category ${category.isActive ? "activated" : "deactivated"} successfully`
    )
  );
});

module.exports = {
  // Public
  getAllCategories,
  getCategoryBySlug,
  // Admin
  getAllCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
};
