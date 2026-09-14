import React from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate page numbers
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    // Show first, last, current, and adjacent pages
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pages.push("...");
    }
  }

  // Remove duplicate ellipses
  const uniquePages = pages.filter(
    (page, index) => page !== "..." || pages[index - 1] !== "..."
  );

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-full border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition"
        aria-label="Previous page"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="flex items-center gap-1">
        {uniquePages.map((page, index) =>
          page === "..." ? (
            <span key={`dots-${index}`} className="px-2 text-gray-500">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition ${
                currentPage === page
                  ? "bg-lime-400 text-black"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-full border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition"
        aria-label="Next page"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default Pagination;
