import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Package,
  Image as ImageIcon,
  PlaySquare,
  Boxes,
  Plus,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Layers,
  Database,
  Cloud,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { fetchAdminProducts } from "../products/redux/adminProductSlice";
import { fetchAdminPosters } from "../poster/redux/adminPosterSlice";
import { fetchAdminCategories } from "../categories/redux/adminCategorySlice";
import { fetchAdminBrands } from "../brands/redux/adminBrandSlice";
import api from "../../../services/api";
import placeholderImg from "../../../assets/placeholder/placeholder.png";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { admin } = useSelector((state) => state.adminAuth);
  const { products, total: totalProducts, loading: loadingProducts } = useSelector(
    (state) => state.adminProduct
  );
  const { posters, loading: loadingPosters } = useSelector(
    (state) => state.adminPoster
  );
  const { categories } = useSelector((state) => state.adminCategory);
  const { brands } = useSelector((state) => state.adminBrand);

  const [stories, setStories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadAllData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchAdminProducts({ limit: 6 })),
        dispatch(fetchAdminPosters()),
        dispatch(fetchAdminCategories()),
        dispatch(fetchAdminBrands()),
        (async () => {
          try {
            setLoadingStories(true);
            const res = await api.get("/story/admin");
            const fetched =
              res.data?.stories ||
              (Array.isArray(res.data?.data) ? res.data.data : null) ||
              (Array.isArray(res.data) ? res.data : []);
            setStories(fetched);
          } catch (e) {
            console.error("Error fetching stories:", e);
          } finally {
            setLoadingStories(false);
          }
        })(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [dispatch]);

  const activePostersCount = posters?.filter((p) => p.isActive !== false)?.length || 0;
  const activeStoriesCount = stories?.filter((s) => s.isActive !== false)?.length || 0;
  const displayTotalProducts = totalProducts || products?.length || 0;
  const totalCategoriesCount = categories?.length || 0;
  const totalBrandsCount = brands?.length || 0;

  // Determine time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const quickActions = [
    {
      title: "Products",
      description: "Manage your sneaker catalog & inventory",
      path: "/mQ8vR2kX9Lp7N4/products",
      icon: Package,
    },
    {
      title: "Posters",
      description: "Manage homepage carousel banners",
      path: "/mQ8vR2kX9Lp7N4/poster",
      icon: ImageIcon,
    },
    {
      title: "Stories",
      description: "Manage story drops & tagged kicks",
      path: "/mQ8vR2kX9Lp7N4/stories",
      icon: PlaySquare,
    },
    {
      title: "Brands & Categories",
      description: "Organize your product taxonomy",
      path: "/mQ8vR2kX9Lp7N4/products",
      icon: Boxes,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#bdec5e] selection:text-black p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 1. HEADER / GREETING */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-wider text-zinc-500 uppercase">
              Snekora / Admin
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-normal text-white">
              {getGreeting()},{" "}
              <span className="text-white font-bold">
                {admin?.username || "Admin"}
              </span>
            </h1>
            <p className="text-sm text-zinc-400">
              Here's what's happening with your store today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0">
            <button
              onClick={loadAllData}
              disabled={refreshing}
              className="bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white px-3.5 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              title="Refresh Dashboard Data"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin text-[#bdec5e]" : ""}
              />
              <span>Refresh</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white px-3.5 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 cursor-pointer"
            >
              <span>View Storefront</span>
              <ExternalLink size={13} className="text-zinc-400" />
            </a>

            <Link
              to="/mQ8vR2kX9Lp7N4/products"
              className="bg-[#bdec5e] hover:bg-[#d2f57b] text-black font-semibold px-4 py-2 rounded-lg text-xs transition duration-150 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={15} />
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* 2. STATISTICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Stat 1: Total Products */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all duration-200 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium tracking-wider text-zinc-400 uppercase">
                  Total Products
                </p>
                <Package size={16} className="text-[#bdec5e]" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-white tracking-normal mt-2">
                {displayTotalProducts}
              </p>
              <p className="text-xs text-zinc-500">sneaker models</p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
              <span>Catalog items</span>
              <Link
                to="/mQ8vR2kX9Lp7N4/products"
                className="text-[#bdec5e] hover:underline flex items-center gap-1 font-medium"
              >
                Manage <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Stat 2: Hero Posters */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all duration-200 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium tracking-wider text-zinc-400 uppercase">
                  Hero Posters
                </p>
                <ImageIcon size={16} className="text-[#bdec5e]" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-white tracking-normal mt-2">
                {activePostersCount}
              </p>
              <p className="text-xs text-zinc-500">live banner slides</p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
              <span>Homepage carousel</span>
              <Link
                to="/mQ8vR2kX9Lp7N4/poster"
                className="text-[#bdec5e] hover:underline flex items-center gap-1 font-medium"
              >
                Manage <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Stat 3: Story Reels */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all duration-200 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium tracking-wider text-zinc-400 uppercase">
                  Story Reels
                </p>
                <PlaySquare size={16} className="text-[#bdec5e]" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-white tracking-normal mt-2">
                {activeStoriesCount}
              </p>
              <p className="text-xs text-zinc-500">video showcases</p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
              <span>Interactive drops</span>
              <Link
                to="/mQ8vR2kX9Lp7N4/stories"
                className="text-[#bdec5e] hover:underline flex items-center gap-1 font-medium"
              >
                Manage <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Stat 4: Brands & Categories */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all duration-200 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium tracking-wider text-zinc-400 uppercase">
                  Brands & Categories
                </p>
                <Boxes size={16} className="text-[#bdec5e]" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-white tracking-normal mt-2">
                {totalBrandsCount}{" "}
                <span className="text-base text-zinc-500 font-normal">/ {totalCategoriesCount}</span>
              </p>
              <p className="text-xs text-zinc-500">brands & categories</p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
              <span>Taxonomy setup</span>
              <span className="text-zinc-400 font-medium">Organized</span>
            </div>
          </div>

        </div>

        {/* 3. QUICK ACTIONS */}
        <div className="space-y-3.5">
          <h2 className="text-xs font-medium tracking-wider text-zinc-400 uppercase">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  to={action.path}
                  className="group bg-zinc-900/50 border border-white/10 hover:border-[#bdec5e]/40 rounded-xl p-5 transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 group-hover:text-[#bdec5e] group-hover:border-[#bdec5e]/30 transition-colors">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white group-hover:text-[#bdec5e] transition">
                        {action.title}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-end text-xs text-zinc-500 group-hover:text-[#bdec5e] transition">
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 4 & 5. MAIN SECTION: RECENT PRODUCTS + RIGHT SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 4. RECENT PRODUCTS IN CATALOG (2 Columns) */}
          <div className="lg:col-span-2 bg-zinc-900/40 border border-white/10 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Recent Products in Catalog
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Latest sneaker inventory available on the storefront
                </p>
              </div>

              <Link
                to="/mQ8vR2kX9Lp7N4/products"
                className="text-xs font-medium text-[#bdec5e] hover:underline flex items-center gap-1 transition"
              >
                View all ({displayTotalProducts})
                <ArrowRight size={13} />
              </Link>
            </div>

            {loadingProducts ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-zinc-500">
                <RefreshCw size={22} className="animate-spin text-[#bdec5e]" />
                <p className="text-xs font-normal">Loading catalog...</p>
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {products.slice(0, 6).map((product) => {
                  const firstVariant = product.variants?.[0];
                  const imageUrl = firstVariant?.images?.[0]?.url;
                  const variantCount = product.variants?.length || 0;

                  return (
                    <div
                      key={product._id}
                      onClick={() => navigate("/mQ8vR2kX9Lp7N4/products")}
                      className="group bg-zinc-900/60 border border-white/10 hover:border-[#bdec5e]/40 rounded-xl p-3.5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        {/* Product Image */}
                        <div className="w-full h-40 rounded-lg bg-zinc-950 border border-white/10 overflow-hidden relative mb-3 flex items-center justify-center">
                          <img
                            src={imageUrl || placeholderImg}
                            alt={product.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = placeholderImg;
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Brand & Name */}
                        {product.brand && (
                          <p className="text-[11px] font-medium text-[#bdec5e] uppercase tracking-wider truncate mb-0.5">
                            {typeof product.brand === "object" ? product.brand?.name : product.brand}
                          </p>
                        )}
                        <h4 className="text-sm font-semibold text-white truncate group-hover:text-[#bdec5e] transition">
                          {product.name}
                        </h4>

                        {/* Price */}
                        <p className="text-sm font-bold text-white mt-1.5">
                          Rs. {product.price?.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>

                      {/* Footer Info */}
                      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Layers size={12} className="text-zinc-500" />
                          {variantCount} {variantCount === 1 ? "variant" : "variants"}
                        </span>
                        <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                          <CheckCircle2 size={11} /> In Stock
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center text-zinc-500 space-y-3">
                <Package size={32} className="mx-auto text-zinc-600" />
                <p className="text-sm">No products found in the catalog.</p>
                <Link
                  to="/mQ8vR2kX9Lp7N4/products"
                  className="inline-flex items-center gap-1.5 bg-[#bdec5e] hover:bg-[#d2f57b] text-black px-4 py-2 rounded-lg text-xs font-semibold"
                >
                  <Plus size={14} /> Add First Product
                </Link>
              </div>
            )}
          </div>

          {/* 5. RIGHT SIDEBAR: HERO BANNERS & SYSTEM STATUS */}
          <div className="space-y-6">
            
            {/* Hero Banner Slides */}
            <div className="bg-zinc-900/40 border border-white/10 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Hero Banner Slides
                </h3>
                <Link
                  to="/mQ8vR2kX9Lp7N4/poster"
                  className="text-xs font-medium text-[#bdec5e] hover:underline flex items-center gap-1"
                >
                  Manage <ArrowRight size={11} />
                </Link>
              </div>

              {posters && posters.length > 0 ? (
                <div className="space-y-2.5">
                  {posters.slice(0, 3).map((poster, index) => {
                    const isSlideActive = poster.isActive !== false;
                    return (
                      <div
                        key={poster._id || index}
                        className="flex items-center gap-3 bg-zinc-900/60 border border-white/10 rounded-lg p-2.5"
                      >
                        <div className="w-16 h-11 rounded-md overflow-hidden bg-zinc-950 shrink-0 border border-white/10">
                          <img
                            src={poster.image?.url || poster.mobileImage?.url || placeholderImg}
                            alt="Banner Preview"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = placeholderImg;
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-white truncate">
                            Slide #{index + 1}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Order: {poster.order ?? index}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            isSlideActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-zinc-800 text-zinc-500 border border-white/5"
                          }`}
                        >
                          {isSlideActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 py-4 text-center">
                  No hero slides configured.
                </p>
              )}
            </div>

            {/* System Status */}
            <div className="bg-zinc-900/40 border border-white/10 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3">
                System Status
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/60 border border-white/10">
                  <div className="flex items-center gap-2.5 text-zinc-300">
                    <Database size={14} className="text-zinc-400" />
                    <span>MongoDB Database</span>
                  </div>
                  <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Connected
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/60 border border-white/10">
                  <div className="flex items-center gap-2.5 text-zinc-300">
                    <Cloud size={14} className="text-zinc-400" />
                    <span>Cloudinary Storage</span>
                  </div>
                  <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/60 border border-white/10">
                  <div className="flex items-center gap-2.5 text-zinc-300">
                    <ShieldCheck size={14} className="text-zinc-400" />
                    <span>JWT Session Guard</span>
                  </div>
                  <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Secure
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;