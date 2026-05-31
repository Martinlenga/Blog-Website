import React, { useState, useRef, useEffect } from "react";
import { Search, Filter, X, ChevronDown } from "lucide-react";

// --- Custom Dropdown that ignores native OS UI ---
const CustomDropdown = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* TRIGGER: Fixed height and strict text sizing */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] sm:text-xs font-medium text-gray-600 cursor-pointer flex items-center justify-between gap-2 shadow-sm hover:border-gray-300 transition-all min-w-[100px] max-w-[140px]"
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown size={10} className="text-gray-400 shrink-0" />
      </div>

      {/* MENU: Absolutely positioned to float on top, NOT pushing the layout */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] min-w-[140px] py-1">
          <div
            className="px-3 py-1.5 text-[11px] sm:text-xs text-gray-500 hover:bg-gray-50 cursor-pointer"
            onClick={() => { onChange(""); setIsOpen(false); }}
          >
            {placeholder}
          </div>
          {options.map((opt) => (
            <div
              key={opt}
              className="px-3 py-1.5 text-[11px] sm:text-xs text-gray-800 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer transition-colors"
              onClick={() => { onChange(opt); setIsOpen(false); }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function TableToolbar({ search, setSearch, dateRange, setDateRange, category, setCategory, categories, showPriceFilter = false, minPrice, setMinPrice, maxPrice, setMaxPrice, children }) {
  const hasFilters = dateRange || category || minPrice || maxPrice;
  const clearFilters = () => {
    if (setDateRange) setDateRange("");
    if (setCategory) setCategory("");
    if (setMinPrice) setMinPrice("");
    if (setMaxPrice) setMaxPrice("");
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
        <div className="relative w-full sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-xs sm:text-sm bg-white outline-none focus:border-indigo-500 shadow-sm"
          />
        </div>
        <div className="flex gap-2">{children}</div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">
          <Filter size={10} /> Filters:
        </div>
        
        {setDateRange && (
          <CustomDropdown
            value={dateRange === "7" ? "7 Days" : dateRange === "30" ? "30 Days" : dateRange === "today" ? "Today" : ""}
            onChange={(val) => setDateRange(val === "7 Days" ? "7" : val === "30 Days" ? "30" : val === "Today" ? "today" : "")}
            options={["Today", "7 Days", "30 Days"]}
            placeholder="Any Time"
          />
        )}
        {setCategory && categories && (
          <CustomDropdown
            value={category}
            onChange={setCategory}
            options={categories}
            placeholder="Category"
          />
        )}
        {hasFilters && (
          <button onClick={clearFilters} className="text-[10px] font-bold text-rose-600 px-2 py-1.5">Clear</button>
        )}
      </div>
    </div>
  );
}