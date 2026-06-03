import { Link } from "react-router-dom";
import placeholder from "../../assets/article-placeholder.jpg";
import { FiClock, FiUser, FiCalendar } from "react-icons/fi";

// 🚀 CRASH FIX: Safely grab the API URL without crashing if process.env is undefined
// 🚀 BULLETPROOF IMAGE URL HANDLER
const getImageUrl = (imagePath) => {
  if (!imagePath) return placeholder;
  if (imagePath.startsWith("http")) return imagePath;

  // 1. Force a string fallback so .replace() NEVER crashes
  const rawApiUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";
  
  // 2. Strip out /api if it exists
  const apiBase = rawApiUrl.replace(/\/api\/?$/, "");
  
  // 3. Ensure clean slash separation
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  
  return `${apiBase}${cleanPath}`;
};


const LatestPreview = ({ posts }) => {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      
      {/* 🔹 HEADER */}
      <div className="flex items-end justify-between mb-8 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
              Discover
            </span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 leading-none tracking-tight">
            Latest Articles
          </h2>
        </div>
      </div>

      {/* THE GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {posts.map((post) => {
          
          const imageUrl = getImageUrl(post.banner_image);
          const categoryName = post.category 
            ? (typeof post.category === 'object' ? post.category.name : post.category) 
            : "Editorial";

          const priceValue = parseFloat(post.price || 0);
          const isFree = isNaN(priceValue) || priceValue <= 0;

          return (
            <Link 
              to={`/post/${post.slug}`} 
              key={post.id} 
              // 🚀 DESIGN FIX: Reduced height from 420px to a sleek 360px (320px on mobile)
              className="group relative block h-80 sm:h-[360px] w-full rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
            >
              
              {/* 1. BACKGROUND IMAGE */}
              <div className="absolute inset-0 bg-gray-900">
                <img
                  src={imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90"
                />
              </div>

              {/* 2. THE CURTAIN (Dark Gradient) */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-80 group-hover:via-gray-900/80 transition-all duration-500" />

              {/* 3. TOP TAGS (Category & Price) */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
                <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded shadow-sm">
                  {categoryName}
                </span>
                
                {!isFree && (
                  <span className="bg-white text-gray-900 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded shadow-lg">
                    KES {priceValue.toLocaleString()}
                  </span>
                )}
              </div>

              {/* 4. CONTENT CONTAINER */}
<div className="absolute inset-x-0 bottom-0 p-6 z-30">

  {/* Inner wrapper controls animation */}
  <div className="transform transition-all duration-500 translate-y-6 group-hover:translate-y-0">

    {/* TITLE + BADGE */}
    <div className="mb-3">

      <div className="inline-flex items-center gap-1.5 bg-black/60 text-white px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest mb-3">
        <FiClock className="text-indigo-400" />
        {post.reading_time || "5 Min"}
      </div>

      <h3 className="font-serif text-2xl font-bold text-white leading-snug line-clamp-2">
        {post.title}
      </h3>
    </div>

    {/* HIDDEN CONTENT */}
    <div
      className="
        max-h-0 opacity-0 overflow-hidden
        group-hover:max-h-[180px] group-hover:opacity-100
        transition-all duration-500 ease-in-out
        flex flex-col gap-3
      "
    >

      <div className="w-10 h-1 bg-indigo-500 rounded-full"></div>

      <p className="text-gray-300 text-sm line-clamp-2">
        {post.content_preview}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-white/10">

        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-gray-300 text-[10px] font-bold uppercase">
            <FiUser className="text-indigo-400" />
            {post.author_name || "JK Team"}
          </div>

          <div className="flex items-center gap-1 text-gray-400 text-[10px]">
            <FiCalendar />
            {post.published_at || "Recent"}
          </div>
        </div>

        <span className="text-white text-[10px] font-extrabold uppercase bg-indigo-600 px-3 py-1.5 rounded hover:bg-indigo-500 transition-colors">
          Read →
        </span>

      </div>

    </div>

  </div>
</div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default LatestPreview;