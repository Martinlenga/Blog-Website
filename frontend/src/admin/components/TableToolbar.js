import React, { useState, useRef, useEffect } from "react";
import { Search, Filter, ChevronDown, DollarSign } from "lucide-react";

// ----------------------------------------------------------------------
// 1. CUSTOM DROPDOWN (Accessible & Optimized)
// ----------------------------------------------------------------------
const CustomDropdown = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // PERFORMANCE: Only attach the listener if the dropdown is actually open
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    
    // UX/A11Y: Allow closing with the Escape key
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // Handle both flat string arrays and {label, value} object arrays cleanly
  const normalizedOptions = options.map(opt => 
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  const selectedLabel = normalizedOptions.find(opt => opt.value === value)?.label;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* TRIGGER: Swapped div for a native button for Keyboard Accessibility */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] sm:text-xs font-medium text-gray-600 flex items-center justify-between gap-2 shadow-sm hover:border-gray-300 transition-all min-w-[100px] max-w-[140px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        <ChevronDown size={12} className={`text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* MENU: Absolutely positioned to float on top */}
      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-xl z-[50] min-w-[140px] py-1 animate-in fade-in slide-in-from-top-1 duration-200"
          role="listbox"
        >
          <button
            type="button"
            className="w-full text-left px-3 py-1.5 text-[11px] sm:text-xs text-gray-400 hover:bg-gray-50 transition-colors font-medium"
            onClick={() => { onChange(""); setIsOpen(false); }}
          >
            {placeholder}
          </button>
          
          {normalizedOptions.map((opt) => (
            <button
              type="button"
              key={opt.value}
              role="option"
              aria-selected={value === opt.value}
              className={`w-full text-left px-3 py-1.5 text-[11px] sm:text-xs transition-colors ${
                value === opt.value 
                  ? "bg-indigo-50 text-indigo-700 font-bold" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium"
              }`}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// 2. TABLE TOOLBAR
// ----------------------------------------------------------------------
export default function TableToolbar({ 
  search, setSearch, 
  dateRange, setDateRange, 
  category, setCategory, categories, 
  showPriceFilter = false, minPrice, setMinPrice, maxPrice, setMaxPrice, 
  children 
}) {
  const hasFilters = dateRange || category || minPrice || maxPrice;
  
  const clearFilters = () => {
    if (setDateRange) setDateRange("");
    if (setCategory) setCategory("");
    if (setMinPrice) setMinPrice("");
    if (setMaxPrice) setMaxPrice("");
  };

  return (
    <div className="w-full">
      {/* TOP ROW: Search & Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
        <div className="relative w-full sm:max-w-xs group">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            name="search"
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm bg-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all"
          />
        </div>
        <div className="flex gap-2">
          {children}
        </div>
      </div>

      {/* BOTTOM ROW: Dynamic Filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
          <Filter size={12} /> Filters:
        </div>
        
        {/* Date Filter (Now uses clean object arrays) */}
        {setDateRange && (
          <CustomDropdown
            value={dateRange}
            onChange={setDateRange}
            options={[
              { label: "Today", value: "today" },
              { label: "Last 7 Days", value: "7" },
              { label: "Last 30 Days", value: "30" }
            ]}
            placeholder="Any Time"
          />
        )}

        {/* Category Filter */}
        {setCategory && categories && (
          <CustomDropdown
            value={category}
            onChange={setCategory}
            options={categories}
            placeholder="All Categories"
          />
        )}

        {/* 🚀 BUG FIX: Actually rendering the Price Filters if requested */}
        {showPriceFilter && (
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-sm h-[30px]">
            <DollarSign size={12} className="text-gray-400" />
            <input 
              type="number" 
              placeholder="Min" 
              value={minPrice} 
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-12 text-[11px] sm:text-xs outline-none text-gray-700 placeholder-gray-400 bg-transparent font-medium"
            />
            <span className="text-gray-300 text-[10px]">-</span>
            <input 
              type="number" 
              placeholder="Max" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-12 text-[11px] sm:text-xs outline-none text-gray-700 placeholder-gray-400 bg-transparent font-medium"
            />
          </div>
        )}

        {/* Clear Filters Button */}
        {hasFilters && (
          <button 
            onClick={clearFilters} 
            className="text-[10px] sm:text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors ml-1"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}