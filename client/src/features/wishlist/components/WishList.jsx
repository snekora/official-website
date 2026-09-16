import React, { useEffect, useState } from "react";
import {
  Trash2,
  ShoppingCart,
  ArrowRight,
  ShoppingBag,
  X,
  Check,
  Loader2,
  Heart,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import LottieComponent from "lottie-react";
import emptyWishlistAnimation from "../../../assets/lottie/Boxempty.json";
import Breadcrumbs from "../../../components/Breadcrumbs";
import { useDispatch, useSelector } from "react-redux";
import { fetchWishlist, removeFromWishlist, clearWishlist } from "../redux/wishlistSlice";
import { addToCart } from "../../cart/redux/cartSlice";
import placeholderImg from "../../../assets/placeholder/placeholder.png";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const Lottie = LottieComponent.default || LottieComponent;

const WishList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: wishlistItems, isLoading } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Move to Cart Modal State
  const [selectedProductForCart, setSelectedProductForCart] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [isMovingToCart, setIsMovingToCart] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  const removeItem = (id) => {
    dispatch(removeFromWishlist(id));
  };

  const navigateToProduct = (slug) => {
    navigate(`/product/${slug}`);
  };

  const handleOpenMoveToCart = (item, e) => {
    e?.stopPropagation();
    setSelectedProductForCart(item);
    const firstVariant = item.variants?.[0] || null;
    setSelectedVariant(firstVariant);
    const firstAvailableSize =
      firstVariant?.sizes?.find((s) => s.stock > 0)?.size ||
      firstVariant?.sizes?.[0]?.size ||
      null;
    setSelectedSize(firstAvailableSize);
  };

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    const availableSize =
      variant.sizes?.find((s) => s.size === selectedSize && s.stock > 0)?.size ||
      variant.sizes?.find((s) => s.stock > 0)?.size ||
      variant.sizes?.[0]?.size ||
      null;
    setSelectedSize(availableSize);
  };

  const handleConfirmMoveToCart = async () => {
    if (!selectedProductForCart || !selectedVariant || !selectedSize) {
      toast.error("Please select an available size");
      return;
    }

    setIsMovingToCart(true);
    try {
      await dispatch(
        addToCart({
          productId: selectedProductForCart._id,
          variantId: selectedVariant._id,
          size: selectedSize,
          quantity: 1,
        })
      ).unwrap();

      await dispatch(removeFromWishlist(selectedProductForCart._id)).unwrap();
      toast.success("Moved to cart!");
      setSelectedProductForCart(null);
    } catch (err) {
      toast.error(err || "Failed to move to cart");
    } finally {
      setIsMovingToCart(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="py-20 bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-4">
        <div className="p-4 rounded-full bg-white/5 border border-white/10 mb-5">
          <Heart size={36} className="text-red-500 fill-red-500/20" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-center">Your Wishlist</h2>
        <p className="text-zinc-400 text-sm mb-6 text-center max-w-sm">
          Sign in to view saved items and sync your drops across all your devices.
        </p>
        <Link to="/login">
          <button className="bg-[#bdec5e] text-black font-semibold text-sm px-8 py-3.5 rounded-xl hover:bg-lime-400 transition-all uppercase tracking-wider shadow-[0_0_20px_rgba(189,236,94,0.15)] cursor-pointer">
            Log In Now
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] text-white font-sans selection:bg-lime-300 selection:text-black pb-2">
      {/* Top Navigation / Breadcrumbs */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Wishlist" }]} />
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pt-2 pb-4 max-w-xl mx-auto">
        {isLoading && (!wishlistItems || wishlistItems.length === 0) ? (
          <div className="flex justify-center pt-16">
            <Loader2 size={36} className="animate-spin text-[#bdec5e]" />
          </div>
        ) : wishlistItems?.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-16 pb-6 text-center">
            <div className="w-48 h-48 mb-6 flex items-center justify-center">
              <Lottie
                animationData={emptyWishlistAnimation}
                loop={true}
                className="w-full h-full opacity-70"
              />
            </div>
            <h2 className="text-xl font-medium mb-2">Your wishlist is empty</h2>
            <p className="text-zinc-400 text-sm mb-8">
              Save your favorite drops here so you don't lose track of them.
            </p>
            <Link to="/">
              <button className="bg-[#bdec5e] text-black font-semibold text-sm px-8 py-3.5 rounded-lg hover:bg-lime-400 transition-colors uppercase tracking-wider shadow-[0_0_20px_rgba(189,236,94,0.15)] cursor-pointer">
                Explore Releases
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Wishlist Items List */}
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm text-zinc-400">
                  {wishlistItems?.length || 0} items
                </span>
                <button
                  onClick={() => dispatch(clearWishlist())}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              {wishlistItems?.map((item) => {
                const firstVariant = item.variants?.[0];
                const image = firstVariant?.images?.[0]?.url;
                const accent = firstVariant?.color?.hex || "#8b8f96";

                return (
                  <div
                    key={item._id}
                    className="flex gap-4 p-4 rounded-2xl border border-white/10 bg-white/2 transition-all hover:bg-white/5 group cursor-pointer"
                    onClick={() => navigateToProduct(item.slug || item._id)}
                  >
                    {/* Item Image */}
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-[#1f1f1f] shrink-0 relative flex items-center justify-center">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#27272a_0%,#1f1f1f_100%)] -z-10" />
                      <img
                        src={image || placeholderImg}
                        alt={item.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = placeholderImg;
                        }}
                        className="w-full h-full object-cover mix-blend-screen opacity-90 group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex flex-col grow justify-between py-1">
                      <div className="flex justify-between items-start">
                        <div>
                          {item.brand && (
                            <p className="text-lime-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                              {typeof item.brand === "object" ? item.brand?.name : item.brand}
                            </p>
                          )}
                          <h3 className="text-[15px] font-semibold tracking-wide mb-1">
                            {item.name}
                          </h3>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(item._id);
                          }}
                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors cursor-pointer"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 size={16} strokeWidth={1.5} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-baseline gap-2">
                          <p className="text-[15px] font-medium">
                            ₹{item.price?.toLocaleString("en-IN")}
                          </p>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <span className="text-zinc-500 text-xs line-through">
                              ₹{item.originalPrice?.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>

                        {/* Move to Cart Trigger */}
                        <button
                          onClick={(e) => handleOpenMoveToCart(item, e)}
                          className="flex items-center gap-1.5 bg-white/5 hover:bg-[#bdec5e] hover:text-black text-white px-3 py-2 rounded-lg border border-white/10 transition-all text-xs font-semibold cursor-pointer"
                        >
                          <ShoppingCart size={14} strokeWidth={2} />
                          Move to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mass Actions */}
            <div className="border-t border-white/10 pt-4 mt-2">
              <Link to="/">
                <button className="w-full py-3.5 rounded-xl border border-dashed border-white/20 text-zinc-400 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm font-medium cursor-pointer">
                  Keep Browsing
                  <ArrowRight size={16} strokeWidth={1.5} />
                </button>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* QUICK SIZE SELECTOR MODAL FOR MOVE TO CART */}
      <AnimatePresence>
        {selectedProductForCart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#141414] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProductForCart(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src={selectedVariant?.images?.[0]?.url || placeholderImg}
                    alt={selectedProductForCart.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = placeholderImg;
                    }}
                    className="w-full h-full object-cover mix-blend-screen"
                  />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white leading-snug">
                    {selectedProductForCart.name}
                  </h3>
                  <p className="text-[#bdec5e] font-bold text-sm mt-1">
                    ₹{selectedProductForCart.price?.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Variant / Color Picker */}
              {selectedProductForCart.variants?.length > 1 && (
                <div className="mb-5">
                  <label className="text-xs uppercase font-medium text-zinc-400 mb-2 block">
                    Color: <span className="text-white font-normal">{selectedVariant?.color?.name}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {selectedProductForCart.variants.map((v) => (
                      <button
                        key={v._id}
                        onClick={() => handleVariantChange(v)}
                        className={`w-7 h-7 rounded-full transition-all flex items-center justify-center ${
                          selectedVariant?._id === v._id
                            ? "ring-2 ring-[#bdec5e] ring-offset-2 ring-offset-zinc-950 scale-105"
                            : "opacity-80 hover:opacity-100"
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full border border-white/10 shadow-inner"
                          style={{ backgroundColor: v.color?.hex || "#000" }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              <div className="mb-6">
                <label className="text-xs uppercase font-medium text-zinc-400 mb-2 block">
                  Select Size (UK)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {selectedVariant?.sizes?.map((s) => {
                    const isOutOfStock = s.stock <= 0;
                    const isSelected = selectedSize === s.size;

                    return (
                      <button
                        key={s.size}
                        disabled={isOutOfStock}
                        onClick={() => setSelectedSize(s.size)}
                        className={`py-2.5 rounded-xl text-xs font-semibold border transition-all flex flex-col items-center justify-center cursor-pointer ${
                          isOutOfStock
                            ? "bg-zinc-900 border-white/5 text-zinc-600 opacity-40 cursor-not-allowed"
                            : isSelected
                            ? "bg-[#bdec5e] border-[#bdec5e] text-black shadow-[0_0_12px_rgba(189,236,94,0.3)]"
                            : "bg-zinc-900 border-white/10 text-white hover:border-white/30"
                        }`}
                      >
                        <span>UK {s.size}</span>
                        {isOutOfStock && (
                          <span className="text-[9px] text-red-400 font-normal">Sold</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Confirm Move to Cart */}
              <button
                onClick={handleConfirmMoveToCart}
                disabled={isMovingToCart || !selectedSize}
                className="w-full bg-[#bdec5e] text-black font-semibold text-sm py-3.5 rounded-xl hover:bg-lime-400 transition-all uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(189,236,94,0.15)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isMovingToCart ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-black" />
                    <span>Adding to Bag...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} />
                    <span>Confirm & Move to Cart</span>
                  </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WishList;
