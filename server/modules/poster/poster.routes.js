const express = require("express");
const {
  createPoster,
  getPosters,
  getAdminPosters,
  updatePoster,
  deletePoster,
} = require("./poster.controller");
const { authenticateAdmin } = require("../../middleware/auth.middleware");
const upload = require("../../middleware/upload.middleware");

const router = express.Router();

// Public route
router.get("/", getPosters);

// Admin routes
router.use(authenticateAdmin);

router.get("/admin", getAdminPosters);

router.post(
  "/",
  upload.single("image"),
  createPoster
);

router.put(
  "/:id",
  upload.single("image"),
  updatePoster
);

router.delete("/:id", deletePoster);

module.exports = router;
