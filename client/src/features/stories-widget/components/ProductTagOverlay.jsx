import React from "react";
import { Link, useNavigate } from "react-router-dom";
import placeholderImg from "../../../assets/placeholder/placeholder.png";

const ProductTagOverlay = ({ product, onClose }) => {
  const navigate = useNavigate();
  if (!product) return null;

  const productUrl = `/product/${product.slug || product.id || product._id}`;

  const handleShopNow = (e) => {
    e.stopPropagation();
    if (onClose) onClose();
    navigate(productUrl);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-5 left-1/2 z-10 flex w-[90%] max-w-[360px] -translate-x-1/2 animate-[slideUp_.3s_ease] flex-col gap-2"
    >
      {/* Custom Animation */}
      <style>
        {`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translate(-50%, 30px);
            }
            to {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
        `}
      </style>

      {/* Product Card */}
      <Link
        to={productUrl}
        onClick={() => {
          if (onClose) onClose();
        }}
        className="flex items-center gap-3 rounded-xl bg-black/85 backdrop-blur-md border border-white/15 p-2.5 shadow-2xl transition hover:bg-black/95 hover:border-lime-400/40 group cursor-pointer"
      >
        <img
          src={product.image || placeholderImg}
          alt={product.title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = placeholderImg;
          }}
          className="h-[54px] w-[54px] flex-shrink-0 rounded-lg border border-white/10 object-cover bg-zinc-900"
        />

        <div className="flex flex-1 flex-col gap-1 min-w-0">
          <h4 className="truncate text-xs font-bold uppercase tracking-wide text-white group-hover:text-lime-300 transition-colors">
            {product.title}
          </h4>

          <div className="flex items-center gap-2">
            {product.originalPrice && product.originalPrice > product.price ? (
              <span className="text-[11px] text-zinc-400 line-through">
                Rs. {product.originalPrice.toLocaleString()}
              </span>
            ) : null}

            <span className="text-xs font-extrabold text-lime-400">
              Rs. {product.price?.toLocaleString ? product.price.toLocaleString() : product.price}
            </span>
          </div>
        </div>
      </Link>

      {/* Shop Button */}
      <button
        type="button"
        onClick={handleShopNow}
        className="w-full rounded-xl bg-lime-400 py-3 text-[13px] font-bold text-black transition hover:bg-lime-300 hover:shadow-[0_0_15px_rgba(163,230,53,0.4)] active:scale-[0.98] cursor-pointer"
      >
        Shop Now
      </button>
    </div>
  );
};

export default ProductTagOverlay;
