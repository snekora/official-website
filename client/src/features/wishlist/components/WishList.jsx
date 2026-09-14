import React, { useState } from "react";
import {
  ChevronLeft,
  Trash2,
  ShoppingCart,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { Link } from "react-router-dom";
import LottieComponent from "lottie-react";
import emptyWishlistAnimation from "../../../assets/lottie/Boxempty.json";
import Breadcrumbs from "../../../components/Breadcrumbs";

const Lottie = LottieComponent.default || LottieComponent;

// Mock data adapted for wishlist
const mockWishlistData = [
  {
    id: 1,
    name: "Air Motion 2.0",
    price: 2999,
    size: 9,
    color: "Black",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
  },
  {
    id: 2,
    name: "Urban Stride",
    price: 3499,
    size: 8,
    color: "White",
    image:
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80",
  },
];

const WishList = () => {
  const [wishlistItems, setWishlistItems] = useState(mockWishlistData);

  const removeItem = (id) => {
    setWishlistItems((items) => items.filter((item) => item.id !== id));
  };

  const moveToCart = (id) => {
    // Add your cart logic here
    console.log(`Moved item ${id} to cart`);
    removeItem(id); // Usually, moving to cart removes it from the wishlist
  };

  const moveAllToCart = () => {
    console.log("Moved all items to cart");
    setWishlistItems([]);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-lime-300 selection:text-black pb-12">
      {/* Top Navigation / Breadcrumbs */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Wishlist" }]} />
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-xl mx-auto">
        {wishlistItems.length === 0 ? (
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
              <button className="bg-[#bdec5e] text-black font-semibold text-sm px-8 py-3.5 rounded-lg hover:bg-lime-400 transition-colors uppercase tracking-wider shadow-[0_0_20px_rgba(189,236,94,0.15)]">
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
                  {wishlistItems.length} items
                </span>
              </div>

              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-2xl border border-white/10 bg-white/2 transition-all hover:bg-white/5 group"
                >
                  {/* Item Image */}
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-[#1f1f1f] shrink-0 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#27272a_0%,#1f1f1f_100%)] -z-10" />
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover mix-blend-screen opacity-90 group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex flex-col grow justify-between py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-[15px] font-semibold tracking-wide mb-1">
                          {item.name}
                        </h3>
                        <p className="text-zinc-400 text-xs mb-2">
                          Size: {item.size} • Color: {item.color}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 size={16} strokeWidth={1.5} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[15px] font-medium">
                        ₹{item.price.toLocaleString()}
                      </p>

                      {/* Add to Cart Control */}
                      <button
                        onClick={() => moveToCart(item.id)}
                        className="flex items-center gap-2 bg-white/5 hover:bg-[#bdec5e] hover:text-black text-white px-3 py-2 rounded-lg border border-white/10 transition-all text-xs font-semibold"
                      >
                        <ShoppingCart size={14} strokeWidth={2} />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mass Actions */}
            <div className="border-t border-white/10 pt-6 mt-4">
              <button
                onClick={moveAllToCart}
                className="w-full bg-[#bdec5e] text-black font-semibold text-sm py-4 rounded-xl hover:bg-lime-400 transition-all active:scale-[0.98] uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(189,236,94,0.15)] mb-3"
              >
                <ShoppingBag size={18} strokeWidth={2} />
                MOVE ALL TO CART
              </button>

              <Link to="/">
                <button className="w-full py-4 rounded-xl border border-dashed border-white/20 text-zinc-400 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm font-medium">
                  Keep Browsing
                  <ArrowRight size={16} strokeWidth={1.5} />
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WishList;
