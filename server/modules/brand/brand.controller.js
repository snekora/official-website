const Brand = require("./brand.model");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const cloudinaryService = require("../../services/cloudinaryService");

// ─── PUBLIC ENDPOINTS ────────────────────────────────────────────

/**
 * @desc    Get all active brands
 * @route   GET /api/brands
 * @access  Public
 */
const getAllBrands = asyncHandler(async (req, res, next) => {
  const brands = await Brand.find({ isActive: true }).sort("name").lean();

  res.status(200).json(
    ApiResponse.success(
      { count: brands.length, brands },
      "Brands fetched successfully"
    )
  );
});

/**
 * @desc    Get a single brand by slug
 * @route   GET /api/brands/:slug
 * @access  Public
 */
const getBrandBySlug = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findOne({
    slug: req.params.slug,
    isActive: true,
  });

  if (!brand) {
    throw new ApiError(404, "Brand not found");
  }

  res.status(200).json(
    ApiResponse.success({ brand }, "Brand fetched successfully")
  );
});

// ─── ADMIN ENDPOINTS ─────────────────────────────────────────────

/**
 * @desc    Get all brands (including inactive) for admin management
 * @route   GET /api/brands/admin/all
 * @access  Private (admin only)
 */
const getAllBrandsAdmin = asyncHandler(async (req, res, next) => {
  const brands = await Brand.find().sort("-createdAt").lean();

  res.status(200).json(
    ApiResponse.success(
      { count: brands.length, brands },
      "All brands fetched successfully"
    )
  );
});

/**
 * @desc    Create a new brand
 * @route   POST /api/brands
 * @access  Private (admin only)
 * @body    { name, slug?, logo?, description?, isActive? }
 */
const createBrand = asyncHandler(async (req, res, next) => {
  const { name, slug, description, isActive } = req.body;

  if (!name) {
    throw new ApiError(400, "Brand name is required");
  }

  // Auto-generate slug from name if not provided
  const brandSlug =
    slug ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const file =
    req.file ||
    (req.files &&
      (Array.isArray(req.files)
        ? req.files[0]
        : req.files.logo?.[0] ||
          req.files.image?.[0] ||
          Object.values(req.files)[0]?.[0])) ||
    null;

  if (!file) {
    throw new ApiError(400, "Brand logo image upload is required");
  }

  const logoData = await cloudinaryService.uploadImage(
    file.buffer,
    "snekora/brands",
  );

  try {
    const brand = await Brand.create({
      name,
      slug: brandSlug,
      logo: logoData,
      description,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json(
      ApiResponse.success({ brand }, "Brand created successfully", 201)
    );
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "A brand with that name or slug already exists");
    }
    throw error;
  }
});

/**
 * @desc    Update a brand
 * @route   PUT /api/brands/:id
 * @access  Private (admin only)
 * @body    { name?, slug?, description?, isActive? }
 */
const updateBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    throw new ApiError(404, "Brand not found");
  }

  const file =
    req.file ||
    (req.files &&
      (Array.isArray(req.files)
        ? req.files[0]
        : req.files.logo?.[0] ||
          req.files.image?.[0] ||
          Object.values(req.files)[0]?.[0])) ||
    null;

  if (file) {
    if (brand.logo && brand.logo.publicId) {
      await cloudinaryService.deleteImage(brand.logo.publicId);
    }
    const uploadedImage = await cloudinaryService.uploadImage(
      file.buffer,
      "snekora/brands",
    );
    brand.logo = uploadedImage;
  }

  const allowedFields = ["name", "slug", "description", "isActive"];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      brand[field] = req.body[field];
    }
  });

  if (req.body.name && !req.body.slug) {
    brand.slug = req.body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  try {
    await brand.save();

    res.status(200).json(
      ApiResponse.success({ brand }, "Brand updated successfully")
    );
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "A brand with that name or slug already exists");
    }
    throw error;
  }
});

/**
 * @desc    Delete a brand
 * @route   DELETE /api/brands/:id
 * @access  Private (admin only)
 */
const deleteBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    throw new ApiError(404, "Brand not found");
  }

  if (brand.logo && brand.logo.publicId) {
    await cloudinaryService.deleteImage(brand.logo.publicId);
  }

  await brand.deleteOne();

  res.status(200).json(
    ApiResponse.success(null, "Brand deleted successfully")
  );
});

/**
 * @desc    Toggle brand active status
 * @route   PATCH /api/brands/:id/toggle
 * @access  Private (admin only)
 */
const toggleBrandStatus = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    throw new ApiError(404, "Brand not found");
  }

  brand.isActive = !brand.isActive;
  await brand.save();

  res.status(200).json(
    ApiResponse.success(
      { brand },
      `Brand ${brand.isActive ? "activated" : "deactivated"} successfully`
    )
  );
});

module.exports = {
  // Public
  getAllBrands,
  getBrandBySlug,
  // Admin
  getAllBrandsAdmin,
  createBrand,
  updateBrand,
  deleteBrand,
  toggleBrandStatus,
};
