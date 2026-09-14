const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    logo: {
      url: {
        type: String,
        required: [true, "Brand logo URL is required"],
      },
      publicId: {
        type: String,
        required: [true, "Brand logo publicId is required"],
      },
    },

    description: String,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Brand", brandSchema);
