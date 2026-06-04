import { Link } from "react-router-dom";
import placeholder from "../../assets/article-placeholder.jpg";
import { FiClock, FiArrowRight, FiCalendar } from "react-icons/fi"; 

// 🚀 THE ULTIMATE BULLETPROOF IMAGE HANDLER
const getImageUrl = (imagePath) => {
  if (!imagePath) return placeholder; // Make sure 'placeholder' is imported in your files

  // 1. Get the base URL (Safely falling back to your ACTUAL production URL, not localhost)
  const rawApiUrl = process.env.REACT_APP_API_URL || "https://api.ithaguru.co.ke/api";
  const apiBase = rawApiUrl.replace(/\/api\/?$/, "");

  // 2. 🚀 THE DATABASE FIX: Intercept and destroy accidental localhost links
  let safePath = String(imagePath);
  if (safePath.includes("localhost:8000")) {
    safePath = safePath.replace("http://localhost:8000", "");
  }

  // 3. If it's a valid, external HTTP link (like AWS S3, Unsplash, etc.), let it pass
  if (safePath.startsWith("http")) return safePath;

  // 4. Clean the path and combine it with the production API base
  const cleanPath = safePath.startsWith("/") ? safePath : `/${safePath}`;
  
  return `${apiBase}${cleanPath}`;
};

// 🚀 UX FIX: Format raw database strings into clean editorial dates
const formatDate = (dateString) => {
  if (!dateString) return "Recently Published";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const FeaturedPost = ({ post }) => {
  if (!post) return null;

  const imageUrl = getImageUrl(post.banner_image);
  const categoryName = post.category 
    ? (typeof post.category === 'object' ? post.category.name : post.category) 
    : "Featured Read";

  const priceValue = parseFloat(post.price || 0);
  const isFree = isNaN(priceValue) || priceValue <= 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      
      {/* 🚀 HTML FIX: The entire container is now a <Link>. 
          This is much better for mobile tap targets. */}
      <Link 
        to={`/post/${post.slug}`}
        className="flex flex-col lg:flex-row bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-xl transition-all duration-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
      >
        
        {/* 1. LEFT SIDE: Image (Pulled back to 42% width, max 380px tall) */}
        <div className="w-full lg:w-[42%] h-60 sm:h-72 lg:h-[380px] relative overflow-hidden bg-gray-50 shrink-0">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent z-10 pointer-events-none transition-opacity duration-500 group-hover:opacity-0" />
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          />
        </div>

        {/* 2. RIGHT SIDE: Content (Expanded to 58% width, balanced padding) */}
        <div className="w-full lg:w-[58%] p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative bg-white z-20">
          
          <div>
            {/* Top Labels */}
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2.5 py-1 bg-indigo-600 text-white text-[9px] font-extrabold uppercase tracking-widest rounded shadow-sm">
                Cover Story
              </span>
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                 <span className="w-4 h-[1px] bg-indigo-200"></span> 
                 {categoryName}
              </span>
            </div>

            {/* Title (Span instead of Link to prevent HTML nesting errors) */}
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-[1.15] mb-4 group-hover:text-indigo-600 transition-colors">
              {post.title}
            </h2>

            {/* Meta Info */}
            <div className="flex items-center flex-wrap gap-3 text-xs font-medium text-gray-400 mb-5">
               <div className="flex items-center gap-1.5 text-gray-500">
                 <FiCalendar className="text-gray-400" /> {formatDate(post.published_at || post.created_at)}
               </div>
               <span className="text-gray-200">|</span>
               <div className="flex items-center gap-1.5 text-gray-500">
                 <FiClock className="text-gray-400" /> {post.reading_time || "5 min read"}
               </div>
               {post.author_name && (
                 <>
                   <span className="text-gray-200 hidden sm:inline">|</span>
                   <div className="text-gray-600 capitalize hidden sm:block">By {post.author_name}</div>
                 </>
               )}
            </div>

            {/* Excerpt */}
            <p className="text-gray-600 text-sm lg:text-base leading-relaxed mb-6 line-clamp-3">
              {post.content_preview || post.meta_description}
            </p>
          </div>

          {/* Footer Action Row */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
            
            {/* Fake Button (Span) to keep valid HTML inside the parent Link wrapper */}
            <span className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm group-hover:bg-indigo-600 transition-all shadow-sm">
              Read Story <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </span>

            {/* Price Badge */}
            {!isFree ? (
              <div className="text-right">
                <span className="block text-[8px] uppercase font-bold tracking-widest text-gray-400 mb-0.5">Premium</span>
                <span className="text-base sm:text-lg font-serif font-extrabold text-gray-900">
                  KES {priceValue.toLocaleString()}
                </span>
              </div>
            ) : (
              <span className="text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 font-bold text-[10px] uppercase tracking-wider">
                Free Access
              </span>
            )}
          </div>

        </div>
      </Link>
    </div>
  );
};

export default FeaturedPost;