import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ZoomIn,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ProductImageCarousel = ({ images = [], productName = "Product" }) => {
  const [[currentImageIndex, direction], setPage] = useState([0, 0]);

  // Lightbox Modal state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Hover zoom lens state
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Thumbnail container ref for smooth auto-scroll into view
  const thumbnailContainerRef = useRef(null);

  // Reset index when images array changes (e.g. variant change)
  useEffect(() => {
    setPage([0, 0]);
  }, [images]);

  // Navigation Handlers with direction tracking
  const handleNextImage = () => {
    if (images.length === 0) return;
    setPage(([prevIndex]) => [
      prevIndex === images.length - 1 ? 0 : prevIndex + 1,
      1,
    ]);
  };

  const handlePrevImage = () => {
    if (images.length === 0) return;
    setPage(([prevIndex]) => [
      prevIndex === 0 ? images.length - 1 : prevIndex - 1,
      -1,
    ]);
  };

  const handleSelectImage = (newIndex) => {
    setPage(([prevIndex]) => [newIndex, newIndex > prevIndex ? 1 : -1]);
  };

  const handleDragEnd = (e, { offset, velocity }) => {
    const swipeThreshold = 50; // px threshold to trigger page turn
    if (offset.x < -swipeThreshold || velocity.x < -500) {
      handleNextImage(); // Swipe Left -> Next
    } else if (offset.x > swipeThreshold || velocity.x > 500) {
      handlePrevImage(); // Swipe Right -> Prev
    }
  };

  // Direction slide variants for smooth entry and exit in both directions
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? "100%" : dir < 0 ? "-100%" : 0,
      opacity: dir === 0 ? 1 : 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      zIndex: 0,
      x: dir < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  // Mouse move handler for desktop hover zoom lens
  const handleMouseMove = (e) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setMousePos({ x, y });
  };

  // Scroll thumbnail container horizontally
  const scrollThumbnails = (dir) => {
    if (thumbnailContainerRef.current) {
      thumbnailContainerRef.current.scrollBy({
        left: dir === "left" ? -180 : 180,
        behavior: "smooth",
      });
    }
  };

  // Scroll active thumbnail into view when currentImageIndex changes
  useEffect(() => {
    if (thumbnailContainerRef.current) {
      const activeThumb =
        thumbnailContainerRef.current.children[currentImageIndex];
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [currentImageIndex]);

  // Keyboard navigation shortcuts for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isLightboxOpen) {
        if (e.key === "Escape") {
          setIsLightboxOpen(false);
        } else if (e.key === "ArrowLeft") {
          handlePrevImage();
        } else if (e.key === "ArrowRight") {
          handleNextImage();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, images.length]);

  return (
    <>
      {/* Product Image Carousel Display Container */}
      <div className="px-4 sm:px-6 lg:px-0 pb-4 lg:pb-0 lg:sticky lg:top-8 h-fit space-y-3">
        {/* Main Display Box */}
        <div
          className="relative w-full aspect-square sm:aspect-video lg:aspect-square overflow-hidden rounded-2xl group touch-pan-y border border-white/10 bg-zinc-900"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseMove={handleMouseMove}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1a1a1a_0%,#0a0a0a_80%)] -z-10" />

          {/* Image Counter Badge */}
          {images.length > 0 && (
            <div className="absolute top-3.5 left-3.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-xs text-zinc-300 font-normal z-20 border border-white/10 flex items-center gap-1.5 pointer-events-none tracking-normal">
              <span>{currentImageIndex + 1}</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-400">{images.length}</span>
            </div>
          )}

          {/* Lightbox / Zoom Expand Trigger Button */}
          {images.length > 0 && (
            <button
              onClick={() => setIsLightboxOpen(true)}
              className="absolute top-3.5 right-3.5 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-all opacity-80 hover:opacity-100 hover:scale-105 z-20 border border-white/10"
              title="Open fullscreen view"
              aria-label="Expand image"
            >
              <Maximize2 size={15} />
            </button>
          )}

          {/* Sliding Track with Desktop Hover Zoom Lens */}
          {images.length > 0 ? (
            <div className="relative w-full h-full overflow-hidden">
              <AnimatePresence
                initial={false}
                custom={direction}
                mode="popLayout"
              >
                <motion.div
                  key={currentImageIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden cursor-zoom-in"
                  onClick={() => setIsLightboxOpen(true)}
                >
                  <img
                    src={images[currentImageIndex]?.url}
                    alt={`${productName} - ${currentImageIndex + 1}`}
                    draggable={false}
                    style={
                      isHovered
                        ? {
                            transform: "scale(1.75)",
                            transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                            transition: "transform 0.1s ease-out",
                          }
                        : {
                            transform: "scale(1)",
                            transition: "transform 0.3s ease-out",
                          }
                    }
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">
              No Image Available
            </div>
          )}

          {/* Hover Indicator Overlay */}
          {isHovered && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-zinc-300 pointer-events-none hidden lg:flex items-center gap-1.5 z-20 border border-white/10 tracking-normal">
              <ZoomIn size={12} className="text-[#bdec5e]" /> Click to view full screen
            </div>
          )}

          {/* Hover Desktop Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hidden sm:flex items-center justify-center z-20 border border-white/10 hover:scale-105 active:scale-95"
                aria-label="Previous image"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hidden sm:flex items-center justify-center z-20 border border-white/10 hover:scale-105 active:scale-95"
                aria-label="Next image"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* Pagination Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 pointer-events-auto bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectImage(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentImageIndex === idx
                      ? "bg-[#bdec5e] w-5"
                      : "bg-white/40 hover:bg-white/70 w-1.5"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Minimalist Interactive Thumbnail Gallery Strip */}
        {images.length > 1 && (
          <div className="relative group/thumbs w-full bg-zinc-900/30 border border-white/10 p-1.5 sm:p-2 rounded-2xl overflow-hidden">
            {/* Desktop Left Scroll Button */}
            <button
              onClick={() => scrollThumbnails("left")}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/80 text-white p-1 rounded-full border border-white/15 backdrop-blur-md opacity-0 group-hover/thumbs:opacity-100 transition-opacity z-20 hidden sm:flex items-center justify-center hover:scale-105 active:scale-95"
              aria-label="Scroll thumbnails left"
            >
              <ChevronLeft size={14} />
            </button>

            {/* Desktop Right Scroll Button */}
            <button
              onClick={() => scrollThumbnails("right")}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/80 text-white p-1 rounded-full border border-white/15 backdrop-blur-md opacity-0 group-hover/thumbs:opacity-100 transition-opacity z-20 hidden sm:flex items-center justify-center hover:scale-105 active:scale-95"
              aria-label="Scroll thumbnails right"
            >
              <ChevronRight size={14} />
            </button>

            {/* Thumbnail Scroll Track */}
            <div
              ref={thumbnailContainerRef}
              className="flex items-center gap-2 overflow-x-auto py-0.5 px-1 scrollbar-none snap-x touch-pan-x"
            >
              {images.map((img, idx) => {
                const isActive = currentImageIndex === idx;
                return (
                  <button
                    key={img.id || idx}
                    onClick={() => handleSelectImage(idx)}
                    className={`group/thumb relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden snap-center focus:outline-none transition-all duration-200 ${
                      isActive
                        ? "opacity-100"
                        : "opacity-40 hover:opacity-90 scale-95 border border-white/10"
                    }`}
                  >
                    <div className="absolute inset-0 bg-zinc-900 -z-10" />

                    <img
                      src={img.url}
                      alt={`${productName} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Active Border */}
                    {isActive && (
                      <motion.div
                        layoutId="activeThumbBorder"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 35,
                        }}
                        className="absolute inset-0 rounded-xl border-2 border-[#bdec5e] pointer-events-none z-10"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 selection:bg-[#bdec5e] selection:text-black"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between w-full max-w-7xl mx-auto z-10">
              <div className="flex items-center gap-3">
                <span className="text-sm sm:text-base font-semibold text-white tracking-wide">
                  {productName}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-zinc-300 border border-white/10">
                  {currentImageIndex + 1} / {images.length}
                </span>
              </div>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105 active:scale-95 border border-white/10"
                aria-label="Close Lightbox"
                title="Close (Esc)"
              >
                <X size={22} />
              </button>
            </div>

            {/* Central Main Image View */}
            <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]?.url}
                  alt={`${productName} full view`}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="max-h-[80vh] max-w-full object-contain select-none rounded-xl shadow-2xl"
                />
              </AnimatePresence>

              {/* Prev / Next Nav Buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all hover:scale-110 active:scale-95 backdrop-blur-md shadow-lg"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all hover:scale-110 active:scale-95 backdrop-blur-md shadow-lg"
                    aria-label="Next image"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Thumbnail Navigation in Lightbox */}
            {images.length > 1 && (
              <div className="w-full max-w-2xl mx-auto bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex items-center justify-center gap-2.5 overflow-x-auto">
                {images.map((img, idx) => {
                  const isActive = currentImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectImage(idx)}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300 focus:outline-none ${
                        isActive
                          ? "scale-105 opacity-100 shadow-lg shadow-[#bdec5e]/20"
                          : "opacity-40 hover:opacity-90 scale-95 border border-white/10"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`Lightbox thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {isActive && (
                        <motion.div
                          layoutId="lightboxActiveThumbBorder"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 35,
                          }}
                          className="absolute inset-0 border-2 border-[#bdec5e] rounded-xl pointer-events-none"
                        >
                          <div className="absolute inset-0 bg-[#bdec5e]/15 pointer-events-none" />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductImageCarousel;
