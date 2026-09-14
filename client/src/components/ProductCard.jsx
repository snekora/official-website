import React from "react";
import { Link } from "react-router-dom";

export const SneakerPlaceholder = ({ color }) => (
  <svg
    viewBox="0 0 140 90"
    width="72%"
    className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
  >
    <path
      d="M8 68 Q6 78 20 80 L120 80 Q132 80 134 70 L132 62 Q128 58 118 60 L110 68 L25 68 Z"
      fill="#0a0a0a"
    />
    <path
      d="M15 68 L18 45 Q22 28 45 24 L85 20 Q108 19 118 34 L128 55 L130 62 L20 66 Z"
      fill={color || "#8b8f96"}
      opacity="0.92"
    />
    <path
      d="M15 68 L18 50 Q20 40 30 38 L45 40 L40 68 Z"
      fill={color || "#8b8f96"}
      opacity="0.55"
    />
    <g stroke="#000" strokeWidth="2" opacity="0.35">
      <line x1="55" y1="30" x2="70" y2="42" />
      <line x1="62" y1="26" x2="77" y2="38" />
      <line x1="69" y1="23" x2="84" y2="35" />
    </g>
  </svg>
);

const ProductCard = ({ product }) => {
  const { _id, name, price, originalPrice, variants } = product;

  // Derive an image and a badge
  const firstVariant = variants?.[0];
  const image = firstVariant?.images?.[0]?.url;
  const accent = firstVariant?.color?.hex || "#8b8f96";
  const badge = "New Drop"; // Compute this dynamically if desired

  return (
    <Link
      to={`/product/${product.slug || _id}`}
      className="block group bg-[#141414] rounded-[26px] p-2 border border-white/6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.4)]"
    >
      <div className="relative aspect-square rounded-[20px] overflow-hidden bg-[radial-gradient(circle_at_50%_35%,#232323_0%,#0a0a0a_75%)] flex items-center justify-center">
        {badge && (
          <span className="absolute top-3 left-3 z-10 bg-lime-300 text-black text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full">
            {badge}
          </span>
        )}

        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <SneakerPlaceholder color={accent} />
        )}
      </div>

      <div className="mt-4 px-1 pb-1">
        {product.brand && (
          <p className="text-lime-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
            {typeof product.brand === "object" ? product.brand?.name : product.brand}
          </p>
        )}
        <h3 className="text-white font-semibold text-[15px] leading-tight truncate">
          {name}
        </h3>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-white font-bold text-base">
            ₹{price.toLocaleString("en-IN")}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-zinc-500 text-sm line-through">
              ₹{originalPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
