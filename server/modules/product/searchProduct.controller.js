const searchService = require("./productSearch.service");
const {
  validateSearchParams,
  validateSuggestionParams,
} = require("./searchProduct.validator");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

// ─── SEARCH PRODUCTS ─────────────────────────────────────────────

/**
 * @desc    Search and filter products with Atlas Search
 * @route   GET /api/products
 * @access  Public
 *
 * Supports query parameters:
 *   search, category, brand, minPrice, maxPrice, color, size,
 *   inStock, sort, page, limit
 */
const searchProducts = asyncHandler(async (req, res, next) => {
  // Validate and sanitize all query parameters
  const params = validateSearchParams(req.query);

  // Delegate to service layer
  const result = await searchService.searchProducts(params);

  res.status(200).json(
    ApiResponse.success(result, "Products searched successfully")
  );
});

// ─── SEARCH SUGGESTIONS ─────────────────────────────────────────

/**
 * @desc    Get autocomplete search suggestions
 * @route   GET /api/products/suggestions
 * @access  Public
 *
 * Query parameters:
 *   q — partial search string (required, min 1 char)
 */
const getSuggestions = asyncHandler(async (req, res, next) => {
  // Validate the suggestion query
  const { q } = validateSuggestionParams(req.query);

  // Delegate to service layer
  const suggestions = await searchService.getSuggestions(q);

  res.status(200).json(
    ApiResponse.success({ suggestions }, "Suggestions fetched successfully")
  );
});

module.exports = {
  searchProducts,
  getSuggestions,
};
