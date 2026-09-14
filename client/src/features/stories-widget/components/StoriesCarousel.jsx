import React, { useState, useRef, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from "lucide-react";
import StoryBubble from "./StoryBubble";
import ProductTagOverlay from "./ProductTagOverlay";
import dummyVideo from "../../../assets/video/73b73f1db5ec43bda72d4839863905aa.HD-720p-1.6Mbps-87690301.mp4";
import p123 from "../../../assets/products/123.png";
import p124 from "../../../assets/products/124.png";
import p125 from "../../../assets/products/125.png";
import p126 from "../../../assets/products/126.png";

// Dummy Stories
const stories = [
  {
    id: 1,
    title: "Nike",
    thumbnail: "https://picsum.photos/id/1011/200/200",
    video: dummyVideo,
    product: { id: "p1", title: "Nike Air Max", price: 12999, image: p123 },
  },
  {
    id: 2,
    title: "Adidas",
    thumbnail: "https://picsum.photos/id/1025/200/200",
    video: dummyVideo,
    product: { id: "p2", title: "Adidas Ultraboost", price: 14999, image: p124 },
  },
  {
    id: 3,
    title: "Puma",
    thumbnail: "https://picsum.photos/id/1005/200/200",
    video: dummyVideo,
    product: { id: "p3", title: "Puma RS-X", price: 8999, image: p125 },
  },
  {
    id: 4,
    title: "Apple",
    thumbnail: "https://picsum.photos/id/1015/200/200",
    video: dummyVideo,
    product: { id: "p4", title: "Apple Watch SE", price: 29999, image: p126 },
  },
  {
    id: 5,
    title: "Samsung",
    thumbnail: "https://picsum.photos/id/1027/200/200",
    video: dummyVideo,
    product: { id: "p5", title: "Samsung Galaxy Buds", price: 9999, image: p123 },
  },
  {
    id: 6,
    title: "Sony",
    thumbnail: "https://picsum.photos/id/1035/200/200",
    video: dummyVideo,
    product: { id: "p6", title: "Sony WH-1000XM5", price: 24999, image: p124 },
  },
];

const StoriesCarousel = () => {
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  
  const videoRef = useRef(null);

  // Handle keyboard navigation and body scroll lock
  useEffect(() => {
    if (activeStoryIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    const handleKeyDown = (e) => {
      if (activeStoryIndex === null) return;
      
      if (e.key === "Escape") closeStory();
      if (e.key === "ArrowLeft" && activeStoryIndex > 0) {
        setActiveStoryIndex((prev) => prev - 1);
        setIsPlaying(true);
      }
      if (e.key === "ArrowRight" && activeStoryIndex < stories.length - 1) {
        setActiveStoryIndex((prev) => prev + 1);
        setIsPlaying(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [activeStoryIndex]);

  const handleStoryClick = (index) => {
    setActiveStoryIndex(index);
    setIsPlaying(true);
  };

  const closeStory = () => {
    setActiveStoryIndex(null);
    setIsPlaying(true);
  };

  const handleBackdropClick = (e) => {
    // Only close if clicking the dark overlay, not the video container
    if (e.target === e.currentTarget) {
      closeStory();
    }
  };

  const handleAddToCart = (productId) => {
    console.log("Add to cart from story:", productId);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      setIsPlaying(true);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      setIsPlaying(true);
    }
  };

  const handleVideoEnded = () => {
    // Auto-advance to the next story when the video ends
    if (activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      setIsPlaying(true);
    } else {
      // Close if it's the last story
      closeStory();
    }
  };

  const togglePlay = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  return (
    <>
      <style>
        {`
          .stories-carousel {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .stories-carousel::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>

      <div className="stories-carousel flex gap-3 overflow-x-auto overflow-y-hidden py-3 scroll-smooth">
        {stories.map((story, idx) => (
          <StoryBubble
            key={story.id}
            story={story}
            onClick={() => handleStoryClick(idx)}
          />
        ))}
      </div>

      {/* Story Viewer Modal */}
      {activeStory && (
        <div
          onClick={handleBackdropClick}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90"
        >
          {/* Video Container */}
          <div className="relative flex h-full max-h-[100vh] w-full max-w-[400px] justify-center overflow-hidden bg-black">
            
            {/* Top Bar: Progress & Close */}
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent p-5">
              <span className="text-sm font-bold text-white">
                {activeStoryIndex + 1} / {stories.length}
              </span>
              <button
                onClick={closeStory}
                className="flex cursor-pointer text-white transition hover:opacity-70"
              >
                <X size={24} />
              </button>
            </div>

            {/* Left/Right Navigation */}
            <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-between px-2.5">
              <button 
                onClick={handlePrev} 
                className={`pointer-events-auto cursor-pointer text-white transition-opacity duration-200 hover:opacity-70 ${
                  activeStoryIndex === 0 ? "opacity-0" : "opacity-100"
                }`}
              >
                <ChevronLeft size={40} />
              </button>
              <button 
                onClick={handleNext} 
                className={`pointer-events-auto cursor-pointer text-white transition-opacity duration-200 hover:opacity-70 ${
                  activeStoryIndex === stories.length - 1 ? "opacity-0" : "opacity-100"
                }`}
              >
                <ChevronRight size={40} />
              </button>
            </div>

            {/* Play/Pause & Mute */}
            <div className={`absolute right-5 z-10 flex flex-col gap-4 ${activeStory?.product ? "bottom-[120px]" : "bottom-10"}`}>
              <button 
                onClick={togglePlay} 
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
              >
                {isPlaying ? <Pause size={18} fill="#fff" /> : <Play size={18} fill="#fff" />}
              </button>
              <button 
                onClick={toggleMute} 
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
            
            <video
              key={activeStory.id}
              ref={videoRef}
              src={activeStory.video}
              autoPlay
              muted={isMuted}
              playsInline
              onEnded={handleVideoEnded}
              className="h-full w-full object-cover"
            />
            
            {/* Product Tag Overlay */}
            {activeStory.product && (
              <ProductTagOverlay
                product={activeStory.product}
                onAddToCart={handleAddToCart}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default StoriesCarousel;