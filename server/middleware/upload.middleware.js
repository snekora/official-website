const multer = require("multer");
const ApiError = require("../utils/ApiError");

/**
 * Multer configuration using memory storage.
 *
 * Files are kept in memory as Buffers, which are then streamed
 * directly to Cloudinary — no temp files written to disk.
 */
const storage = multer.memoryStorage();

/**
 * File filter: only allow image mime types.
 */
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(
      new ApiError(400, `Invalid file type: ${file.mimetype}. Only images and videos are allowed.`),
      false,
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB per file (increased to allow videos)
    files: 10,                  // Max 10 files per request
  },
});

module.exports = upload;
