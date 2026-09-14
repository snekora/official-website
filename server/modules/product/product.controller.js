const mongoose = require("mongoose");
const Product = require("./product.model");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const cloudinaryService = require("../../services/cloudinaryService");

// ─── HELPERS ─────────────────────────────────────────────────────

/**
 * Build a sanitized Cloudinary folder path for a variant's images.
 * Format: snekora/products/<productId>/<colorName>
 *
 * @param {string} productId  - MongoDB ObjectId as string
 * @param {string} colorName  - Variant color name (will be sanitized)
 * @returns {string} Cloudinary folder path
 */
const buildVariantFolder = (productId, colorName) => {
  const sanitized = colorName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `snekora/products/${productId}/${sanitized}`;
};

// ─── PUBLIC ENDPOINTS ────────────────────────────────────────────
// NOTE: getAllProducts has been moved to searchProduct.controller.js
// which uses Atlas Search aggregation pipelines instead of $regex.

/**
 * @desc    Get a single product by ID or slug (with reviews populated)
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = asyncHandler(async (req, res, next) => {
  const isObjectId = mongoose.isValidObjectId(req.params.id);
  const query = isObjectId ? { _id: req.params.id } : { slug: req.params.id };

  const product = await Product.findOne(query)
    .populate("category", "name slug")
    .populate("brand", "name slug logo")
    .populate({
      path: "reviews",
      select: "user userName rating text helpfulCount createdAt",
      options: { sort: { createdAt: -1 } },
    });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res.status(200).json(
    ApiResponse.success({ product }, "Product fetched successfully")
  );
});

// ─── ADMIN ENDPOINTS ─────────────────────────────────────────────

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private (admin only)
 * @body    { name, description, price, originalPrice?, category, gender?, variants? }
 */
const createProduct = asyncHandler(async (req, res, next) => {
  const {
    name,
    description,
    price,
    originalPrice,
    category,
    brand,
    gender,
    variants,
  } = req.body;

  if (!name || !description || price == null || !category) {
    throw new ApiError(
      400,
      "Name, description, price, and category are required",
    );
  }

  const product = await Product.create({
    name,
    description,
    price,
    originalPrice,
    category,
    brand: brand || undefined,
    gender,
    variants: variants || [],
  });

  const populated = await product
    .populate("category", "name slug")
    .then((p) => p.populate("brand", "name slug logo"));

  res.status(201).json(
    ApiResponse.success({ product: populated }, "Product created successfully", 201)
  );
});

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private (admin only)
 * @body    Any product fields to update
 */
const updateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Only allow updating specific safe fields
  const allowedFields = [
    "name",
    "description",
    "price",
    "originalPrice",
    "category",
    "brand",
    "gender",
    "tags",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });

  await product.save();
  const populated = await product
    .populate("category", "name slug")
    .then((p) => p.populate("brand", "name slug logo"));

  res.status(200).json(
    ApiResponse.success({ product: populated }, "Product updated successfully")
  );
});

/**
 * @desc    Delete a product and all its Cloudinary images
 * @route   DELETE /api/products/:id
 * @access  Private (admin only)
 */
const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Delete all images from Cloudinary for this product
  await cloudinaryService.deleteFolder(`snekora/products/${product._id}`);

  await product.deleteOne();

  res.status(200).json(
    ApiResponse.success(null, "Product and all associated images deleted successfully")
  );
});

// ─── VARIANT & STOCK MANAGEMENT (Admin) ──────────────────────────

/**
 * @desc    Add a variant to a product (with image upload)
 * @route   POST /api/products/:id/variants
 * @access  Private (admin only)
 * @body    color[name], color[hex], sizes (JSON string)
 * @files   images (multipart file uploads)
 */
const addVariant = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Parse color — may come as nested object or JSON string
  let color = req.body.color;
  if (typeof color === "string") {
    try {
      color = JSON.parse(color);
    } catch {
      throw new ApiError(400, "Invalid color format. Expected JSON object.");
    }
  }

  if (!color || !color.name) {
    throw new ApiError(400, "Variant color name is required");
  }

  // Parse sizes — may come as JSON string from multipart form
  let sizes = req.body.sizes;
  if (typeof sizes === "string") {
    try {
      sizes = JSON.parse(sizes);
    } catch {
      throw new ApiError(400, "Invalid sizes format. Expected JSON array.");
    }
  }

  // Upload images to Cloudinary
  const folder = buildVariantFolder(product._id, color.name);
  const uploadedImages = await cloudinaryService.uploadImages(
    req.files || [],
    folder,
  );

  product.variants.push({
    color,
    images: uploadedImages,
    sizes: sizes || [],
  });
  await product.save();

  res.status(201).json(
    ApiResponse.success({ product }, "Variant added successfully", 201)
  );
});

