const express = require("express");
const { authenticate } = require("../../middleware/auth.middleware");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} = require("./wishlist.controller");

const router = express.Router();

router.use(authenticate); // All wishlist routes require authentication

router.route("/").get(getWishlist).delete(clearWishlist);
router.route("/:productId").post(addToWishlist).delete(removeFromWishlist);

module.exports = router;
