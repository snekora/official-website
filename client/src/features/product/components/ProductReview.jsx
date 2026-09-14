import React from "react";
import { Star } from "lucide-react";

const ProductReview = ({ reviews = [], onOpenModal }) => {
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 5.0;

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm uppercase font-medium tracking-normal text-zinc-400">
          Reviews
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center text-[#bdec5e] gap-1">
            <Star size={14} fill="currentColor" />
            <span className="font-semibold text-white">
              {averageRating.toFixed(1)}
            </span>
          </div>
          <span className="text-zinc-500">({reviews.length})</span>
        </div>
      </div>

      <div className="space-y-3">
        {reviews.slice(0, 2).map((review) => (
          <div
            key={review.id || review._id}
            className="p-3.5 rounded-xl bg-zinc-900/40 border border-white/10 space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-white tracking-normal">
                {review.user}
              </span>
              <span className="text-[11px] text-zinc-500 font-normal">
                {review.date}
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  fill={i < review.rating ? "currentColor" : "none"}
                  className={
                    i < review.rating ? "text-[#bdec5e]" : "text-zinc-700"
                  }
                />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed tracking-normal font-normal line-clamp-2">
              "{review.text}"
            </p>
          </div>
        ))}
      </div>

      {reviews.length > 0 && (
        <button
          onClick={onOpenModal}
          className="w-full py-3 border border-white/10 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:border-white/20 transition-all tracking-normal"
        >
          Read All Reviews ({reviews.length})
        </button>
      )}
    </div>
  );
};

export default ProductReview;
