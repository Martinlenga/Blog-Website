const BlogSearch = ({ value, onChange }) => {
  return (
    <div className="flex justify-center mb-20">
      <input
        type="text"
        placeholder="Search articles, topics, categories..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full max-w-2xl
          px-6 py-4
          rounded-full
          border border-gray-300
          text-gray-900
          placeholder-gray-400
          shadow-sm
          focus:outline-none
          focus:ring-2 focus:ring-indigo-500
          transition
        "
      />
    </div>
  );
};

export default BlogSearch;
