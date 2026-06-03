import { Link } from "react-router-dom";
import PostCard from "./PostCard"; 
import { FiArrowRight } from "react-icons/fi";

const CategoryRow = ({ title, articles, linkTo }) => {
  // 🔹 Terminology sweep: 'posts' is now 'articles'
  if (!articles || articles.length === 0) return null;

  return (
    <section className="mb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* SECTION HEADER: High-end editorial style */}
      <div className="flex items-end justify-between mb-8 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
              Curated Series
            </span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 leading-none tracking-tight">
            {title}
          </h2>
        </div>

        {/* Optional "View All" Link for Desktop */}
        {linkTo && (
          <Link
            to={linkTo}
            aria-label={`View all articles in ${title}`} // 🚀 A11Y FIX: Screen reader context
            className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors group"
          >
            View all <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* ARTICLE GRID: Breathable, 3-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
        {articles.map((article) => (
          <PostCard key={article.id} article={article} />
        ))}
      </div>

      {/* Mobile "View All" Button (Fallback) */}
      {linkTo && (
        <div className="mt-8 sm:hidden">
          <Link
            to={linkTo}
            className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 transition-colors"
          >
            Explore {title} <FiArrowRight />
          </Link>
        </div>
      )}
    </section>
  );
};

export default CategoryRow;