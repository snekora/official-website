const mongoose = require("mongoose");

const posterSchema = new mongoose.Schema(
  {
    image: {
      url: { type: String },
      publicId: { type: String },
    },
    desktopImage: {
      url: { type: String },
      publicId: { type: String },
    },
    mobileImage: {
      url: { type: String },
      publicId: { type: String },
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Poster", posterSchema);
