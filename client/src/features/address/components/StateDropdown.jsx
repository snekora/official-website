import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const StateDropdown = ({ value, onChange, placeholder = "State" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Smooth scroll to selected item when opened
  useEffect(() => {
    if (isOpen && value && listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [isOpen, value]);

  const handleSelect = (state) => {
    onChange(state);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full h-full flex items-center justify-between text-left outline-none cursor-pointer group"
      >
        <span
          className={`text-[15px] truncate ${
            value ? "text-white font-medium" : "text-zinc-600"
          }`}
        >
          {value || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-zinc-500 group-hover:text-zinc-300 transition-transform duration-300 shrink-0 ml-1 ${
            isOpen ? "rotate-180 text-lime-400" : ""
          }`}
        />
      </button>

      {/* Custom Animated Dropdown Menu with Smooth Scroll */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-[-16px] right-[-16px] top-[calc(100%+8px)] z-50 bg-[#161616]/98 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <div
              ref={listRef}
              className="max-h-56 overflow-y-auto custom-scrollbar p-1.5 space-y-0.5 scroll-smooth"
              style={{
                WebkitOverflowScrolling: "touch",
              }}
            >
              {indianStates.map((state) => {
                const isSelected = value === state;
                return (
                  <button
                    key={state}
                    type="button"
                    data-selected={isSelected}
                    onClick={() => handleSelect(state)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-lime-400/15 text-lime-400 font-semibold"
                        : "text-zinc-300 hover:text-white hover:bg-white/8"
                    }`}
                  >
                    <span>{state}</span>
                    {isSelected && (
                      <Check size={14} className="text-lime-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StateDropdown;
