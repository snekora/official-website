const asyncHandler = require("../../utils/asyncHandler");
const User = require("../users/user.model");
const Product = require("../product/product.model");
const mongoose = require("mongoose");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");

const wishlistPopulateOptions = {
  path: "wishlist",
  select: "name price originalPrice slug brand category variants",
  populate: [
    { path: "brand", select: "name" },
    { path: "category", select: "name" },
  ],
};

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(wishlistPopulateOptions);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Filter out any deleted products that might have populated as null
  const cleanWishlist = (user.wishlist || []).filter((item) => item !== null);

  res.status(200).json(
    ApiResponse.success({ wishlist: cleanWishlist }, "Wishlist fetched successfully")
  );
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const user = await User.findById(req.user._id);

  const isAlreadyInWishlist = user.wishlist.some(
    (id) => id.toString() === productId.toString()
  );

  if (!isAlreadyInWishlist) {
    user.wishlist.push(productId);
    await user.save();
  }

  // Return updated wishlist
  const updatedUser = await User.findById(req.user._id).populate(wishlistPopulateOptions);
  const cleanWishlist = (updatedUser.wishlist || []).filter((item) => item !== null);

  res.status(200).json(
    ApiResponse.success({ wishlist: cleanWishlist }, "Product added to wishlist")
  );
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const user = await User.findById(req.user._id);

  user.wishlist = user.wishlist.filter(
    (id) => id.toString() !== productId.toString()
  );
  await user.save();

  // Return updated wishlist
  const updatedUser = await User.findById(req.user._id).populate(wishlistPopulateOptions);
  const cleanWishlist = (updatedUser.wishlist || []).filter((item) => item !== null);

  res.status(200).json(
    ApiResponse.success({ wishlist: cleanWishlist }, "Product removed from wishlist")
  );
});

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
const clearWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.wishlist = [];
    await user.save();
  }

  res.status(200).json(
    ApiResponse.success({ wishlist: [] }, "Wishlist cleared successfully")
  );
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
};
