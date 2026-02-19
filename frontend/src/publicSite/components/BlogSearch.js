import { FiSearch } from "react-icons/fi";

const BlogSearch = ({ value, onChange }) => {
  return (
    <div className="relative max-w-2xl mx-auto group">
      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
        <FiSearch size={20} />
      </div>
      <input
        type="text"
        placeholder="Search for topics, stories, or keywords..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full pl-14 pr-6 py-4
          rounded-2xl
          bg-gray-50 border border-gray-200
          text-gray-900 text-lg
          placeholder-gray-400
          focus:outline-none focus:bg-white
          focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500
          transition-all duration-300 shadow-inner focus:shadow-lg
        "
      />
    </div>
  );
};

export default BlogSearch;