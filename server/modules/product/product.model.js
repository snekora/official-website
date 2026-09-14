const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    originalPrice: {
      type: Number,
      min: 0,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex", "Kids"],
      default: "Unisex",
    },

    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      index: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    salesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    variants: [
      {
        color: {
          name: String,
          hex: String,
        },

        images: [
          {
            url: { type: String, required: true },
            publicId: { type: String, required: true },
          },
        ],

        sizes: [
          {
            size: Number,
            stock: {
              type: Number,
              default: 0,
              min: 0,
            },
          },
        ],
      },
    ],

    averageRating: {
      type: Number,
      default: 0,
    },

    numReviews: {
      type: Number,
      default: 0,
    },

    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Pre-save hook to generate slug from name
productSchema.pre("save", function () {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
});

module.exports = mongoose.model("Product", productSchema);
