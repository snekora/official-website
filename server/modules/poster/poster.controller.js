const Poster = require("./poster.model");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const { uploadImage, deleteImage } = require("../../services/cloudinaryService");

// @desc    Create a new poster
// @route   POST /api/poster
// @access  Private/Admin
const createPoster = asyncHandler(async (req, res) => {
  const { order, isActive } = req.body;

  if (!req.file) {
    throw new ApiError(400, "Poster image is required");
  }

  // Upload image
  const imageData = await uploadImage(req.file.buffer, "snekora/posters");

  const poster = await Poster.create({
    image: imageData,
    order: order ? Number(order) : 0,
    isActive: isActive === "true" || isActive === true,
  });

  res.status(201).json(ApiResponse.success({ poster }, "Poster created successfully", 201));
});

// @desc    Get all active posters
// @route   GET /api/poster
// @access  Public
const getPosters = asyncHandler(async (req, res) => {
  const posters = await Poster.find({ isActive: true })
    .sort({ order: 1, createdAt: -1 });

  res.status(200).json(ApiResponse.success({ posters }, "Posters fetched successfully"));
});

// @desc    Get all posters (Admin)
// @route   GET /api/poster/admin
// @access  Private/Admin
const getAdminPosters = asyncHandler(async (req, res) => {
  const posters = await Poster.find()
    .sort({ order: 1, createdAt: -1 });

  res.status(200).json(ApiResponse.success({ posters }, "All posters fetched successfully"));
});

// @desc    Update a poster
// @route   PUT /api/poster/:id
// @access  Private/Admin
const updatePoster = asyncHandler(async (req, res) => {
  const { order, isActive } = req.body;
  const poster = await Poster.findById(req.params.id);

  if (!poster) {
    throw new ApiError(404, "Poster not found");
  }

  if (order !== undefined) {
    poster.order = Number(order);
  }

  if (isActive !== undefined) {
    poster.isActive = isActive === "true" || isActive === true;
  }

  // If new image uploaded, replace old image
  if (req.file) {
    if (poster.image && poster.image.publicId) {
      await deleteImage(poster.image.publicId);
    }
    const imageData = await uploadImage(req.file.buffer, "snekora/posters");
    poster.image = imageData;
  }

  await poster.save();

  res.status(200).json(ApiResponse.success({ poster }, "Poster updated successfully"));
});

// @desc    Delete a poster
// @route   DELETE /api/poster/:id
// @access  Private/Admin
const deletePoster = asyncHandler(async (req, res) => {
  const poster = await Poster.findById(req.params.id);

  if (!poster) {
    throw new ApiError(404, "Poster not found");
  }

  // Delete resource from Cloudinary
  if (poster.image && poster.image.publicId) {
    await deleteImage(poster.image.publicId);
  }
  
  await poster.deleteOne();

  res.status(200).json(ApiResponse.success({}, "Poster deleted successfully"));
});

module.exports = {
  createPoster,
  getPosters,
  getAdminPosters,
  updatePoster,
  deletePoster,
};
