import React from "react";

export default function StatusBadge({ value, featured, type = "pill", labelOverride }) {
  // Normalize input (Fallback to "UNKNOWN" if nothing is passed)
  const rawStatus = typeof featured === "boolean" 
    ? (featured ? "ACTIVE" : "INACTIVE") 
    : (value || "UNKNOWN").toUpperCase();

  // UX FIX: Format for display (e.g., "IN_PROGRESS" -> "In Progress")
  const displayLabel = labelOverride || rawStatus.replace(/_/g, " ").replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );

  // 🚀 ARCHITECTURE FIX: Use nested objects instead of Regex/String manipulation
  const configs = {
    // Green (Success)
    ACTIVE: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    SUCCESS: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    APPROVED: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    PUBLISHED: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },

    // Blue (Info)
    CREATE: { bg: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
    LOGIN: { bg: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
    
    // Yellow (Warning)
    PENDING: { bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
    UPDATE: { bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },

    // Red (Danger)
    FAILED: { bg: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
    REJECTED: { bg: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
    DELETE: { bg: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
    INACTIVE: { bg: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },

    // Gray (Default)
    DEFAULT: { bg: "bg-gray-50 text-gray-600 border-gray-200", dot: "bg-gray-400" },
  };

  const style = configs[rawStatus] || configs.DEFAULT;

  return (
    <span 
      className={`inline-flex items-center gap-1.5 rounded-full text-xs font-bold border transition-colors ${style.bg} ${type === 'dot' ? 'p-1' : 'px-2.5 py-0.5'}`}
      title={type === 'dot' ? displayLabel : undefined} // Add tooltip if text is hidden
    >
      {type !== "text" && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} aria-hidden="true"></span>
      )}
      
      {type !== "dot" && (
        <span>{displayLabel}</span>
      )}
    </span>
  );
}