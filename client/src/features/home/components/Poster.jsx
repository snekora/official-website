import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Hero1 from "../../../assets/posters/Hero/1.png";
import Hero2 from "../../../assets/posters/Hero/2.png";
import Hero3 from "../../../assets/posters/Hero/3.png";
import Hero4 from "../../../assets/posters/Hero/4.png";

const slides = [Hero1, Hero2, Hero3, Hero4];

const Poster = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const autoplayRef = useRef(null);

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
    if (isPlaying) {
      autoplayRef.current = setInterval(nextSlide, 6000);
    }
    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [isPlaying, currentIndex]);

  return (
    <div
      className="relative w-full h-[40vh] md:h-[55vh] min-h-[300px] md:min-h-[450px] rounded-2xl md:rounded-3xl overflow-hidden bg-[#151515] group/carousel"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {slides.map((image, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
                isActive
                  ? "opacity-100 z-10"
                  : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Slide Image */}
              <div className="absolute inset-0 overflow-hidden w-full h-full">
                <img
                  src={image}
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

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-black/30 hover:bg-lime-400 hover:text-black text-white p-2.5 rounded-full backdrop-blur-md border border-white/10 transition-all duration-300 cursor-pointer"
        aria-label="Previous Slide"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-black/30 hover:bg-lime-400 hover:text-black text-white p-2.5 rounded-full backdrop-blur-md border border-white/10 transition-all duration-300 cursor-pointer"
        aria-label="Next Slide"
      >
        <ChevronRight size={22} />
      </button>

      {/* Indicators Dots */}
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
    </div>
  );
};

export default Poster;
