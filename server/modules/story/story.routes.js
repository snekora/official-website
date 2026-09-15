const express = require("express");
const {
  createStory,
  getStories,
  getAdminStories,
  updateStory,
  deleteStory,
} = require("./story.controller");
const { authenticateAdmin } = require("../../middleware/auth.middleware");
const upload = require("../../middleware/upload.middleware");

const router = express.Router();

// Public route
router.get("/", getStories);

// Admin routes
router.use(authenticateAdmin);


router.get("/admin", getAdminStories);

router.post(
  "/",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  createStory
);

router.put(
  "/:id",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  updateStory
);

router.delete("/:id", deleteStory);

module.exports = router;
