const express = require("express");
const authRoutes = require("../modules/auth/auth.routes");
const adminAuthRoutes = require("../modules/auth/admin.auth.routes");
const addressRoutes = require("../modules/address/address.routes");
const productRoutes = require("../modules/product/product.routes");
const categoryRoutes = require("../modules/category/category.routes");
const brandRoutes = require("../modules/brand/brand.routes");
const reviewRoutes = require("../modules/productReview/review.routes");
const cartRoutes = require("../modules/cart/cart.routes");

const router = express.Router();

// Mount all module routes here
router.use("/auth", authRoutes);
router.use("/auth/admin", adminAuthRoutes);
router.use("/address", addressRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);
router.use("/products", reviewRoutes); // /api/products/:productId/reviews
router.use("/reviews", reviewRoutes); // /api/reviews/admin/:reviewId
router.use("/cart", cartRoutes);

module.exports = router;


