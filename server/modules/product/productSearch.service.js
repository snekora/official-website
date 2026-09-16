const mongoose = require("mongoose");
const Product = require("./product.model");
const Brand = require("../brand/brand.model");
const Category = require("../category/category.model");
const {
  buildSearchStage,
  buildFilterStages,
  buildSortStages,
  buildPaginationStages,
  buildProjectionStage,
  buildCategoryLookup,
  buildBrandLookup,
  buildAutocompletePipeline,
} = require("./productSearch.pipeline");

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ─── SEARCH PRODUCTS ─────────────────────────────────────────────

/**
 * Search and filter products using MongoDB Atlas Search aggregation pipeline.
 *
 * When a `search` query is provided, the pipeline starts with a `$search`
 * stage (Atlas Search) for full-text, fuzzy, and partial matching. When no
 * search query is given, it falls back to a standard `$match` pipeline so
 * browsing/filtering works even without an Atlas Search index.
 *
 * @param {Object} params - Validated and sanitized query parameters
 * @param {string} params.search - Search query text
 * @param {string} [params.category] - Category ObjectId filter
 * @param {string} [params.brand] - Brand name filter
 * @param {number} [params.minPrice] - Minimum price filter
 * @param {number} [params.maxPrice] - Maximum price filter
 * @param {string} [params.color] - Variant color filter
 * @param {number} [params.size] - Variant size filter
 * @param {boolean} [params.inStock] - In-stock filter
 * @param {string} params.sort - Sort key (newest, price_asc, etc.)
 * @param {number} params.page - Page number (1-indexed)
 * @param {number} params.limit - Items per page
 * @returns {Promise<Object>} { products, currentPage, totalPages, totalProducts, limit }
 */
const searchProducts = async (params) => {
  const {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    color,
    size,
    inStock,
    gender,
    sort,
    page,
    limit,
  } = params;

  const hasSearchQuery = search && search.length > 0;

  // ── Build the aggregation pipeline ──────────────────────────

  const pipeline = [];

  // Step 1: Atlas Search (only when there's a search query)
  if (hasSearchQuery) {
    pipeline.push(buildSearchStage(search));
  }

  // ── Resolve category & brand slugs/IDs to ObjectIds ──────────
  let resolvedCategory = category;
  if (category) {
    if (mongoose.isValidObjectId(category)) {
      resolvedCategory = category;
    } else {
      const catDoc = await Category.findOne({
        $or: [
          { slug: category.toLowerCase() },
          { name: { $regex: `^${escapeRegex(category)}$`, $options: "i" } },
        ],
      }).lean();
      resolvedCategory = catDoc
        ? catDoc._id
        : new mongoose.Types.ObjectId("000000000000000000000000");
    }
  }

  let resolvedBrand = brand;
  if (brand) {
    if (mongoose.isValidObjectId(brand)) {
      resolvedBrand = brand;
    } else {
      const brandDoc = await Brand.findOne({
        $or: [
          { slug: brand.toLowerCase() },
          { name: { $regex: `^${escapeRegex(brand)}$`, $options: "i" } },
        ],
      }).lean();
      resolvedBrand = brandDoc
        ? brandDoc._id
        : new mongoose.Types.ObjectId("000000000000000000000000");
    }
  }

  // Step 2: Post-search filters ($match stages)
  const filterStages = buildFilterStages({
    category: resolvedCategory,
    brand: resolvedBrand,
    minPrice,
    maxPrice,
    color,
    size,
    inStock,
    gender,
  });
  pipeline.push(...filterStages);

  // Step 3: Use $facet to get both paginated results and total count
  // in a single aggregation pass (avoids running the pipeline twice).
  const sortStages = buildSortStages(sort, hasSearchQuery);
  const paginationStages = buildPaginationStages(page, limit);
  const projectionStage = buildProjectionStage(hasSearchQuery);
  const categoryLookup = buildCategoryLookup();
  const brandLookup = buildBrandLookup();

  pipeline.push({
    $facet: {
      // Branch 1: Get the paginated, sorted, projected results
      results: [
        ...sortStages,
        ...paginationStages,
        ...categoryLookup,
        ...brandLookup,
        projectionStage,
      ],
      // Branch 2: Count total matching documents
      totalCount: [{ $count: "count" }],
    },
  });

  // ── Execute ─────────────────────────────────────────────────

  const [facetResult] = await Product.aggregate(pipeline);

  const products = facetResult.results || [];
  const totalProducts =
    facetResult.totalCount.length > 0 ? facetResult.totalCount[0].count : 0;
  const totalPages = Math.ceil(totalProducts / limit) || 1;

  return {
    products,
    currentPage: page,
    totalPages,
    totalProducts,
    limit,
  };
};

// ─── SUGGESTIONS ─────────────────────────────────────────────────

/**
 * Get autocomplete search suggestions using Atlas Search.
 *
 * Returns the top matching product names for search-as-you-type UX.
 * Uses the `autocomplete` operator which requires an `autocomplete`
 * field mapping in the Atlas Search index.
 *
 * @param {string} query - Partial search input
 * @returns {Promise<string[]>} Array of matching product names
 */
const getSuggestions = async (query) => {
  const pipeline = buildAutocompletePipeline(query, 10);

  const results = await Product.aggregate(pipeline);

  // Extract unique product names (deduplicate in case of overlapping matches)
  const seen = new Set();
  const suggestions = [];

  for (const result of results) {
    if (!seen.has(result.name)) {
      seen.add(result.name);
      suggestions.push(result.name);
    }
  }

  return suggestions;
};

// ─── EXPORTS ─────────────────────────────────────────────────────

module.exports = {
  searchProducts,
  getSuggestions,
};
