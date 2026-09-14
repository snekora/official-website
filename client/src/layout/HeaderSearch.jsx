import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, X, Loader2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchSearchSuggestions } from "../features/product/redux/productSlice";
import { useDebounce } from "../hooks/useDebounce";
import api from "../services/api";

const SEARCH_HISTORY_KEY = "snekora_search_history";

const getSavedHistory = () => {
  try {
    const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const HeaderSearch = ({
  isOpen: externalIsOpen,
  setIsOpen: externalSetIsOpen,
  onOpen,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalSetIsOpen || setInternalIsOpen;

  const [query, setQuery] = useState("");
  const [randomProducts, setRandomProducts] = useState([]);
  const [randomLoading, setRandomLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState(getSavedHistory);

  const debouncedQuery = useDebounce(query, 250);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const handleTriggerClick = () => {
    if (onOpen) onOpen();
    setIsOpen(true);
  };

  const { suggestions, suggestionsLoading } = useSelector(
    (state) => state.product,
  );

  // Lock body scroll and auto-focus when search opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ESC key handler to close search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Fetch 4 random products whenever the search overlay opens
  useEffect(() => {
    if (isOpen) {
      const fetchRandomProducts = async () => {
        setRandomLoading(true);
        try {
          const { data } = await api.get("/products", {
            params: { limit: 20 },
          });
          if (data.success && data.products && data.products.length > 0) {
            const shuffled = [...data.products].sort(() => 0.5 - Math.random());
            setRandomProducts(shuffled.slice(0, 4));
          }
        } catch {
          setRandomProducts([]);
        } finally {
          setRandomLoading(false);
        }
      };
      fetchRandomProducts();
    }
  }, [isOpen]);

  // Fetch suggestions when typing in search
  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      dispatch(fetchSearchSuggestions(debouncedQuery));
    }
  }, [debouncedQuery, dispatch]);

  // Helper to save a query into localStorage history
  const saveToHistory = (term) => {
    const cleanTerm = term.trim();
    if (!cleanTerm) return;

    setSearchHistory((prev) => {
      const filtered = prev.filter(
        (item) => item.toLowerCase() !== cleanTerm.toLowerCase(),
      );
      const updated = [cleanTerm, ...filtered].slice(0, 6);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Helper to remove a single query from history
  const removeFromHistory = (termToRemove, e) => {
    e.stopPropagation();
    setSearchHistory((prev) => {
      const updated = prev.filter((item) => item !== termToRemove);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Helper to clear all history
  const clearAllHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch {}
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      saveToHistory(query.trim());
      setIsOpen(false);
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    saveToHistory(suggestion);
    setQuery(suggestion);
    setIsOpen(false);
    navigate(`/products?search=${encodeURIComponent(suggestion)}`);
  };

  const handleProductClick = (product) => {
    if (product.name) {
      saveToHistory(product.name);
    }
    setIsOpen(false);
    navigate(`/product/${product.slug || product._id}`);
  };

  const renderRecentSearchesCard = () => {
    if (searchHistory.length === 0) return null;

    return (
      <div className="w-full bg-[#0c0c0e] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-900 mb-3">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400">
            RECENT SEARCHES
          </h3>
          <button
            onClick={clearAllHistory}
            className="text-[10px] text-zinc-500 hover:text-red-400 font-semibold transition"
          >
            Clear All
          </button>
        </div>

        <div className="space-y-1">
          {searchHistory.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleSuggestionClick(item)}
              className="flex items-center justify-between group cursor-pointer py-1.5 px-2 rounded-xl hover:bg-zinc-900/60 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Clock
                  size={15}
                  className="text-zinc-500 shrink-0 group-hover:text-lime-400 transition"
                />
                <span className="font-bold text-sm text-zinc-200 group-hover:text-white truncate">
                  {item}
                </span>
              </div>
              <button
                onClick={(e) => removeFromHistory(item, e)}
                className="text-zinc-600 hover:text-zinc-300 p-1 transition"
                aria-label="Remove search"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSuggestedForYouCard = () => (
    <div className="w-full bg-[#0c0c0e] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl">
      <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 pb-2 border-b border-zinc-900 mb-3">
        SUGGESTED FOR YOU
      </h3>

      {randomLoading ? (
        <div className="py-2 text-xs text-zinc-500 flex items-center gap-2">
          <Loader2 size={14} className="animate-spin text-lime-400" />
          Loading products...
        </div>
      ) : randomProducts.length > 0 ? (
        <div className="space-y-3">
          {randomProducts.map((prod) => {
            const img = prod.variants?.[0]?.images?.[0]?.url;

            return (
              <div
                key={prod._id}
                onClick={() => handleProductClick(prod)}
                className="flex items-center gap-3.5 group cursor-pointer py-1"
              >
                {img ? (
                  <img
                    src={img}
                    alt={prod.name}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover bg-zinc-900 border border-white/10 shrink-0 group-hover:border-lime-400/50 transition"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-zinc-900 border border-white/10 shrink-0 flex items-center justify-center text-zinc-600">
                    <Search size={18} />
                  </div>
                )}
                <span className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider group-hover:text-lime-400 transition leading-snug">
                  {prod.name}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-zinc-600">No products found</p>
      )}
    </div>
  );

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={handleTriggerClick}
        aria-label="Open Search"
        className="text-white hover:text-lime-400 transition"
      >
        <Search size={24} />
      </button>

      {/* Floating Island Search Experience */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                {/* Dimmed Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsOpen(false)}
                  className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm"
                />

                {/* Top Search Bar (slides down from top in header height) */}
                <motion.div
                  initial={{ y: -72 }}
                  animate={{ y: 0 }}
                  exit={{ y: -72 }}
                  transition={{ type: "spring", damping: 25, stiffness: 250 }}
                  className="fixed top-0 left-0 right-0 z-[9999] h-[72px] bg-[#0e0e0e] border-b border-white/10 flex items-center justify-center px-4 sm:px-8"
                >
                  <form
                    onSubmit={handleSearchSubmit}
                    className="w-full max-w-2xl"
                  >
                    <div className="relative rounded-full border border-white/40 bg-[#050505] px-5 py-2 flex items-center justify-between shadow-lg">
                      <div className="flex flex-col flex-1 min-w-0 pr-2">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider leading-none mb-0.5">
                          Search
                        </span>
                        <input
                          ref={inputRef}
                          type="text"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Type to search..."
                          className="bg-transparent text-white font-bold text-base sm:text-lg outline-none w-full leading-tight placeholder:text-zinc-700"
                          autoComplete="off"
                        />
                      </div>

                      <div className="flex items-center shrink-0">
                        {query && (
                          <button
                            type="button"
                            onClick={() => setQuery("")}
                            className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition"
                          >
                            <X size={12} />
                          </button>
                        )}
                        <div className="h-5 w-[1px] bg-white/20 mx-3" />
                        <button
                          type="submit"
                          className="text-white hover:text-lime-400 transition"
                        >
                          <Search size={20} />
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>

                {/* Floating Island Containers (positioned top-[84px]) */}
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                  className="fixed top-[84px] left-1/2 -translate-x-1/2 z-[9999] w-full max-w-2xl px-4 flex flex-col pointer-events-none"
                  style={{ maxHeight: "calc(100vh - 100px)" }}
                >
                  <div
                    className="w-full flex flex-col items-center gap-3 overflow-y-auto custom-scrollbar pointer-events-auto min-h-0 pb-16"
                    style={{
                      maskImage:
                        "linear-gradient(to bottom, black 85%, transparent 100%)",
                      WebkitMaskImage:
                        "linear-gradient(to bottom, black 85%, transparent 100%)",
                    }}
                  >
                    {query.trim().length === 0 ? (
                      /* Empty Query -> RECENT SEARCHES Card (if any) + SUGGESTED FOR YOU Card */
                      <>
                        {renderRecentSearchesCard()}
                        {renderSuggestedForYouCard()}
                      </>
                    ) : (
                      /* Query Present -> SEARCH RESULTS Island + SUGGESTED FOR YOU Island Below */
                      <>
                        {/* Div 1: SEARCH RESULTS Island */}
                        <div className="w-full bg-[#0c0c0e] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl">
                          <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 pb-2 border-b border-zinc-900 mb-3">
                            SEARCH RESULTS
                          </h3>

                          {suggestionsLoading ? (
                            <div className="py-2 text-xs text-zinc-500 flex items-center gap-2">
                              <Loader2
                                size={14}
                                className="animate-spin text-lime-400"
                              />
                              Searching...
                            </div>
                          ) : suggestions.length > 0 ? (
                            <div className="space-y-2">
                              {suggestions.map((item, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleSuggestionClick(item)}
                                  className="w-full text-left font-bold text-sm sm:text-base text-white hover:text-lime-400 transition cursor-pointer py-1 leading-snug"
                                >
                                  {item}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-zinc-600">
                              No results found for "{query}"
                            </p>
                          )}
                        </div>

                        {/* Div 2: RECENT SEARCHES Island (Separate card!) */}
                        {renderRecentSearchesCard()}

                        {/* Div 3: SUGGESTED FOR YOU Island (Always present below!) */}
                        {renderSuggestedForYouCard()}
                      </>
                    )}
                  </div>

                  {/* Floating Div Underneath Results Island with Close Button */}
                  <div className="flex items-center justify-center pt-1 pb-4 shrink-0 pointer-events-auto relative z-10 -mt-6">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 bg-[#111113] hover:bg-zinc-800 text-white rounded-full px-5 py-2 border border-white/15 text-xs font-bold transition-all shadow-2xl hover:scale-105 active:scale-95"
                    >
                      <X size={15} className="text-lime-400" />
                      <span>Close Search</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
};

export default HeaderSearch;
