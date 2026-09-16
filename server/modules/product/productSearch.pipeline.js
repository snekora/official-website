const mongoose = require("mongoose");

// ─── CONSTANTS ───────────────────────────────────────────────────

const SEARCH_INDEX_NAME = "productSearch";

/**
 * Text fields to search against (must match Atlas Search index mappings).
 */
const SEARCHABLE_TEXT_FIELDS = ["name", "description", "brand", "tags"];

/**
 * Fields boosted higher for phrase matching (title-weight fields).
 */
const PHRASE_MATCH_FIELDS = ["name", "description"];

/**
 * Sort presets mapped to MongoDB $sort specifications.
 */
const SORT_MAP = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  rating: { averageRating: -1 },
  popularity: { salesCount: -1 },
  discount: { _discountPercent: -1 },
};

// ─── SEARCH STAGE ────────────────────────────────────────────────

/**
 * Build the `$search` aggregation stage using Atlas Search compound queries.
 *
 * Strategy:
 *   1. Phrase match on name/description (highest boost) — rewards exact phrase hits
 *   2. Fuzzy text match across all searchable fields — handles typos
 *   3. Wildcard on name — catches partial/substring matches
 *
 * All clauses are `should` with `minimumShouldMatch: 1`, so at least one
 * must match, but documents matching multiple clauses rank higher.
 *
 * @param {string} searchQuery - The user's search input (already trimmed)
 * @returns {Object} The `$search` pipeline stage
 */
const buildSearchStage = (searchQuery) => {
  const shouldClauses = [];

  // 1. Phrase match — boost exact phrase appearances
  shouldClauses.push({
    phrase: {
      query: searchQuery,
      path: PHRASE_MATCH_FIELDS,
      score: { boost: { value: 5 } },
    },
  });

  // 2. Fuzzy text match — typo tolerance (1 edit, min 2-char prefix lock)
  shouldClauses.push({
    text: {
      query: searchQuery,
      path: SEARCHABLE_TEXT_FIELDS,
      fuzzy: {
        maxEdits: 1,
        prefixLength: 2,
      },
    },
  });

  // 3. Wildcard for partial/substring matching on product name
  //    Only apply if the query is at least 2 characters to avoid overly broad matches
  if (searchQuery.length >= 2) {
    shouldClauses.push({
      wildcard: {
        query: `*${searchQuery}*`,
        path: "name",
        allowAnalyzedField: true,
        score: { boost: { value: 2 } },
      },
    });
  }

  return {
    $search: {
      index: SEARCH_INDEX_NAME,
      compound: {
        should: shouldClauses,
        minimumShouldMatch: 1,
      },
    },
  };
};

// ─── FILTER STAGES ───────────────────────────────────────────────

/**
 * Build `$match` stages for post-search filtering.
 *
 * Filters are applied AFTER `$search` because Atlas Search `$search`
 * doesn't natively support ObjectId or nested array filtering.
 * This is the recommended pattern from MongoDB docs.
 *
 * @param {Object} filters - Validated filter parameters
 * @param {string} [filters.category] - Category ObjectId
 * @param {string} [filters.brand] - Brand name (case-insensitive exact match)
 * @param {number} [filters.minPrice] - Minimum price
 * @param {number} [filters.maxPrice] - Maximum price
 * @param {string} [filters.color] - Variant color name (case-insensitive)
 * @param {number} [filters.size] - Variant size number
 * @param {boolean} [filters.inStock] - Whether to filter by in-stock variants
 * @returns {Array<Object>} Array of `$match` pipeline stages
 */
const buildFilterStages = (filters) => {
  const matchConditions = {};

  if (filters.category) {
    if (mongoose.isValidObjectId(filters.category)) {
      matchConditions.category = new mongoose.Types.ObjectId(filters.category);
    }
  }

  if (filters.brand) {
    if (mongoose.isValidObjectId(filters.brand)) {
      matchConditions.brand = new mongoose.Types.ObjectId(filters.brand);
    }
  }

  // Price range filter
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    matchConditions.price = {};
    if (filters.minPrice !== undefined) {
      matchConditions.price.$gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      matchConditions.price.$lte = filters.maxPrice;
    }
  }

  // Color filter — matches against nested variant color names
  if (filters.color) {
    matchConditions["variants.color.name"] = {
      $regex: `^${escapeRegex(filters.color)}$`,
      $options: "i",
    };
  }

  // Size filter — matches against nested variant sizes
  if (filters.size !== undefined) {
    matchConditions["variants.sizes.size"] = filters.size;
  }

  // In-stock filter — at least one variant size has stock > 0
  if (filters.inStock === true) {
    matchConditions["variants.sizes.stock"] = { $gt: 0 };
  }

  // Gender filter — matches specified gender or Unisex (e.g. Men includes Men & Unisex)
  if (filters.gender) {
    const gLower = String(filters.gender).toLowerCase();
    if (gLower === "men" || gLower === "women") {
      matchConditions.gender = {
        $in: [
          new RegExp(`^${escapeRegex(filters.gender)}$`, "i"),
          /^Unisex$/i,
        ],
      };
    } else {
      matchConditions.gender = {
        $regex: `^${escapeRegex(filters.gender)}$`,
        $options: "i",
      };
    }
  }

  const stages = [];

  if (Object.keys(matchConditions).length > 0) {
    stages.push({ $match: matchConditions });
  }

  return stages;
};

