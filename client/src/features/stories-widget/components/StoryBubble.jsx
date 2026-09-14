import React from "react";

const StoryBubble = ({ story, onClick, isViewed = false }) => {
  return (
    <button
      onClick={onClick}
      aria-label={`View ${story.title} story`}
      className="flex flex-col items-center gap-2 p-1.5 bg-transparent border-none cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
    >
      {/* Gradient / Viewed Ring */}
      <div
        className={`w-[84px] h-[84px] rounded-full p-[3px] flex items-center justify-center ${
          isViewed
            ? "bg-neutral-700" // Dark grey for viewed state
            : "bg-[#9AE600]" // Theme color
        }`}
      >
        {/* Thumbnail */}
        <img
          src={story.thumbnail}
          alt={story.title}
          className="w-[78px] h-[78px] rounded-full object-cover border-2 border-black"
        />
      </div>

      <span className="text-[13px] text-white max-w-[80px] truncate">
        {story.title}
      </span>
    </button>
  );
};

export default StoryBubble;