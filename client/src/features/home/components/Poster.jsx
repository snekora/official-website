import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import api from "../../../services/api";

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
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const autoplayRef = useRef(null);

  useEffect(() => {
    const fetchPosters = async () => {
      try {
        const response = await api.get("/poster");
        const fetchedPosters =
          response.data?.posters ||
          (Array.isArray(response.data?.data) ? response.data.data : null) ||
          (Array.isArray(response.data) ? response.data : []);

        const validPosters = Array.isArray(fetchedPosters) ? fetchedPosters : [];
        setPosters(validPosters);
      } catch (error) {
        console.error("Failed to fetch posters", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosters();
  }, []);

  // Use dynamic posters if available, otherwise use fallbacks
  const slides = posters.length > 0 ? posters : fallbackSlides;

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1,
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (isPlaying && slides.length > 1) {
      autoplayRef.current = setInterval(nextSlide, 6000);
    }
    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [isPlaying, currentIndex, slides.length]);

  if (loading) {
    return (
      <div className="relative w-full h-[40vh] md:h-[55vh] min-h-[300px] md:min-h-[450px] rounded-2xl md:rounded-3xl overflow-hidden bg-[#151515] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-lime-400" />
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-[40vh] md:h-[55vh] min-h-[300px] md:min-h-[450px] rounded-2xl md:rounded-3xl overflow-hidden bg-[#151515] group/carousel"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          // Determine the image source
          const imageSrc = slide.image?.url || slide.image;

          return (
            <div
              key={slide._id || index}
              className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
                isActive
                  ? "opacity-100 z-10"
                  : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Slide Image */}
              <div className="absolute inset-0 overflow-hidden w-full h-full">
                <img
                  src={imageSrc}
                  alt={`Sneaker Poster ${index + 1}`}
                  className={`w-full h-full object-cover transition-transform duration-6000 ease-out ${
                    isActive ? "scale-100" : "scale-110"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows (Only show if multiple slides) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-black/30 hover:bg-lime-400 hover:text-black text-white p-2.5 rounded-full backdrop-blur-md border border-white/10 transition-all duration-300 cursor-pointer opacity-0 group-hover/carousel:opacity-100"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-black/30 hover:bg-lime-400 hover:text-black text-white p-2.5 rounded-full backdrop-blur-md border border-white/10 transition-all duration-300 cursor-pointer opacity-0 group-hover/carousel:opacity-100"
            aria-label="Next Slide"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Indicators Dots (Only show if multiple slides) */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                index === currentIndex
                  ? "w-8 h-2 bg-lime-400"
                  : "w-2 h-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Poster;
