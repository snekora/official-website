import React, { useState, useRef, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX, Loader2 } from "lucide-react";
import StoryBubble from "./StoryBubble";
import ProductTagOverlay from "./ProductTagOverlay";
import api from "../../../services/api";

const StoriesCarousel = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  
  const videoRef = useRef(null);

  // Fetch stories on mount
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await api.get("/story");
        // Ensure we get the data array
        const fetchedStories =
          response.data?.stories ||
          (Array.isArray(response.data?.data) ? response.data.data : null) ||
          (Array.isArray(response.data) ? response.data : []);
        
        // Format the stories so the frontend components (StoryBubble/ProductTagOverlay)
        // receive the data shape they expect.
        const formattedStories = (Array.isArray(fetchedStories) ? fetchedStories : []).map((story) => {
          let mappedProduct = null;
          if (story.product) {
            // Get the first image of the first variant if available
            const firstImage = story.product.variants?.[0]?.images?.[0]?.url;
            
            mappedProduct = {
              id: story.product._id,
              slug: story.product.slug || story.product._id,
              title: story.product.name,
              price: story.product.price,
              originalPrice: story.product.originalPrice,
              image: firstImage || "https://via.placeholder.com/60", // fallback
            };
          }

          return {
            id: story._id,
            title: story.title,
            thumbnail: story.thumbnail?.url,
            video: story.video?.url,
            product: mappedProduct,
          };
        });

        setStories(formattedStories);
      } catch (error) {
        console.error("Failed to fetch stories", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

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
  }, [activeStoryIndex, stories.length]);

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

  if (loading) {
    return (
      <div className="flex h-[120px] items-center justify-center">
        <Loader2 className="animate-spin text-lime-400" size={24} />
      </div>
    );
  }

  if (stories.length === 0) {
    return null; // Don't show the widget if there are no active stories
  }

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

      <section className="w-full py-6 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-start sm:justify-center">
          <div className="stories-carousel flex gap-4 sm:gap-6 overflow-x-auto overflow-y-hidden py-2 scroll-smooth items-center">
            {stories.map((story, idx) => (
              <StoryBubble
                key={story.id}
                story={story}
                onClick={() => handleStoryClick(idx)}
              />
            ))}
          </div>
        </div>
      </section>

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
                onClose={closeStory}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default StoriesCarousel;