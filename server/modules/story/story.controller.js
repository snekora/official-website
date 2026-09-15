const Story = require("./story.model");
const Product = require("../product/product.model");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const { uploadVideo, uploadImage, deleteImage, deleteVideo } = require("../../services/cloudinaryService");

// @desc    Create a new story
// @route   POST /api/story
// @access  Private/Admin
const createStory = asyncHandler(async (req, res) => {
  const { title, product } = req.body;

  if (!req.files || !req.files.video || !req.files.thumbnail) {
    throw new ApiError(400, "Video and thumbnail are required");
  }

  // Check if product exists if provided
  if (product && product !== "null" && product !== "undefined") {
    const productExists = await Product.findById(product);
    if (!productExists) {
      throw new ApiError(404, "Product not found");
    }
  }

  const videoFile = req.files.video[0];
  const thumbnailFile = req.files.thumbnail[0];

  // Upload video
  const videoData = await uploadVideo(videoFile.buffer, "snekora/stories/videos");
  
  // Upload thumbnail
  const thumbnailData = await uploadImage(thumbnailFile.buffer, "snekora/stories/thumbnails");

  const story = await Story.create({
    title,
    video: videoData,
    thumbnail: thumbnailData,
    product: (product && product !== "null" && product !== "undefined") ? product : null,
  });

  res.status(201).json(new ApiResponse(201, { story }, "Story created successfully"));
});

// @desc    Get all active stories
// @route   GET /api/story
// @access  Public
const getStories = asyncHandler(async (req, res) => {
  const stories = await Story.find({ isActive: true })
    .populate({
      path: "product",
      select: "name price variants slug originalPrice",
    })
    .sort("-createdAt");

  res.status(200).json(new ApiResponse(200, { stories }, "Stories fetched successfully"));
});

// @desc    Get all stories (Admin)
// @route   GET /api/story/admin
// @access  Private/Admin
const getAdminStories = asyncHandler(async (req, res) => {
  const stories = await Story.find()
    .populate({
      path: "product",
      select: "name",
    })
    .sort("-createdAt");

  res.status(200).json(new ApiResponse(200, { stories }, "All stories fetched successfully"));
});

// @desc    Update a story
// @route   PUT /api/story/:id
// @access  Private/Admin
const updateStory = asyncHandler(async (req, res) => {
  const { title, product, isActive } = req.body;
  const story = await Story.findById(req.params.id);

  if (!story) {
    throw new ApiError(404, "Story not found");
  }

  if (title !== undefined && title.trim() !== "") {
    story.title = title.trim();
  }

  if (product !== undefined) {
    if (product && product !== "null" && product !== "undefined" && product !== "") {
      const productExists = await Product.findById(product);
      if (!productExists) {
        throw new ApiError(404, "Product not found");
      }
      story.product = product;
    } else {
      story.product = null;
    }
  }

  if (isActive !== undefined) {
    story.isActive = isActive === "true" || isActive === true;
  }

  // If new video uploaded, replace old video
  if (req.files && req.files.video && req.files.video[0]) {
    if (story.video && story.video.publicId) {
      await deleteVideo(story.video.publicId);
    }
    const videoData = await uploadVideo(req.files.video[0].buffer, "snekora/stories/videos");
    story.video = videoData;
  }

  // If new thumbnail uploaded, replace old thumbnail
  if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
    if (story.thumbnail && story.thumbnail.publicId) {
      await deleteImage(story.thumbnail.publicId);
    }
    const thumbnailData = await uploadImage(req.files.thumbnail[0].buffer, "snekora/stories/thumbnails");
    story.thumbnail = thumbnailData;
  }

  await story.save();
  await story.populate({
    path: "product",
    select: "name price variants slug originalPrice",
  });

  res.status(200).json(new ApiResponse(200, { story }, "Story updated successfully"));
});

// @desc    Delete a story
// @route   DELETE /api/story/:id
// @access  Private/Admin
const deleteStory = asyncHandler(async (req, res) => {
  const story = await Story.findById(req.params.id);

  if (!story) {
    throw new ApiError(404, "Story not found");
  }

  // Delete resources from Cloudinary
  if (story.video && story.video.publicId) {
    await deleteVideo(story.video.publicId);
  }
  if (story.thumbnail && story.thumbnail.publicId) {
    await deleteImage(story.thumbnail.publicId);
  }
  
  await story.deleteOne();

  res.status(200).json(new ApiResponse(200, {}, "Story deleted successfully"));
});

module.exports = {
  createStory,
  getStories,
  getAdminStories,
  updateStory,
  deleteStory,
};
