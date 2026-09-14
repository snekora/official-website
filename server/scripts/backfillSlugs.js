require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../modules/product/product.model");

const backfillSlugs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    // We can just find all products and save them to trigger the pre-save hook,
    // or manually set the slug if missing.
    const products = await Product.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }] });
    console.log(`Found ${products.length} products without a slug.`);

    for (let product of products) {
      if (!product.slug && product.name) {
        let baseSlug = product.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        
        let finalSlug = baseSlug;
        // Check for uniqueness
        let count = 1;
        while (await Product.exists({ slug: finalSlug, _id: { $ne: product._id } })) {
          finalSlug = `${baseSlug}-${count}`;
          count++;
        }
        
        product.slug = finalSlug;
        await product.save();
        console.log(`Updated product: ${product.name} -> ${product.slug}`);
      }
    }

    console.log("Backfill complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error backfilling slugs:", error);
    process.exit(1);
  }
};

backfillSlugs();
