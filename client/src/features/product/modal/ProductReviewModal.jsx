import React, { useEffect } from 'react';
import { X, Star, ThumbsUp } from 'lucide-react';

const ProductReviewModal = ({ isOpen, onClose, reviews }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-lg max-h-[85vh] bg-[#121212] border border-white/10 rounded-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-xl font-semibold">Customer Reviews</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center text-lime-400">
                <Star size={14} fill="currentColor" />
                <span className="ml-1 font-medium text-white">{averageRating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-zinc-500">Based on {reviews.length} reviews</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body - Scrollable Reviews */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-white/5 pb-6 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-medium text-zinc-300">
                    {review.user.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{review.user}</h4>
                    <span className="text-xs text-zinc-500">{review.date}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < review.rating ? "currentColor" : "none"}
                      className={i < review.rating ? "text-lime-400" : "text-zinc-600"}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                {review.text}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium hover:text-zinc-300 cursor-pointer w-fit transition-colors">
                <ThumbsUp size={14} />
                Helpful
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductReviewModal;