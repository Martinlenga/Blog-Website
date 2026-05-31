import { Link } from "react-router-dom";
import placeholder from "../../assets/article-placeholder.jpg";
import { FiClock, FiArrowRight } from "react-icons/fi"; 


const FeaturedPost = ({ post }) => {
  if (!post) return null;

  const imageUrl = post.banner_image
  ? (post.banner_image.startsWith("http") 
      ? post.banner_image 
      : `${process.env.REACT_APP_API_URL.replace('/api', '')}${post.banner_image.startsWith('/') ? '' : '/'}${post.banner_image}`)
  : placeholder;

  // Robust fallback for category (handles if it's an object or a string)
  const categoryName = post.category 
    ? (typeof post.category === 'object' ? post.category.name : post.category) 
    : "Editorial";

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
      <div className="flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group">
        
        {/* 1. LEFT SIDE: Image (40% width) */}
        {/* Adjusted height to match content naturally */}
        <div className="w-full md:w-[40%] h-56 md:h-auto relative overflow-hidden">
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
        </div>

        {/* 2. RIGHT SIDE: Content (60% width) */}
        {/* Reduced padding for a more compact feel */}
        <div className="w-full md:w-[60%] p-6 md:p-10 flex flex-col justify-center">
          
          {/* Top Labels */}
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded">
              Trending story
            </span>
            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
               <span className="w-4 h-[1px] bg-gray-300"></span> 
               {categoryName}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-2xl md:text-4xl font-bold text-gray-900 leading-tight mb-3 group-hover:text-indigo-700 transition-colors">
            {post.title}
          </h1>

          {/* Meta Info (MOVED UP) */}
          <div className="flex items-center flex-wrap gap-3 text-xs font-semibold text-gray-500 mb-4">
             <div className="flex items-center gap-1 text-gray-600">
               <FiClock className="text-indigo-500" /> {post.reading_time || "5 min"}
             </div>
             <span className="text-gray-300">|</span>
             <div className="text-gray-700">{post.author_name || "JK Team"}</div>
             <span className="text-gray-300">|</span>
             {post.price ? (
               <span className="text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">PREMIUM</span>
             ) : (
               <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100">FREE</span>
             )}
          </div>

          {/* Description (Clamped to 2 lines to save height) */}
          <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-6 line-clamp-2">
            {post.meta_description}
          </p>

          {/* Read Button Only */}
          <div>
            <Link
              to={`/post/${post.slug}`}
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-indigo-600 transition-all shadow hover:shadow-lg hover:-translate-y-0.5"
            >
              Read Article <FiArrowRight />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FeaturedPost;