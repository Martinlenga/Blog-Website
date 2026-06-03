import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, setPage, pageCount }) {
  // 🚀 EDGE CASE FIX: Don't render pagination if there is only 1 page (or 0 pages)
  if (!pageCount || pageCount <= 1) return null;

  const prev = () => setPage((p) => Math.max(p - 1, 1));
  const next = () => setPage((p) => Math.min(p + 1, pageCount));

  return (
    <div className="flex items-center justify-between sm:justify-end gap-4 mt-6 px-1">
      
      <button
        onClick={prev}
        disabled={page === 1}
        aria-label="Previous page"
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all disabled:opacity-50 disabled:pointer-events-none shadow-sm active:scale-[0.98]"
      >
        <ChevronLeft size={16} strokeWidth={2.5} />
        {/* Hide text on tiny mobile screens to save space */}
        <span className="hidden sm:inline">Previous</span>
      </button>
      
      <span className="text-sm font-medium text-gray-500 tabular-nums">
        Page <span className="text-gray-900 font-bold">{page}</span> of <span className="text-gray-900 font-bold">{pageCount}</span>
      </span>
      
      <button
        onClick={next}
        disabled={page === pageCount}
        aria-label="Next page"
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all disabled:opacity-50 disabled:pointer-events-none shadow-sm active:scale-[0.98]"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={16} strokeWidth={2.5} />
      </button>
      
    </div>
  );
}