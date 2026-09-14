const Review = require("./review.model");
const Product = require("../product/product.model");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

/**
 * Recalculates averageRating and numReviews on the parent Product
 * after a review is created, updated, or deleted.
 */
const recalculateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      numReviews: stats[0].numReviews,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      averageRating: 0,
      numReviews: 0,
    });
  }
};

// ─── PUBLIC ENDPOINTS ────────────────────────────────────────────

/**
 * @desc    Get all reviews for a product
 * @route   GET /api/products/:productId/reviews
 * @access  Public
 *
 * Query parameters:
 *   - page (default 1)
 *   - limit (default 10)
 *   - sort (default "-createdAt")
 */
const getProductReviews = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, sort = "-createdAt" } = req.query;

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [reviews, total] = await Promise.all([
    Review.find({ product: productId })
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Review.countDocuments({ product: productId }),
  ]);

  res.status(200).json(
    ApiResponse.success(
      {
        count: reviews.length,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        reviews,
      },
      "Reviews fetched successfully"
    )
  );
});

// ─── AUTHENTICATED USER ENDPOINTS ───────────────────────────────

/**
 * @desc    Create a review for a product
 * @route   POST /api/products/:productId/reviews
 * @access  Private (authenticated user)
 * @body    { rating, text }
 */
const createReview = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { rating, text } = req.body;

  if (!rating || !text) {
    throw new ApiError(400, "Rating and review text are required");
  }

  if (rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({
    product: productId,
    user: req.user._id,
  });

  if (existingReview) {
    throw new ApiError(409, "You have already reviewed this product");
  }

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    userName: req.user.name,
    rating: Number(rating),
    text,
  });

  // Push review ref into the product's reviews array
  product.reviews.push(review._id);
  await product.save();

  // Recalculate product rating
  await recalculateProductRating(product._id);

  res.status(201).json(
    ApiResponse.success({ review }, "Review submitted successfully", 201)
  );
});

/**
 * @desc    Update the current user's review
 * @route   PUT /api/products/:productId/reviews/:reviewId
 * @access  Private (review owner only)
 * @body    { rating?, text? }
 */
const updateReview = asyncHandler(async (req, res, next) => {
  const { reviewId } = req.params;
  const { rating, text } = req.body;

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Ensure only the review owner can update
  if (review.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only edit your own reviews");
  }

  if (rating !== undefined) {
    if (rating < 1 || rating > 5) {
      throw new ApiError(400, "Rating must be between 1 and 5");
    }
    review.rating = Number(rating);
  }

  if (text !== undefined) {
    review.text = text;
  }

  await review.save();

  // Recalculate product rating
  await recalculateProductRating(review.product);

  res.status(200).json(
    ApiResponse.success({ review }, "Review updated successfully")
  );
});

/**
 * @desc    Delete the current user's review
 * @route   DELETE /api/products/:productId/reviews/:reviewId
 * @access  Private (review owner only)
 */
const deleteReview = asyncHandler(async (req, res, next) => {
  const { productId, reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Ensure only the review owner can delete
  if (review.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own reviews");
  }

  // Remove review ref from the product's reviews array
  await Product.findByIdAndUpdate(productId, {
    $pull: { reviews: reviewId },
  });

  await review.deleteOne();

  // Recalculate product rating
  await recalculateProductRating(review.product);

  res.status(200).json(
    ApiResponse.success(null, "Review deleted successfully")
  );
});

/**
 * @desc    Mark a review as helpful (increment helpfulCount)
 * @route   PATCH /api/products/:productId/reviews/:reviewId/helpful
 * @access  Private (authenticated user)
 */
const markReviewHelpful = asyncHandler(async (req, res, next) => {
  const { reviewId } = req.params;

  const review = await Review.findByIdAndUpdate(
    reviewId,
    { $inc: { helpfulCount: 1 } },
    { new: true },
  );

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  res.status(200).json(
    ApiResponse.success({ review }, "Review marked as helpful")
  );
});

// ─── ADMIN ENDPOINTS ─────────────────────────────────────────────

/**
 * @desc    Admin delete any review
 * @route   DELETE /api/reviews/admin/:reviewId
 * @access  Private (admin only)
 */
const adminDeleteReview = asyncHandler(async (req, res, next) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  const productId = review.product;

  // Remove review ref from the product's reviews array
  await Product.findByIdAndUpdate(productId, {
    $pull: { reviews: reviewId },
  });

  await review.deleteOne();

  // Recalculate product rating
  await recalculateProductRating(productId);

  res.status(200).json(
    ApiResponse.success(null, "Review deleted by admin")
  );
});

module.exports = {
  // Public
  getProductReviews,
  // Authenticated user
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  // Admin
  adminDeleteReview,
};
