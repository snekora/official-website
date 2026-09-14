import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { fetchBrands } from "../redux/brandSlice";
import placeholderImg from "../../../assets/placeholder/placeholder.png";

const getBrandImage = (brand) => {
  if (brand?.logo && typeof brand.logo === "object" && brand.logo.url)
    return brand.logo.url;
  if (typeof brand?.logo === "string" && brand.logo) return brand.logo;
  if (brand?.image) return brand.image;
  return placeholderImg;
};

const ShopByBrand = () => {
  const dispatch = useDispatch();
  const { brands: apiBrands } = useSelector((state) => state.brand);
  const sliderRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(1);

  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  const displayBrands = apiBrands || [];

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) return;

    const total = displayBrands.length;
    const progress = Math.min(1, Math.max(0, scrollLeft / maxScroll));
    const index = Math.min(
      total,
      Math.max(1, Math.round(progress * (total - 1)) + 1),
    );
    setCurrentIndex(index);
  };

  const scroll = (direction) => {
    if (!sliderRef.current) return;

    sliderRef.current.scrollBy({
      left: direction === "left" ? -280 : 280,
      behavior: "smooth",
    });
  };

  return (
    <section className=" py-12 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-[22px] sm:text-3xl font-bold">
            Shop by Brand
          </h2>
          <Link
            to="/brands"
            className="text-lime-300 text-sm font-semibold hover:text-lime-400 transition-colors tracking-wider"
          >
            View All
          </Link>
        </div>

        {displayBrands.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 text-sm bg-white/[0.02] rounded-3xl border border-white/5">
            No brands available right now. Check back soon!
          </div>
        ) : (
          <>
            {/* Slider */}
            <div
              ref={sliderRef}
              onScroll={handleScroll}
              className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth py-1"
            >
              {displayBrands.map((brand) => (
                <Link
                  key={brand.slug || brand._id || brand.name}
                  to={`/products?brand=${brand.slug || brand.name}`}
                  className="group relative flex-shrink-0 w-[200px] sm:w-[230px] md:w-[260px] aspect-[4/5] rounded-2xl overflow-hidden snap-start shadow-lg border border-white/5"
                >
                  <img
                    src={getBrandImage(brand)}
                    alt={brand.name}
                    onError={(e) => {
                      e.target.src = placeholderImg;
                    }}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 flex items-end justify-between">
                    <div>
                      <p className="text-white text-base sm:text-lg font-extrabold leading-tight">
                        {brand.name}
                      </p>

                      <p className="text-zinc-400 text-xs mt-0.5 font-medium">
                        Shop Collection
                      </p>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shrink-0">
                      <ArrowUpRight size={16} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Bottom Pagination Indicator matching user's design: < 2/9 > */}
            <div className="flex items-center justify-center gap-3.5 mt-5">
              <button
                onClick={() => scroll("left")}
                disabled={currentIndex === 1}
                className="text-zinc-400 hover:text-white disabled:opacity-20 disabled:hover:text-zinc-400 transition p-0.5"
                aria-label="Previous brand"
              >
                <ChevronLeft size={14} />
              </button>

              <span className="text-xs font-bold text-zinc-300 tracking-widest font-mono">
                {currentIndex}/{displayBrands.length}
              </span>

              <button
                onClick={() => scroll("right")}
                disabled={currentIndex === displayBrands.length}
                className="text-zinc-400 hover:text-white disabled:opacity-20 disabled:hover:text-zinc-400 transition p-0.5"
                aria-label="Next brand"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ShopByBrand;
