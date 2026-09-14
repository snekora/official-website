const express = require("express");
const { authenticate } = require("../../middleware/auth.middleware");
const {
  addAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("./address.controller");

const router = express.Router();

// All address routes require authentication
router.use(authenticate);

router.route("/")
  .post(addAddress)
  .get(getAddresses);

router.route("/:id")
  .get(getAddressById)
  .put(updateAddress)
  .delete(deleteAddress);

router.patch("/:id/default", setDefaultAddress);

module.exports = router;
