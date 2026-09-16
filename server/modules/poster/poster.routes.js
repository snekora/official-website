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

const posterUpload = upload.fields([
  { name: "desktopImage", maxCount: 1 },
  { name: "mobileImage", maxCount: 1 },
  { name: "image", maxCount: 1 },
]);

router.post(
  "/",
  posterUpload,
  createPoster
);

router.put(
  "/:id",
  posterUpload,
  updatePoster
);

router.delete("/:id", deletePoster);

module.exports = router;
