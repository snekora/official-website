const mongoose = require("mongoose");
const ApiError = require("../../utils/ApiError");
const { SORT_MAP } = require("./productSearch.pipeline");

// ─── VALID SORT OPTIONS ──────────────────────────────────────────

const VALID_SORT_KEYS = Object.keys(SORT_MAP);

// ─── DEFAULTS ────────────────────────────────────────────────────

const DEFAULTS = {
  sort: "newest",
  page: 1,
  limit: 20,
};

// ─── LIMITS ──────────────────────────────────────────────────────

const LIMITS = {
  searchMaxLength: 200,
  pageMin: 1,
  limitMin: 1,
  limitMax: 100,
};

// ─── VALIDATOR ───────────────────────────────────────────────────

/**
 * Validate and sanitize all query parameters for the product search endpoint.
 *
 * Returns a clean object with properly typed values or throws an ApiError(400)
 * with a descriptive message for the first invalid parameter encountered.
 *
 * @param {Object} query - Express req.query object
 * @returns {Object} Sanitized parameters
 * @throws {ApiError} 400 if any parameter is invalid
 */
const validateSearchParams = (query) => {
  const errors = [];
  const sanitized = {};

  // ── search ───────────────────────────────────────────────────
  if (query.search !== undefined) {
    const search = String(query.search).trim();
    if (search.length > LIMITS.searchMaxLength) {
      errors.push(
        `Search query must be ${LIMITS.searchMaxLength} characters or fewer`,
      );
    }
    sanitized.search = search || "";
  } else {
    sanitized.search = "";
  }

  // ── gender ───────────────────────────────────────────────────
  if (query.gender !== undefined && query.gender !== "") {
    const gender = String(query.gender).trim();
    const VALID_GENDERS = ["Men", "Women", "Unisex", "Kids"];
    const matchedGender = VALID_GENDERS.find(
      (g) => g.toLowerCase() === gender.toLowerCase()
    );
    if (!matchedGender) {
      errors.push(
        `Invalid gender option "${query.gender}". Valid options: ${VALID_GENDERS.join(", ")}`
      );
    } else {
      sanitized.gender = matchedGender;
    }
  }

  // ── category (ObjectId or slug) ─────────────────────────────
  if (query.category !== undefined && query.category !== "") {
    sanitized.category = String(query.category).trim();
  }

  // ── brand ────────────────────────────────────────────────────
  if (query.brand !== undefined && query.brand !== "") {
    sanitized.brand = String(query.brand).trim();
  }

  // ── minPrice ─────────────────────────────────────────────────
  if (query.minPrice !== undefined && query.minPrice !== "") {
    const minPrice = Number(query.minPrice);
    if (isNaN(minPrice) || minPrice < 0) {
      errors.push("minPrice must be a non-negative number");
    } else {
      sanitized.minPrice = minPrice;
    }
  }

  // ── maxPrice ─────────────────────────────────────────────────
  if (query.maxPrice !== undefined && query.maxPrice !== "") {
    const maxPrice = Number(query.maxPrice);
    if (isNaN(maxPrice) || maxPrice < 0) {
      errors.push("maxPrice must be a non-negative number");
    } else {
      sanitized.maxPrice = maxPrice;
    }
  }

  // ── minPrice <= maxPrice cross-validation ────────────────────
  if (
    sanitized.minPrice !== undefined &&
    sanitized.maxPrice !== undefined &&
    sanitized.minPrice > sanitized.maxPrice
  ) {
    errors.push("minPrice cannot be greater than maxPrice");
  }

  // ── color ────────────────────────────────────────────────────
  if (query.color !== undefined && query.color !== "") {
    sanitized.color = String(query.color).trim();
  }

  // ── size ─────────────────────────────────────────────────────
  if (query.size !== undefined && query.size !== "") {
    const size = Number(query.size);
    if (isNaN(size) || size <= 0) {
      errors.push("Size must be a positive number");
    } else {
      sanitized.size = size;
    }
  }

  // ── inStock ──────────────────────────────────────────────────
  if (query.inStock !== undefined && query.inStock !== "") {
    const val = String(query.inStock).toLowerCase();
    if (val !== "true" && val !== "false") {
      errors.push('inStock must be "true" or "false"');
    } else {
      sanitized.inStock = val === "true";
    }
  }

  // ── sort ─────────────────────────────────────────────────────
  if (query.sort !== undefined && query.sort !== "") {
    const sort = String(query.sort).toLowerCase();
    if (!VALID_SORT_KEYS.includes(sort)) {
      errors.push(
        `Invalid sort option "${query.sort}". Valid options: ${VALID_SORT_KEYS.join(", ")}`,
      );
    } else {
      sanitized.sort = sort;
    }
  } else {
    sanitized.sort = DEFAULTS.sort;
  }

  // ── page ─────────────────────────────────────────────────────
  if (query.page !== undefined && query.page !== "") {
    const page = Number(query.page);
    if (!Number.isInteger(page) || page < LIMITS.pageMin) {
      errors.push(
        `Page must be a positive integer (minimum ${LIMITS.pageMin})`,
      );
    } else {
      sanitized.page = page;
    }
  } else {
    sanitized.page = DEFAULTS.page;
  }

  // ── limit ────────────────────────────────────────────────────
  if (query.limit !== undefined && query.limit !== "") {
    const limit = Number(query.limit);
    if (
      !Number.isInteger(limit) ||
      limit < LIMITS.limitMin ||
      limit > LIMITS.limitMax
    ) {
      errors.push(
        `Limit must be an integer between ${LIMITS.limitMin} and ${LIMITS.limitMax}`,
      );
    } else {
      sanitized.limit = limit;
    }
  } else {
    sanitized.limit = DEFAULTS.limit;
  }

  // ── Return or throw ──────────────────────────────────────────
  if (errors.length > 0) {
    throw new ApiError(400, `Invalid query parameters: ${errors.join(". ")}`);
  }

  return sanitized;
};

/**
 * Validate the suggestion query parameter.
 *
 * @param {Object} query - Express req.query object
 * @returns {{ q: string }} Sanitized query
 * @throws {ApiError} 400 if query is missing or invalid
 */
const validateSuggestionParams = (query) => {
  if (!query.q || String(query.q).trim() === "") {
    throw new ApiError(400, 'Query parameter "q" is required for suggestions');
  }

  const q = String(query.q).trim();

  if (q.length > LIMITS.searchMaxLength) {
    throw new ApiError(
      400,
      `Suggestion query must be ${LIMITS.searchMaxLength} characters or fewer`,
    );
  }

  if (q.length < 1) {
    throw new ApiError(400, "Suggestion query must be at least 1 character");
  }

  return { q };
};

module.exports = {
  validateSearchParams,
  validateSuggestionParams,
};
