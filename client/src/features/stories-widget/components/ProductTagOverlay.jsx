import React from "react";

const ProductTagOverlay = ({ product, onAddToCart }) => {
  if (!product) return null;

  return (
    <div className="absolute bottom-5 left-1/2 z-10 flex w-[90%] max-w-[360px] -translate-x-1/2 animate-[slideUp_.3s_ease] flex-col gap-2">
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
      <div className="flex items-center gap-3 rounded bg-white/95 p-2 shadow-lg">
        <img
          src={product.image}
          alt={product.title}
          className="h-[60px] w-[60px] flex-shrink-0 rounded border border-gray-200 object-cover"
        />

        <div className="flex flex-1 flex-col gap-1.5">
          <h4 className="line-clamp-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
            {product.title}
          </h4>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 line-through">
              Rs. {(product.price * 1.3).toFixed(2)}
            </span>

            <span className="text-sm font-bold text-black">
              Rs. {product.price.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Shop Button */}
      <button
        onClick={() => onAddToCart(product.id)}
        className="w-full rounded bg-[#9AE600] px-4 py-3 text-[13px] font-bold text-black transition hover:bg-[#88cc00] active:scale-[0.98]"
      >
        Shop Now
      </button>
    </div>
  );
};

export default ProductTagOverlay;
