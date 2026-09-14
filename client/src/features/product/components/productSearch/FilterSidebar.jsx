import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../../../services/api";

const SIZES = [6, 7, 8, 9, 10, 11, 12];

const FilterSidebar = ({ onClose }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data } = await api.get("/brands");
        if (data.success && data.brands) {
          setBrands(data.brands);
        }
      } catch {
        // Fallback static brands if API fails
        setBrands([
          { _id: "nike", name: "Nike" },
          { _id: "adidas", name: "Adidas" },
          { _id: "puma", name: "Puma" },
          { _id: "jordan", name: "Jordan" },
        ]);
      }
    };
    fetchBrands();
  }, []);

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);

    // Toggle behavior for most filters
    if (newParams.get(key) === String(value)) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }

    newParams.set("page", "1"); // Reset page
    setSearchParams(newParams);
  };

  const handlePriceChange = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const min = formData.get("minPrice");
    const max = formData.get("maxPrice");

    const newParams = new URLSearchParams(searchParams);
    if (min) newParams.set("minPrice", min);
    else newParams.delete("minPrice");

    if (max) newParams.set("maxPrice", max);
    else newParams.delete("maxPrice");

    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setSearchParams({});
    if (onClose) onClose();
  };

  const currentBrand = searchParams.get("brand");
  const currentSize = searchParams.get("size");
  const inStock = searchParams.get("inStock") === "true";

  return (
    <div className="space-y-8 pb-8">
      {/* Brands */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
          Brand
        </h3>
        <div className="space-y-2">
          {brands.map((b) => {
            const brandIdentifier = b.slug || b._id || b.name;
            const isSelected =
              currentBrand === brandIdentifier ||
              currentBrand === b.slug ||
              currentBrand === b._id ||
              currentBrand === b.name;

            return (
              <label
                key={b._id || b.name}
                className="flex items-center gap-3 group cursor-pointer"
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                    isSelected
                      ? "bg-lime-400 border-lime-400"
                      : "border-white/20 group-hover:border-white/50"
                  }`}
                  onClick={() => handleFilterChange("brand", brandIdentifier)}
                >
                  {isSelected && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3.5 h-3.5 text-black"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </motion.svg>
                  )}
                </div>
                <span
                  className={`text-sm ${
                    isSelected
                      ? "text-white font-medium"
                      : "text-gray-400"
                  } group-hover:text-white transition`}
                  onClick={() => handleFilterChange("brand", brandIdentifier)}
                >
                  {b.name}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
          Price Range (₹)
        </h3>
        <form onSubmit={handlePriceChange} className="flex items-center gap-2">
          <input
            type="number"
            name="minPrice"
            placeholder="Min"
            defaultValue={searchParams.get("minPrice") || ""}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-lime-400/50"
          />
          <span className="text-gray-500">-</span>
          <input
            type="number"
            name="maxPrice"
            placeholder="Max"
            defaultValue={searchParams.get("maxPrice") || ""}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-lime-400/50"
          />
          <button
            type="submit"
            className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </form>
      </div>

      {/* Size */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
          Size (UK)
        </h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => {
            const isActive = currentSize === String(size);
            return (
              <button
                key={size}
                onClick={() => handleFilterChange("size", size)}
                className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white text-black ring-2 ring-white"
                    : "bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a] hover:text-white"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stock Toggle */}
      <div className="pt-4 border-t border-white/10">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm font-medium text-gray-300 group-hover:text-white transition">
            In Stock Only
          </span>
          <div
            className={`w-11 h-6 rounded-full relative transition-colors ${
              inStock ? "bg-lime-400" : "bg-[#2a2a2a]"
            }`}
            onClick={() => handleFilterChange("inStock", inStock ? "" : "true")}
          >
            <motion.div
              initial={false}
              animate={{ x: inStock ? 22 : 2 }}
              className="absolute top-[2px] w-5 h-5 bg-white rounded-full shadow-sm"
            />
          </div>
        </label>
      </div>

      <button
        onClick={resetFilters}
        className="w-full py-3 bg-red-500/10 text-red-500 font-semibold rounded-xl text-sm hover:bg-red-500/20 transition"
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default FilterSidebar;
