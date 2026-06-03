import React from "react";
import { SearchX } from "lucide-react"; // Using a consistent Lucide icon

export default function EmptyState({
  title = "No data available",
  description = "",
  icon,
  children, // Optional action buttons
  className = "", // Allow parents to pass min-heights or margin
}) {
  // Use the passed icon, or fallback to the standard SearchX icon
  const displayIcon = icon || <SearchX size={32} strokeWidth={1.5} className="text-gray-400" />;

  return (
    <div 
      className={`w-full flex flex-col items-center justify-center p-8 sm:p-16 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 ${className}`}
    >
      {/* Icon Wrapper with a subtle pop effect */}
      <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 border border-gray-100">
        {displayIcon}
      </div>
      
      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed mb-6">
          {description}
        </p>
      )}
      
      {/* Renders any buttons passed into the component */}
      {children && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {children}
        </div>
      )}
    </div>
  );
}