/**
 * @desc    Update a specific variant (with optional image changes)
 * @route   PUT /api/products/:id/variants/:variantId
 * @access  Private (admin only)
 * @body    color?, sizes?, existingImages? (JSON string of publicIds to keep)
 * @files   images (new multipart file uploads to add)
 */
const updateVariant = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const variant = product.variants.id(req.params.variantId);

  if (!variant) {
    throw new ApiError(404, "Variant not found");
  }

  // Parse color
  let color = req.body.color;
  if (typeof color === "string") {
    try {
      color = JSON.parse(color);
    } catch {
      throw new ApiError(400, "Invalid color format.");
    }
  }

  // Parse sizes
  let sizes = req.body.sizes;
  if (typeof sizes === "string") {
    try {
      sizes = JSON.parse(sizes);
    } catch {
      throw new ApiError(400, "Invalid sizes format.");
    }
  }

  if (color) variant.color = color;
  if (sizes) variant.sizes = sizes;

  // Handle image updates
  // existingImages: array of publicIds that the admin wants to KEEP
  let existingImages = req.body.existingImages;
  if (typeof existingImages === "string") {
    try {
      existingImages = JSON.parse(existingImages);
    } catch {
      existingImages = [];
    }
  }

  if (existingImages) {
    // Find images to delete (ones not in the keep list)
    const imagesToDelete = variant.images.filter(
      (img) => !existingImages.includes(img.publicId),
    );

    // Delete removed images from Cloudinary
    for (const img of imagesToDelete) {
      await cloudinaryService.deleteImage(img.publicId);
    }

    // Keep only the images that are in the existingImages list
    variant.images = variant.images.filter((img) =>
      existingImages.includes(img.publicId),
    );
  }

  // Upload new images if provided
  if (req.files && req.files.length > 0) {
    const colorName = color?.name || variant.color.name;
    const folder = buildVariantFolder(product._id, colorName);
    const newImages = await cloudinaryService.uploadImages(req.files, folder);
    variant.images.push(...newImages);
  }

  await product.save();

  res.status(200).json(
    ApiResponse.success({ product }, "Variant updated successfully")
  );
});

/**
 * @desc    Delete a variant from a product (and its Cloudinary images)
 * @route   DELETE /api/products/:id/variants/:variantId
 * @access  Private (admin only)
 */
const deleteVariant = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const variant = product.variants.id(req.params.variantId);

  if (!variant) {
    throw new ApiError(404, "Variant not found");
  }

  // Delete all images for this variant from Cloudinary
  for (const img of variant.images) {
    await cloudinaryService.deleteImage(img.publicId);
  }

  // Also attempt to delete the variant's folder
  if (variant.color?.name) {
    const folder = buildVariantFolder(product._id, variant.color.name);
    await cloudinaryService.deleteFolder(folder);
  }

  variant.deleteOne();
  await product.save();

  res.status(200).json(
    ApiResponse.success({ product }, "Variant and associated images deleted successfully")
  );
});

/**
 * @desc    Update stock for a specific size within a variant
 * @route   PATCH /api/products/:id/variants/:variantId/stock
 * @access  Private (admin only)
 * @body    { size: Number, stock: Number }
 */
const updateStock = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const variant = product.variants.id(req.params.variantId);

  if (!variant) {
    throw new ApiError(404, "Variant not found");
  }

  const { size, stock } = req.body;

  if (size == null || stock == null) {
    throw new ApiError(400, "Size and stock are required");
  }

  if (stock < 0) {
    throw new ApiError(400, "Stock cannot be negative");
  }

  const sizeEntry = variant.sizes.find((s) => s.size === Number(size));

  if (!sizeEntry) {
    throw new ApiError(404, `Size ${size} not found in this variant`);
  }

  sizeEntry.stock = Number(stock);
  await product.save();

  res.status(200).json(
    ApiResponse.success({ product }, "Stock updated successfully")
  );
});

module.exports = {
  // Public
  getProductById,
  // Admin CRUD
  createProduct,
  updateProduct,
  deleteProduct,
  // Admin variant management
  addVariant,
  updateVariant,
  deleteVariant,
  updateStock,
};
