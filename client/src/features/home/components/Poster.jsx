import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { fetchPublicPosters } from "../redux/posterSlice";

// Fallback images
import Hero1 from "../../../assets/posters/Hero/1.png";
import Hero2 from "../../../assets/posters/Hero/2.png";
import Hero3 from "../../../assets/posters/Hero/3.png";
import Hero4 from "../../../assets/posters/Hero/4.png";

const fallbackSlides = [
  { image: Hero1 },
  { image: Hero2 },
  { image: Hero3 },
  { image: Hero4 },
];

const Poster = () => {
  const dispatch = useDispatch();
  const { posters, loading } = useSelector((state) => state.poster || {});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Touch Swipe States
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    dispatch(fetchPublicPosters());
  }, [dispatch]);

  // Use dynamic posters if available, otherwise use fallbacks
  const slides = posters.length > 0 ? posters : fallbackSlides;

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Autoplay timer that pauses on hover/touch-and-hold and resumes on release
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 2800);

    return () => clearInterval(timer);
  }, [isPaused, currentIndex, slides.length]);

  // Touch Swipe handlers
  const minSwipeDistance = 50;
  const onTouchStart = (e) => {
    setIsPaused(true);
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    setIsPaused(false);
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  if (loading) {
    return (
      <div className="relative w-full aspect-[16/9] lg:aspect-[21/9] rounded-2xl md:rounded-3xl overflow-hidden bg-[#151515] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-lime-400" />
      </div>
    );
  }

  return (
    <div
      className="relative w-full aspect-[16/9] lg:aspect-[21/9] rounded-2xl md:rounded-3xl overflow-hidden bg-[#151515] group/carousel select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={() => {
        setIsPaused(false);
        setTouchEnd(null);
        setTouchStart(null);
      }}
    >
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          const desktopSrc =
            slide.desktopImage?.url ||
            slide.image?.url ||
            (typeof slide.image === "string" ? slide.image : null);
          const mobileSrc =
            slide.mobileImage?.url ||
            slide.image?.url ||
            (typeof slide.image === "string" ? slide.image : null);
          const fallbackSrc = desktopSrc || mobileSrc || Hero1;

          return (
            <div
              key={slide._id || index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive
                  ? "opacity-100 z-10"
                  : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Slide Image */}
              <div className="absolute inset-0 overflow-hidden w-full h-full">
                <picture className="w-full h-full block">
                  {desktopSrc && (
                    <source
                      media="(min-width: 768px)"
                      srcSet={desktopSrc}
                    />
                  )}
                  {mobileSrc && (
                    <source
                      media="(max-width: 767px)"
                      srcSet={mobileSrc}
                    />
                  )}
                  <img
                    src={fallbackSrc}
                    alt={`Sneaker Poster ${index + 1}`}
                    className="w-full h-full object-cover object-center"
                  />
                </picture>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        type="button"
        onClick={prevSlide}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-40 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md border border-white/20 transition-all duration-200 hover:bg-lime-400 hover:text-black hover:border-lime-400 hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
        aria-label="Previous Slide"
      >
        <ChevronLeft size={22} className="stroke-[2.5]" />
      </button>
      <button
        type="button"
        onClick={nextSlide}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md border border-white/20 transition-all duration-200 hover:bg-lime-400 hover:text-black hover:border-lime-400 hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
        aria-label="Next Slide"
      >
        <ChevronRight size={22} className="stroke-[2.5]" />
      </button>

      {/* Indicators Dots */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm border border-white/5 opacity-60 hover:opacity-100 transition-opacity duration-300">
        {slides.map((_, index) => (
          <button
            type="button"
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              index === currentIndex
                ? "w-4 sm:w-5 h-1 bg-lime-400/90 shadow-[0_0_6px_rgba(163,230,53,0.5)]"
                : "w-1.5 h-1 bg-white/25 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Poster;
