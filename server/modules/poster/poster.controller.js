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

  const desktopFile = req.files?.desktopImage?.[0] || req.files?.image?.[0] || req.file;
  const mobileFile = req.files?.mobileImage?.[0];

  if (!desktopFile && !mobileFile) {
    throw new ApiError(400, "At least one poster image (desktop or mobile) is required");
  }

  let desktopImageData = null;
  let mobileImageData = null;

  if (desktopFile) {
    desktopImageData = await uploadImage(desktopFile.buffer, "snekora/posters");
  }
  if (mobileFile) {
    mobileImageData = await uploadImage(mobileFile.buffer, "snekora/posters");
  }

  // Fallback if only one of them was provided
  if (!mobileImageData && desktopImageData) {
    mobileImageData = desktopImageData;
  }
  if (!desktopImageData && mobileImageData) {
    desktopImageData = mobileImageData;
  }

  const poster = await Poster.create({
    desktopImage: desktopImageData,
    mobileImage: mobileImageData,
    image: desktopImageData,
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

  const desktopFile = req.files?.desktopImage?.[0] || req.files?.image?.[0] || req.file;
  const mobileFile = req.files?.mobileImage?.[0];

  // If new desktop image uploaded
  if (desktopFile) {
    if (poster.desktopImage?.publicId) {
      await deleteImage(poster.desktopImage.publicId);
    } else if (poster.image?.publicId) {
      await deleteImage(poster.image.publicId);
    }
    const desktopImageData = await uploadImage(desktopFile.buffer, "snekora/posters");
    poster.desktopImage = desktopImageData;
    poster.image = desktopImageData;
  }

  // If new mobile image uploaded
  if (mobileFile) {
    if (poster.mobileImage?.publicId && poster.mobileImage.publicId !== poster.desktopImage?.publicId) {
      await deleteImage(poster.mobileImage.publicId);
    }
    const mobileImageData = await uploadImage(mobileFile.buffer, "snekora/posters");
    poster.mobileImage = mobileImageData;
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

  // Delete resources from Cloudinary safely avoiding duplicates
  const deletedIds = new Set();
  if (poster.desktopImage?.publicId) {
    deletedIds.add(poster.desktopImage.publicId);
    await deleteImage(poster.desktopImage.publicId);
  }
  if (poster.mobileImage?.publicId && !deletedIds.has(poster.mobileImage.publicId)) {
    deletedIds.add(poster.mobileImage.publicId);
    await deleteImage(poster.mobileImage.publicId);
  }
  if (poster.image?.publicId && !deletedIds.has(poster.image.publicId)) {
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
