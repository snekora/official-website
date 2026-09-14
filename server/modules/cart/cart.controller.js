const Cart = require("./cart.model");
const Product = require("../product/product.model");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate({
    path: "items.product",
    select: "name slug price originalPrice variants brand",
    populate: {
      path: "brand",
      select: "name",
    },
  });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.status(200).json(
    ApiResponse.success({ cart }, "Cart fetched successfully")
  );
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = asyncHandler(async (req, res, next) => {
  const { productId, variantId, size, quantity = 1 } = req.body;

  if (!productId || !variantId || !size) {
    throw new ApiError(400, "Product ID, variant ID, and size are required");
  }

  // Verify product and variant/size exist and have stock
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const variant = product.variants.id(variantId);
  if (!variant) {
    throw new ApiError(404, "Variant not found");
  }

  const sizeObj = variant.sizes.find((s) => s.size === Number(size));
  if (!sizeObj) {
    throw new ApiError(404, "Size not found for this variant");
  }

  if (sizeObj.stock < quantity) {
    throw new ApiError(400, `Only ${sizeObj.stock} items left in stock for this size`);
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [{ product: productId, variant: variantId, size, quantity }],
    });
  } else {
    // Check if item already exists in cart
    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.variant.toString() === variantId &&
        item.size === Number(size),
    );

    if (itemIndex > -1) {
      // Item exists, update quantity
      const newQuantity = cart.items[itemIndex].quantity + quantity;

      // Check stock for new quantity
      if (sizeObj.stock < newQuantity) {
        throw new ApiError(400, `Cannot add ${quantity} more. Only ${sizeObj.stock} items left in stock`);
      }

      cart.items[itemIndex].quantity = newQuantity;
    } else {
      // Item does not exist, push to items array
      cart.items.push({
        product: productId,
        variant: variantId,
        size,
        quantity,
      });
    }
    await cart.save();
  }

  // Populate before returning
  await cart.populate({
    path: "items.product",
    select: "name slug price originalPrice variants brand",
    populate: {
      path: "brand",
      select: "name",
    },
  });

  res.status(200).json(
    ApiResponse.success({ cart }, "Item added to cart")
  );
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
exports.updateCartItem = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const { itemId } = req.params;

  if (quantity < 1) {
    throw new ApiError(400, "Quantity cannot be less than 1");
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const itemIndex = cart.items.findIndex(
    (item) => item._id.toString() === itemId,
  );
  if (itemIndex === -1) {
    throw new ApiError(404, "Item not found in cart");
  }

  // Verify stock before updating
  const item = cart.items[itemIndex];
  const product = await Product.findById(item.product);
  if (product) {
    const variant = product.variants.id(item.variant);
    if (variant) {
      const sizeObj = variant.sizes.find((s) => s.size === item.size);
      if (sizeObj && sizeObj.stock < quantity) {
        throw new ApiError(400, `Only ${sizeObj.stock} items left in stock`);
      }
    }
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();

  await cart.populate({
    path: "items.product",
    select: "name slug price originalPrice variants brand",
    populate: {
      path: "brand",
      select: "name",
    },
  });

  res.status(200).json(
    ApiResponse.success({ cart }, "Cart updated successfully")
  );
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeCartItem = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
  await cart.save();

  await cart.populate({
    path: "items.product",
    select: "name slug price originalPrice variants brand",
    populate: {
      path: "brand",
      select: "name",
    },
  });

  res.status(200).json(
    ApiResponse.success({ cart }, "Item removed from cart")
  );
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  res.status(200).json(
    ApiResponse.success({ cart }, "Cart cleared")
  );
});
