const cloudinary = require("../config/cloudinary");
const ApiError = require("../utils/ApiError");

/**
 * Upload a single image buffer to Cloudinary.
 *
 * @param {Buffer}  fileBuffer  - The image file buffer (from multer memoryStorage)
 * @param {string}  folder      - The Cloudinary folder path (e.g. "snekora/products/<id>/<color>")
 * @returns {Promise<{ publicId: string, url: string }>}
 */
const uploadImage = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          return reject(
            new ApiError(500, `Cloudinary upload failed: ${error.message}`),
          );
        }
        resolve({
          publicId: result.public_id,
          url: result.secure_url,
        });
      },
    );

    stream.end(fileBuffer);
  });
};

/**
 * Upload a single video buffer to Cloudinary.
 *
 * @param {Buffer}  fileBuffer  - The video file buffer (from multer memoryStorage)
 * @param {string}  folder      - The Cloudinary folder path
 * @returns {Promise<{ publicId: string, url: string }>}
 */
const uploadVideo = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "video",
        // Optional: you can add specific video transformations here
      },
      (error, result) => {
        if (error) {
          return reject(
            new ApiError(500, `Cloudinary upload failed: ${error.message}`),
          );
        }
        resolve({
          publicId: result.public_id,
          url: result.secure_url,
        });
      },
    );

    stream.end(fileBuffer);
  });
};

/**
 * Upload multiple image buffers to Cloudinary.
 *
 * @param {Array<{ buffer: Buffer }>}  files   - Array of multer file objects
 * @param {string}                     folder  - Target Cloudinary folder
 * @returns {Promise<Array<{ publicId: string, url: string }>>}
 */
const uploadImages = async (files, folder) => {
  if (!files || files.length === 0) return [];

  const uploads = files.map((file) => uploadImage(file.buffer, folder));
  return Promise.all(uploads);
};

/**
 * Delete a single image from Cloudinary by its public ID.
 *
 * @param {string} publicId - The Cloudinary public_id of the image
 */
const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Failed to delete image ${publicId}:`, error.message);
  }
};

/**
 * Delete a single video from Cloudinary by its public ID.
 *
 * @param {string} publicId - The Cloudinary public_id of the video
 */
const deleteVideo = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
  } catch (error) {
    console.error(`Failed to delete video ${publicId}:`, error.message);
  }
};

/**
 * Delete all images under a Cloudinary folder prefix, then remove the
 * empty folder(s). Used when deleting a product or variant.
 *
 * @param {string} folderPath - e.g. "snekora/products/<productId>"
 */
const deleteFolder = async (folderPath) => {
  try {
    // Delete all resources (images) under the folder prefix
    await cloudinary.api.delete_resources_by_prefix(folderPath);

    // Attempt to delete the now-empty folder itself.
    // This can fail silently if sub-folders still exist; Cloudinary
    // requires folders to be empty before deletion.
    try {
      await cloudinary.api.delete_folder(folderPath);
    } catch {
      // Folder may have nested sub-folders that were already cleaned.
      // Cloudinary auto-cleans empty parent folders eventually.
    }
  } catch (error) {
    console.error(`Failed to delete folder ${folderPath}:`, error.message);
  }
};

module.exports = {
  uploadImage,
  uploadVideo,
  uploadImages,
  deleteImage,
  deleteVideo,
  deleteFolder,
};
