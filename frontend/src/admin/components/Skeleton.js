import React from "react";

// ----------------------------------------------------------------------
// 1. BASE PRIMITIVE: Use this anywhere to build custom loading shapes
// ----------------------------------------------------------------------
export function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={`animate-pulse bg-gray-200/80 rounded-md ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
}

// ----------------------------------------------------------------------
// 2. TABLE SKELETON: Optimized version of your original matrix grid
// ----------------------------------------------------------------------
export function TableSkeleton({ rows = 5, cols = 5 }) {
  // Array of varied widths to make the table skeleton look like real data
  const cellWidths = ["w-full", "w-3/4", "w-5/6", "w-2/3", "w-1/2", "w-4/5"];

  return (
    <div role="status" className="w-full space-y-4" aria-label="Loading table data...">
      {/* Visually hidden text for screen readers */}
      <span className="sr-only">Loading...</span>

      {/* Header Row (Slightly darker/taller to distinguish from body) */}
      <div className="flex gap-4 pb-4 border-b border-gray-100">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-5 flex-1 bg-gray-300/60" />
        ))}
      </div>

      {/* Body Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4 items-center py-2">
          {Array.from({ length: cols }).map((_, colIndex) => {
            // Assign a pseudo-random width based on the column index to mimic real text
            const widthClass = cellWidths[(rowIndex + colIndex) % cellWidths.length];
            return (
              <div key={`cell-${rowIndex}-${colIndex}`} className="flex-1">
                <Skeleton className={`h-4 ${widthClass}`} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}