// ─── SORT STAGE ──────────────────────────────────────────────────

/**
 * Build the `$sort` stage. When a search query is active and sort is
 * "newest" (the default), we sort by search relevance score instead.
 *
 * For the "discount" sort, we add an `$addFields` stage to compute
 * the discount percentage from price and originalPrice.
 *
 * @param {string} sortKey - One of the SORT_MAP keys
 * @param {boolean} hasSearchQuery - Whether a text search is active
 * @returns {Array<Object>} Array of pipeline stages ($addFields + $sort)
 */
const buildSortStages = (sortKey, hasSearchQuery) => {
  const stages = [];

  // When searching with default sort, prioritize relevance
  if (hasSearchQuery && sortKey === "newest") {
    stages.push({
      $sort: { score: { $meta: "searchScore" }, createdAt: -1 },
    });
    return stages;
  }

  // Discount sort needs a computed field
  if (sortKey === "discount") {
    stages.push({
      $addFields: {
        _discountPercent: {
          $cond: {
            if: {
              $and: [
                { $gt: ["$originalPrice", 0] },
                { $gt: ["$originalPrice", "$price"] },
              ],
            },
            then: {
              $multiply: [
                {
                  $divide: [
                    { $subtract: ["$originalPrice", "$price"] },
                    "$originalPrice",
                  ],
                },
                100,
              ],
            },
            else: 0,
          },
        },
      },
    });
  }

  const sortSpec = SORT_MAP[sortKey] || SORT_MAP.newest;
  stages.push({ $sort: sortSpec });

  return stages;
};

// ─── PAGINATION STAGES ───────────────────────────────────────────

/**
 * Build `$skip` and `$limit` stages for pagination.
 *
 * @param {number} page - 1-indexed page number
 * @param {number} limit - Items per page
 * @returns {Array<Object>} [$skip, $limit] stages
 */
const buildPaginationStages = (page, limit) => {
  const skip = (page - 1) * limit;
  return [{ $skip: skip }, { $limit: limit }];
};

// ─── PROJECTION STAGE ────────────────────────────────────────────

/**
 * Build the `$project` stage to return only necessary fields.
 * Keeps the response payload lean for list views.
 *
 * @param {boolean} includeScore - Whether to include the search relevance score
 * @returns {Object} The `$project` pipeline stage
 */
const buildProjectionStage = (includeScore) => {
  const projection = {
    name: 1,
    slug: 1,
    description: 1,
    price: 1,
    originalPrice: 1,
    brand: 1,
    tags: 1,
    category: 1,
    gender: 1,
    variants: 1,
    averageRating: 1,
    numReviews: 1,
    salesCount: 1,
    createdAt: 1,
  };

  if (includeScore) {
    projection.searchScore = { $meta: "searchScore" };
  }

  return { $project: projection };
};

// ─── CATEGORY LOOKUP STAGE ───────────────────────────────────────

/**
 * Build `$lookup` + `$unwind` stages to populate the category field,
 * equivalent to Mongoose's `.populate("category", "name slug")`.
 *
 * We use aggregation $lookup because we're building raw pipelines
 * (Mongoose populate doesn't work with aggregate).
 *
 * @returns {Array<Object>} [$lookup, $unwind] stages
 */
const buildCategoryLookup = () => {
  return [
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
        pipeline: [{ $project: { name: 1, slug: 1 } }],
      },
    },
    {
      $unwind: {
        path: "$category",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];
};

/**
 * Build `$lookup` + `$unwind` stages to populate the brand field.
 *
 * @returns {Array<Object>} [$lookup, $unwind] stages
 */
const buildBrandLookup = () => {
  return [
    {
      $lookup: {
        from: "brands",
        localField: "brand",
        foreignField: "_id",
        as: "brand",
        pipeline: [{ $project: { name: 1, slug: 1, logo: 1 } }],
      },
    },
    {
      $unwind: {
        path: "$brand",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];
};

// ─── AUTOCOMPLETE PIPELINE ───────────────────────────────────────

/**
 * Build the complete aggregation pipeline for search suggestions
 * using Atlas Search autocomplete.
 *
 * @param {string} query - The partial search input (e.g. "snea")
 * @param {number} [limit=10] - Max suggestions to return
 * @returns {Array<Object>} Complete aggregation pipeline
 */
const buildAutocompletePipeline = (query, limit = 10) => {
  return [
    {
      $search: {
        index: SEARCH_INDEX_NAME,
        autocomplete: {
          query: query,
          path: "name",
          tokenOrder: "sequential",
          fuzzy: {
            maxEdits: 1,
            prefixLength: 2,
          },
        },
      },
    },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        name: 1,
        score: { $meta: "searchScore" },
      },
    },
  ];
};

// ─── HELPERS ─────────────────────────────────────────────────────

/**
 * Escape special regex characters in a string.
 * Used for the brand exact-match filter (not for search — Atlas handles that).
 *
 * @param {string} str
 * @returns {string}
 */
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// ─── EXPORTS ─────────────────────────────────────────────────────

module.exports = {
  buildSearchStage,
  buildFilterStages,
  buildSortStages,
  buildPaginationStages,
  buildProjectionStage,
  buildCategoryLookup,
  buildBrandLookup,
  buildAutocompletePipeline,
  SORT_MAP,
};
