const express = require("express");
const reviewController = require("./review.controller");
const { authenticate, authenticateAdmin } = require("../../middleware/auth.middleware");

const router = express.Router();

// ─── NESTED UNDER /api/products/:productId/reviews ───────────────

/**
 * @route   GET /api/products/:productId/reviews
 * @desc    Get all reviews for a product (paginated)
 * @access  Public
 */
router.get("/:productId/reviews", reviewController.getProductReviews);

/**
 * @route   POST /api/products/:productId/reviews
 * @desc    Create a review for a product
 * @access  Private (authenticated user)
 */
router.post("/:productId/reviews", authenticate, reviewController.createReview);

/**
 * @route   PUT /api/products/:productId/reviews/:reviewId
 * @desc    Update a review (owner only)
 * @access  Private (authenticated user)
 */
router.put(
  "/:productId/reviews/:reviewId",
  authenticate,
  reviewController.updateReview,
);

/**
 * @route   DELETE /api/products/:productId/reviews/:reviewId
 * @desc    Delete a review (owner only)
 * @access  Private (authenticated user)
 */
router.delete(
  "/:productId/reviews/:reviewId",
  authenticate,
  reviewController.deleteReview,
);

/**
 * @route   PATCH /api/products/:productId/reviews/:reviewId/helpful
 * @desc    Mark a review as helpful
 * @access  Private (authenticated user)
 */
router.patch(
  "/:productId/reviews/:reviewId/helpful",
  authenticate,
  reviewController.markReviewHelpful,
);

// ─── ADMIN ROUTE (mounted separately at /api/reviews) ────────────

/**
 * @route   DELETE /api/reviews/admin/:reviewId
 * @desc    Admin delete any review
 * @access  Private (admin only)
 */
router.delete(
  "/admin/:reviewId",
  authenticateAdmin,
  reviewController.adminDeleteReview,
);

module.exports = router;
