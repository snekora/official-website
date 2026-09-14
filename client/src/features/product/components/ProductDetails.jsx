import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById, clearCurrentProduct } from "../redux/productSlice";
import { addToCart } from "../../cart/redux/cartSlice";
import { fetchAddresses } from "../../address/redux/addressSlice";
import { ChevronLeft, Heart, Share, ChevronDown, Loader2, Minus, Plus } from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import ProductReview from "./ProductReview";
import ProductReviewModal from "../modal/ProductReviewModal";
import ProductImageCarousel from "./ProductImageCarousel";
import Breadcrumbs from "../../../components/Breadcrumbs";
import { openWhatsApp } from "../../../services/whatsappOrder";

const ProductDetails = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isFromCart = location.state?.from === "cart";

  const {
    currentProduct: product,
    currentProductLoading,
    currentProductError,
  } = useSelector((state) => state.product);

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { addresses } = useSelector((state) => state.address);

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const [isSizeOpen, setIsSizeOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    dispatch(fetchProductById(slug));
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, slug]);

  useEffect(() => {
    if (product && product.variants?.length > 0) {
      const firstVariant = product.variants[0];
      setSelectedVariant(firstVariant);
      if (firstVariant.sizes?.length > 0) {
        setSelectedSize(firstVariant.sizes[0].size);
      }
    }
  }, [product]);

  // Handle color change
  const handleColorSelect = (variant) => {
    setSelectedVariant(variant);
    if (variant.sizes?.length > 0) {
      const hasSize = variant.sizes.find((s) => s.size === selectedSize);
      if (!hasSize) {
        setSelectedSize(variant.sizes[0].size);
      }
    } else {
      setSelectedSize(null);
    }
    setQuantity(1);
  };

  // Handle Buy Now via WhatsApp
  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to place an order.");
      navigate("/login");
      return;
    }

    if (!product) {
      toast.error("Product data is not available.");
      return;
    }

    setBuyNowLoading(true);

    try {
      // Fetch addresses if not already loaded
      let currentAddresses = addresses;
      if (!currentAddresses || currentAddresses.length === 0) {
        const result = await dispatch(fetchAddresses()).unwrap();
        currentAddresses = result;
      }

      const defaultAddress = currentAddresses?.find((a) => a.isDefault);

      if (!defaultAddress) {
        toast.info("Please select or add a default address first.");
        navigate("/address");
        return;
      }

      if (!defaultAddress.phone) {
        toast.error("Your default address is missing a phone number. Please update it.");
        navigate("/address");
        return;
      }

      openWhatsApp({
        product,
        selectedVariant,
        selectedSize,
        quantity,
        address: defaultAddress,
      });
    } catch (error) {
      toast.error("Failed to fetch your address. Please try again.");
    } finally {
      setBuyNowLoading(false);
    }
  };

  // Handle Add to Cart
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }

    if (!selectedVariant || !selectedSize) {
      toast.error("Please select a size and color.");
      return;
    }

    setAddToCartLoading(true);
    try {
      await dispatch(
        addToCart({
          productId: product._id,
          variantId: selectedVariant._id,
          size: selectedSize,
          quantity,
        })
      ).unwrap();
      toast.success("Added to cart!");
    } catch (error) {
      toast.error(error || "Failed to add to cart");
    } finally {
      setAddToCartLoading(false);
    }
  };

  if (currentProductLoading || !product) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-[#bdec5e]" />
      </div>
    );
  }

  if (currentProductError) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <p className="text-zinc-400">Error: {currentProductError}</p>
      </div>
    );
  }

  // Fallbacks if no variants exist
  const sizes = selectedVariant?.sizes || [];
  const images = selectedVariant?.images || [];
  const isOutOfStock = sizes.every((s) => s.stock === 0) || sizes.length === 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-[#bdec5e] selection:text-black pb-20">
      {/* Top Navigation */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            isFromCart
              ? { label: "Cart", path: "/cart" }
              : { label: "Products", path: "/products" },
            { label: product.name },
          ]}
        />
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Heart size={22} strokeWidth={1.5} />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Share size={22} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto w-full lg:grid lg:grid-cols-2 lg:gap-10 lg:px-8 lg:pb-12">
        {/* Left Column: Separated Product Image Carousel */}
        <ProductImageCarousel images={images} productName={product.name} />

        {/* Right Column: Details Section */}
        <div className="px-4 sm:px-6 lg:px-0 py-4 w-full max-w-xl mx-auto lg:mx-0 space-y-6">
          {/* Title & Brand */}
          <div>
            {product.brand && (
              <p className="text-lime-400 font-medium text-xs tracking-wider uppercase mb-1">
                {typeof product.brand === "object" ? product.brand?.name : product.brand}
              </p>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-normal text-white mb-2 leading-snug">
              {product.name}
            </h1>

            {/* Price Section */}
            <div className="flex items-center gap-3">
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <span className="text-zinc-400 line-through text-base sm:text-lg font-normal tracking-normal">
                    Rs.{" "}
                    {product.originalPrice.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                )}
              <span className="text-xl sm:text-2xl font-bold text-white tracking-normal">
                Rs.{" "}
                {product.price.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <span className="bg-[#1a1a1a] border border-white/10 text-white font-medium text-xs px-3 py-0.5 rounded-full tracking-normal">
                    Sale
                  </span>
                )}
            </div>
          </div>

          {/* Description */}
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed tracking-normal font-normal whitespace-pre-wrap">
            {product.description}
          </p>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-white/5 border border-white/10 text-zinc-400 text-xs px-2.5 py-1 rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Color Selection */}
          {product.variants?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs uppercase font-medium tracking-normal text-zinc-400">
                Color:{" "}
                <span className="text-white font-normal ml-1">
                  {selectedVariant?.color?.name}
                </span>
              </h3>
              <div className="flex items-center gap-3">
                {product.variants.map((variant) => {
                  const isSelected = selectedVariant?._id === variant._id;
                  return (
                    <button
                      key={variant._id}
                      onClick={() => handleColorSelect(variant)}
                      className={`w-8 h-8 rounded-full transition-all flex items-center justify-center focus:outline-none ${
                        isSelected
                          ? "ring-2 ring-[#bdec5e] ring-offset-2 ring-offset-zinc-950 scale-105"
                          : "ring-1 ring-transparent hover:ring-white/20 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-full shadow-inner border border-white/10"
                        style={{
                          backgroundColor: variant.color?.hex || "#000",
                        }}
                        title={variant.color?.name}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-medium tracking-normal text-zinc-400">
                Select Size (UK)
              </h3>
              {sizes.length > 0 && selectedSize && (
                <span className="text-xs text-zinc-400 font-normal tracking-normal">
                  {sizes.find((s) => s.size === selectedSize)?.stock > 0 ? (
                    <span className="text-emerald-400 font-medium">
                      {sizes.find((s) => s.size === selectedSize)?.stock}{" "}
                      available
                    </span>
                  ) : (
                    <span className="text-red-400 font-medium">
                      Out of stock
                    </span>
                  )}
                </span>
              )}
            </div>

            <div className="relative">
              {/* Trigger */}
              <button
                type="button"
                onClick={() => setIsSizeOpen(!isSizeOpen)}
                disabled={sizes.length === 0}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3.5 flex items-center justify-between text-white text-sm hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="font-medium flex items-center gap-2 tracking-normal">
                  {sizes.length === 0
                    ? "No sizes available"
                    : selectedSize
                      ? `UK ${selectedSize}`
                      : "Choose a size"}
                </span>

                <ChevronDown
                  size={18}
                  className={`transition-transform duration-300 ${
                    isSizeOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {isSizeOpen && sizes.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 backdrop-blur-md"
                  >
                    {sizes.map((sizeObj) => {
                      const isOutOfStockForSize = sizeObj.stock <= 0;
                      const isLowStock =
                        sizeObj.stock > 0 && sizeObj.stock <= 5;

                      return (
                        <button
                          key={sizeObj.size}
                          type="button"
                          disabled={isOutOfStockForSize}
                          onClick={() => {
                            setSelectedSize(sizeObj.size);
                            setIsSizeOpen(false);
                            setQuantity(1);
                          }}
                          className={`w-full px-4 py-3 text-left flex items-center justify-between transition-all text-sm tracking-normal
                            ${isOutOfStockForSize ? "opacity-40 cursor-not-allowed" : ""}
                            ${
                              selectedSize === sizeObj.size
                                ? "bg-[#bdec5e]/10 text-[#bdec5e]"
                                : "text-white hover:bg-white/5"
                            }`}
                        >
                          <span className="font-medium">UK {sizeObj.size}</span>

                          <div className="flex items-center gap-2">
                            {isOutOfStockForSize ? (
                              <span className="text-xs text-red-400 font-normal">
                                Out of Stock
                              </span>
                            ) : isLowStock ? (
                              <span className="text-xs text-amber-400 font-medium bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                Only {sizeObj.stock} left
                              </span>
                            ) : (
                              <span className="text-xs text-zinc-400 font-normal">
                                {sizeObj.stock} in stock
                              </span>
                            )}

                            {selectedSize === sizeObj.size && (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#bdec5e]" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Live Stock Urgency Badge Below Selector */}
            {selectedSize && (
              <div className="pt-1">
                {(() => {
                  const currentSizeObj = sizes.find(
                    (s) => s.size === selectedSize,
                  );
                  if (!currentSizeObj) return null;
                  const stock = currentSizeObj.stock;

                  if (stock > 0 && stock <= 5) {
                    return (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/15 text-amber-400 text-xs font-normal tracking-normal">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                        </span>
                        <span>
                          Only {stock} left in UK {selectedSize}
                        </span>
                      </div>
                    );
                  } else if (stock > 5) {
                    return (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 text-xs font-normal tracking-normal">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>In Stock ({stock} available)</span>
                      </div>
                    );
                  } else {
                    return (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/15 text-red-400 text-xs font-normal tracking-normal">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        <span>Out of stock for UK {selectedSize}</span>
                      </div>
                    );
                  }
                })()}
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          {!isOutOfStock && selectedSize && (
            <div className="space-y-3">
              <h3 className="text-xs uppercase font-medium tracking-normal text-zinc-400">
                Quantity
              </h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900 border border-white/10 text-white hover:bg-zinc-800 hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center text-sm font-semibold text-white tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const currentStock = sizes.find((s) => s.size === selectedSize)?.stock || 0;
                    setQuantity((q) => Math.min(currentStock, q + 1));
                  }}
                  disabled={quantity >= (sizes.find((s) => s.size === selectedSize)?.stock || 0)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900 border border-white/10 text-white hover:bg-zinc-800 hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || !selectedSize || addToCartLoading}
              className="flex-1 bg-[#bdec5e] text-black font-semibold text-sm py-3.5 rounded-xl hover:bg-lime-400 transition-all duration-200 uppercase tracking-normal shadow-none active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
            >
              {addToCartLoading ? "Adding..." : isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock || !selectedSize || buyNowLoading}
              className="flex-1 bg-zinc-900 border border-white/15 text-white font-semibold text-sm py-3.5 rounded-xl hover:bg-zinc-800 hover:border-white/25 transition-all duration-200 uppercase tracking-normal active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {buyNowLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-lime-400" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 fill-emerald-400 shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>Buy Now</span>
                </>
              )}
            </button>
          </div>

          {/* Reviews Section */}
          <div className="pt-4 border-t border-white/10">
            <ProductReview
              reviews={product.reviews || []}
              onOpenModal={() => setIsReviewModalOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Reviews Modal */}
      <ProductReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        reviews={product.reviews || []}
      />
    </div>
  );
};

export default ProductDetails;
