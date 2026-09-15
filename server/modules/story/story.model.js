const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    video: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    thumbnail: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Story", storySchema);
