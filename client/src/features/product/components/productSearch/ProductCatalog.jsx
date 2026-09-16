import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Loader2, SlidersHorizontal, X, Search } from "lucide-react";
import { fetchPublicProducts } from "../../redux/productSlice";
import ProductCard from "../../../../components/ProductCard";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import FilterSidebar from "./FilterSidebar";
import Pagination from "./Pagination";
import { motion, AnimatePresence } from "framer-motion";

const ProductCatalog = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);

  const { products, totalProducts, currentPage, totalPages, loading, error } =
    useSelector((state) => state.product);

  const currentSearch = searchParams.get("search") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const currentGender = searchParams.get("gender") || "";
  const currentBrand = searchParams.get("brand") || "";
  const currentSize = searchParams.get("size") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const inStock = searchParams.get("inStock") === "true";

  // Build query object from URL params
  const queryParams = Object.fromEntries([...searchParams]);

  useEffect(() => {
    dispatch(fetchPublicProducts(queryParams));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [dispatch, searchParams]);

  const removeFilterParam = (key) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(key);
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const handleSortChange = (e) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("sort", e.target.value);
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const getPageTitle = () => {
    if (currentSearch) return `Search Results`;
    if (currentGender) {
      if (currentGender.toLowerCase() === "men") return "Men's Sneakers & Shoes";
      if (currentGender.toLowerCase() === "women") return "Women's Sneakers & Shoes";
      return `${currentGender}'s Collection`;
    }
    if (currentSort === "newest" && !currentBrand && !searchParams.get("category")) {
      return "New Arrivals";
    }
    if (currentBrand) return `${currentBrand.charAt(0).toUpperCase() + currentBrand.slice(1)} Sneakers`;
    return "All Products";
  };

  const getBreadcrumbItems = () => {
    const items = [{ label: "Products", path: "/products" }];
    if (currentGender) {
      items.push({ label: currentGender });
    } else if (currentSort === "newest" && !currentBrand && !currentSearch) {
      items.push({ label: "New Arrivals" });
    } else if (currentBrand) {
      items.push({ label: currentBrand.charAt(0).toUpperCase() + currentBrand.slice(1) });
    } else if (currentSearch) {
      items.push({ label: `"${currentSearch}"` });
    }
    return items;
  };

  const activeFilters = [];
  if (currentSearch) {
    activeFilters.push({ label: `Search: "${currentSearch}"`, onRemove: () => removeFilterParam("search") });
  }
  if (currentGender) {
    activeFilters.push({ label: `Gender: ${currentGender}`, onRemove: () => removeFilterParam("gender") });
  }
  if (currentBrand) {
    activeFilters.push({ label: `Brand: ${currentBrand}`, onRemove: () => removeFilterParam("brand") });
  }
  if (currentSize) {
    activeFilters.push({ label: `Size: UK ${currentSize}`, onRemove: () => removeFilterParam("size") });
  }
  if (minPrice || maxPrice) {
    const priceText = minPrice && maxPrice ? `₹${minPrice} - ₹${maxPrice}` : minPrice ? `From ₹${minPrice}` : `Up to ₹${maxPrice}`;
    activeFilters.push({
      label: `Price: ${priceText}`,
      onRemove: () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete("minPrice");
        newParams.delete("maxPrice");
        newParams.set("page", "1");
        setSearchParams(newParams);
      },
    });
  }
  if (inStock) {
    activeFilters.push({ label: "In Stock Only", onRemove: () => removeFilterParam("inStock") });
  }

  const activeFiltersCount = Array.from(searchParams.keys()).filter(
    (key) => !["search", "sort", "page", "limit"].includes(key)
  ).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-12">
      {/* Top Navigation / Breadcrumbs */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={getBreadcrumbItems()} />
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {getPageTitle()}
            </h1>

            {/* Active Filter Chips */}
            {activeFilters.length > 0 && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mr-1">
                  Active Filters:
                </span>
                {activeFilters.map((filter, index) => (
                  <span
                    key={index}
                    className="bg-[#18181b] border border-white/10 hover:border-white/20 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 text-zinc-200 transition"
                  >
                    <span>{filter.label}</span>
                    <button
                      onClick={filter.onRemove}
                      className="text-zinc-400 hover:text-lime-400 p-0.5 rounded-full transition cursor-pointer"
                      aria-label={`Remove ${filter.label} filter`}
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-lime-400 hover:text-lime-300 font-semibold underline underline-offset-4 ml-1 transition cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}

            <p className="text-gray-500 mt-2 text-sm">
              {totalProducts} product{totalProducts !== 1 && "s"} found
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-[#1f1f1f] border border-white/10 px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#2a2a2a] transition"
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-lime-400 text-black text-xs px-1.5 py-0.5 rounded-full ml-1">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={currentSort}
                onChange={handleSortChange}
                className="appearance-none bg-[#1f1f1f] border border-white/10 px-4 py-2 pr-10 rounded-xl text-sm font-medium hover:bg-[#2a2a2a] transition focus:outline-none focus:border-lime-400/50 cursor-pointer"
              >
                <option value="newest">Newest Drops</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="popularity">Most Popular</option>
                <option value="discount">Biggest Discount</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-72 shrink-0">
            <FilterSidebar />
          </div>

          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {isMobileFiltersOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 z-[60] lg:hidden backdrop-blur-sm"
                  onClick={() => setIsMobileFiltersOpen(false)}
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed inset-y-0 left-0 w-[85vw] max-w-sm bg-[#111] z-[70] lg:hidden overflow-y-auto border-r border-white/10 shadow-2xl"
                >
                  <div className="p-4 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#111] z-10">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                      <SlidersHorizontal size={18} /> Filters
                    </h2>
                    <button
                      onClick={() => setIsMobileFiltersOpen(false)}
                      className="p-2 hover:bg-white/10 rounded-full transition"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="p-4">
                    <FilterSidebar onClose={() => setIsMobileFiltersOpen(false)} />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Product Grid Area */}
          <div className="flex-1">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {/* Skeletons */}
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div
                    key={n}
                    className="bg-[#141414] rounded-[26px] p-2 border border-white/5 animate-pulse"
                  >
                    <div className="aspect-square rounded-[20px] bg-white/5 mb-4" />
                    <div className="h-4 bg-white/10 rounded w-3/4 mb-2 mx-2" />
                    <div className="h-5 bg-white/10 rounded w-1/3 mx-2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-[#111] rounded-[32px] border border-dashed border-white/10">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <Search size={32} className="text-gray-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">No products found</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                  We couldn't find anything matching your current filters. Try
                  adjusting them or searching for something else.
                </p>
                <button
                  onClick={() => setSearchParams({})}
                  className="bg-white text-black px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-200 transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;
