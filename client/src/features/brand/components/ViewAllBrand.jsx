import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowUpRight } from "lucide-react";
import { fetchBrands } from "../redux/brandSlice";

import Breadcrumbs from "../../../components/Breadcrumbs";
import placeholderImg from "../../../assets/placeholder/placeholder.png";

const getBrandImage = (brand) => {
  if (brand?.logo && typeof brand.logo === "object" && brand.logo.url)
    return brand.logo.url;
  if (typeof brand?.logo === "string" && brand.logo) return brand.logo;
  if (brand?.image) return brand.image;
  return placeholderImg;
};

const ViewAllBrand = () => {
  const dispatch = useDispatch();
  const { brands: apiBrands } = useSelector((state) => state.brand);

  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  const displayBrands = apiBrands || [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-14">
      {/* Top Navigation / Breadcrumbs */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Brands" }]} />
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-lime-400 uppercase tracking-[0.25em] text-xs font-semibold mb-2">
                Explore
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black">
                Shop by Brand
              </h1>
              <p className="text-zinc-400 mt-3 max-w-2xl text-sm sm:text-base">
                Browse all top brands to discover products.
              </p>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-lime-300 hover:text-lime-400 transition"
            >
              View All Products
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        {displayBrands.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 text-sm bg-white/[0.02] rounded-3xl border border-white/5">
            No brands available right now. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {displayBrands.map((brand) => (
              <Link
                key={brand.slug || brand._id || brand.name}
                to={`/products?brand=${brand.slug || brand.name}`}
                className="group relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/5 bg-white/5 shadow-lg"
              >
                <img
                  src={getBrandImage(brand)}
                  alt={brand.name}
                  onError={(e) => {
                    e.target.src = placeholderImg;
                  }}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/25 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold leading-tight">
                      {brand.name}
                    </h2>
                    <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                      Shop Collection
                    </p>
                  </div>

                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-black flex items-center justify-center shrink-0 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <ArrowUpRight size={17} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAllBrand;
