import { Search, Filter, X } from "lucide-react";

export default function TableToolbar({
  search,
  setSearch,
  dateRange,
  setDateRange,
  category,
  setCategory,
  categories,
  showPriceFilter = false,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  children, // For extra buttons like "Create Post"
}) {
  const hasFilters = dateRange || category || minPrice || maxPrice;

  const clearFilters = () => {
    if (setDateRange) setDateRange("");
    if (setCategory) setCategory("");
    if (setMinPrice) setMinPrice("");
    if (setMaxPrice) setMaxPrice("");
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Top Row: Search & Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full sm:max-w-md group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Action Buttons (Export, Create, etc.) */}
        <div className="flex gap-2">
          {children}
        </div>
      </div>

      {/* Bottom Row: Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500 mr-2">
          <Filter size={16} />
          <span className="font-medium">Filters:</span>
        </div>

        {/* Date Filter */}
        {setDateRange && (
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-indigo-500 hover:border-gray-300 cursor-pointer"
          >
            <option value="">Any Time</option>
            <option value="today">Today</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
        )}

        {/* Category Filter */}
        {setCategory && categories && (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-indigo-500 hover:border-gray-300 cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}

        {/* Price Filters */}
        {showPriceFilter && (
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2 py-1">
            <span className="text-xs text-gray-400 font-bold uppercase">Price</span>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-16 py-1 text-sm outline-none border-b border-transparent focus:border-indigo-500 text-center"
            />
            <span className="text-gray-300">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-16 py-1 text-sm outline-none border-b border-transparent focus:border-indigo-500 text-center"
            />
          </div>
        )}

        {/* Clear Button */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}