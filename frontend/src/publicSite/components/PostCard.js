import { Link } from "react-router-dom";
import placeholder from "../../assets/article-placeholder.jpg";

// Safely grab the API URL across different bundlers without crashing
const getBaseUrl = () => {
  if (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  try { if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL; } catch (e) {}
  
  // 🚀 FIX 1: The absolute fallback must be your production server, not localhost!
  return "https://api.ithaguru.co.ke/api";
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return placeholder;

  // 🚀 FIX 2: THE DATABASE TRAP INTERCEPTOR
  // Force it to a string and rip out localhost if it was accidentally saved in the database
  let safePath = String(imagePath);
  if (safePath.includes("localhost:8000")) {
    safePath = safePath.replace("http://localhost:8000", "");
  }

  // If it's a valid external HTTP link (like Unsplash) after the cleanup, return it directly
  if (safePath.startsWith("http")) return safePath;

  const apiBase = getBaseUrl().replace(/\/api\/?$/, "");
  const cleanPath = safePath.startsWith("/") ? safePath : `/${safePath}`;
  
  return `${apiBase}${cleanPath}`;
};

const PostCard = ({ post }) => {
  if (!post) return null;
  
  const imageUrl = getImageUrl(post.banner_image);
  

  return (
    // 🚀 UX FIX: The entire card is now the Link, making it fully clickable.
    <Link 
      to={`/post/${post.slug}`}
      className="relative group h-[280px] rounded-xl overflow-hidden bg-gray-900 border border-gray-200 shadow-sm hover:shadow-lg hover:border-indigo-400 transition-all duration-500 block"
    >
      
      {/* Image with subtle premium zoom effect on hover */}
      <img
        src={imageUrl}
        alt={post.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Dark gradient overlay to ensure white text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* 🚀 MOBILE UX FIX: Instead of hiding everything, we leave the title visible.
        The box sits partially down, and slides fully up on hover to reveal the rest.
      */}
      <div className="absolute bottom-0 w-full p-4 bg-white/95 backdrop-blur-md rounded-t-xl translate-y-[calc(100%-4rem)] group-hover:translate-y-0 transition-transform duration-400 ease-out shadow-t-lg">
        
        {/* Title (Always visible) */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 h-8">
          {post.title}
        </h3>

        {/* --- Hidden Content that slides up --- */}
        <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
          
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500 mb-1.5">
            {post.category && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-bold tracking-wide uppercase">
                {post.category}
              </span>
            )}
            {post.author_name && <span>By: {post.author_name}</span>}
          </div>

          {/* Meta Description */}
          <p className="text-xs text-gray-600 line-clamp-2 mt-1.5 leading-relaxed">
            {post.meta_description || "Read this exclusive publication inside."}
          </p>

          {/* Price & Button */}
          <div className="flex items-center justify-between mt-3 text-xs border-t border-gray-100 pt-3">
            <div className="flex items-center gap-3 text-indigo-600 font-bold">
              {Number(post.price) > 0 ? (
                <span>KES {Number(post.price).toLocaleString()}</span>
              ) : (
                <span className="text-emerald-600">Free</span>
              )}
              {post.reading_time && <span className="text-gray-400 font-medium">{post.reading_time}</span>}
            </div>

            {/* Replaced <Link> with <span> to prevent HTML nesting errors */}
            <span className="text-[10px] font-bold text-white bg-indigo-600 px-3.5 py-1.5 rounded-lg group-hover:bg-indigo-700 transition-colors shadow-sm">
              Read
            </span>
          </div>
          
        </div>
      </div>
    </Link>
  );
};

export default PostCard;