import React from "react";

export default function ChartCard({ title, subtitle, action, children }) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
      
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6 gap-4">
        <div className="min-w-0"> {/* min-w-0 prevents text from pushing the action button off-screen */}
          <h3 className="text-lg font-bold text-gray-900 truncate">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1 truncate">{subtitle}</p>
          )}
        </div>
        
        {action && (
          <div className="shrink-0"> {/* shrink-0 keeps the action button its intended size */}
            {action}
          </div>
        )}
      </div>

      {/* Chart Container */}
      {/* 🔹 FIX: Added relative and min-w-0 to prevent ResponsiveContainer overflow bugs */}
      <div className="w-full h-[350px] sm:h-[420px] relative min-w-0">
        {children ? (
          children
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <span className="text-sm font-medium text-gray-400">No data available</span>
          </div>
        )}
      </div>
      
    </div>
  );
}