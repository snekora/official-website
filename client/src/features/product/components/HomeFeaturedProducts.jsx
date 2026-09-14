import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicProducts } from "../redux/productSlice";
import { Loader2 } from "lucide-react";

import ProductCard from "../../../components/ProductCard";

const HomeFeaturedProducts = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(fetchPublicProducts({ limit: 4 })); // Fetch 4 products for the homepage
  }, [dispatch]);

  return (
    <section className="bg-black py-12 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-[22px] sm:text-3xl font-bold">
            Featured Drops
          </h2>
          <Link
            to="/products"
            className="text-lime-300 text-sm font-semibold hover:text-lime-400 transition-colors tracking-wider"
          >
            View All
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 size={32} className="animate-spin text-lime-400" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center min-h-[300px] text-zinc-500">
            No products found.
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeFeaturedProducts;
