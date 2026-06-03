const ArticleRowSkeleton = () => {
  return (
    // MATCHES: The exact padding, gaps, and responsive stacking of the real row
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 py-10 border-b border-gray-100 last:border-0 items-start animate-pulse">
      
      {/* IMAGE GHOST */}
      {/* MATCHES: w-full on mobile, w-72 on desktop, exact heights, and rounded-2xl */}
      <div className="w-full md:w-72 h-56 md:h-48 flex-shrink-0 bg-gray-200 rounded-2xl" />

      {/* CONTENT GHOST */}
      <div className="flex-1 flex flex-col h-full justify-center w-full">
        
        {/* Header Tags (Category | Date | Time) */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-4 w-16 bg-gray-200 rounded-md" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
          <div className="h-3 w-16 bg-gray-100 rounded hidden sm:block" />
        </div>

        {/* Title (2 lines) */}
        <div className="space-y-3 mb-5">
          <div className="h-6 sm:h-8 bg-gray-200 rounded-lg w-full" />
          <div className="h-6 sm:h-8 bg-gray-200 rounded-lg w-3/4" />
        </div>

        {/* Excerpt (2 lines) */}
        <div className="space-y-2 mb-6">
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-5/6" />
        </div>

        {/* Footer Row (Author vs Price) */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 md:border-none md:pt-0">
          {/* Author Ghost */}
          <div className="flex items-center gap-2">
            <div className="h-3 w-6 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>

          {/* Price & Button Ghost */}
          <div className="flex items-center gap-4">
            <div className="h-6 w-16 bg-gray-200 rounded" />
            <div className="h-4 w-12 bg-gray-200 rounded" />
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default ArticleRowSkeleton;