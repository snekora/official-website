const express = require("express");
const { authenticate } = require("../../middleware/auth.middleware");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("./cart.controller");

const router = express.Router();

router.use(authenticate); // All cart routes are protected

router.route("/")
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.route("/:itemId")
  .put(updateCartItem)
  .delete(removeCartItem);

module.exports = router;
