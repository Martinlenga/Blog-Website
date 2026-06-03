import { Link } from "react-router-dom";
import placeholder from "../../assets/article-placeholder.jpg";
import { FiClock, FiChevronRight, FiUserCheck, FiCalendar } from "react-icons/fi";
import { useAuth } from "../../auth/PublicAuthContext";

const getImageUrl = (imagePath) => {
  if (!imagePath) return placeholder;
  if (imagePath.startsWith("http")) return imagePath;

  const apiBase = process.env.REACT_APP_API_URL?.replace(/\/api\/?$/, "") || "";
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  
  return `${apiBase}${cleanPath}`;
};

const ArticleRow = ({ post }) => {
  const { user } = useAuth();

  const imageUrl = getImageUrl(post.banner_image);

  const categoryName = post.category 
    ? (typeof post.category === 'object' ? post.category.name : post.category) 
    : "Editorial";

  // Check if current user matches author name
  const isAuthor = user && user.name === post.author_name;
  
  // Safely parse the price string from the backend ("0.00" -> 0)
  const priceValue = parseFloat(post.price || 0);
  const isFree = isNaN(priceValue) || priceValue <= 0;

  return (
    <article className="group flex flex-col md:flex-row gap-6 md:gap-8 py-10 border-b border-gray-100 last:border-0 items-start">
      
      {/* IMAGE CONTAINER */}
      <Link 
        to={`/post/${post.slug}`} 
        className="w-full md:w-72 h-56 md:h-48 flex-shrink-0 rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-200 relative transition-all duration-300 bg-gray-50"
      >
        <img
          src={imageUrl}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </Link>

      {/* CONTENT SIDE */}
      <div className="flex-1 flex flex-col h-full justify-center w-full">
        
        {/* Header Tags (Now includes Published Date) */}
        <div className="flex flex-wrap items-center gap-3 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-3">
            <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              {categoryName}
            </span>
            
            <span className="text-gray-400 flex items-center gap-1.5">
               <FiCalendar className="text-gray-300"/> {post.published_at || "Recent"}
            </span>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <span className="text-gray-400 flex items-center gap-1.5">
               <FiClock className="text-gray-300"/> {post.reading_time || "5 min read"}
            </span>
        </div>

        {/* Title */}
        <h3 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 leading-snug mb-3 group-hover:text-indigo-600 transition-colors">
          <Link to={`/post/${post.slug}`}>
            {post.title}
          </Link>
        </h3>

        {/* Excerpt (FIXED: mapped to content_preview) */}
        <p className="text-gray-500 text-base leading-relaxed line-clamp-2 mb-5 max-w-2xl">
          {post.content_preview}
        </p>

        {/* Footer Info Row */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 md:border-none md:pt-0">
           
           {/* AUTHOR SECTION */}
           <div className="flex items-center gap-2">
             <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">By:</span>
             <span className="text-sm font-bold text-gray-900 capitalize">
               {post.author_name || "Guest Contributor"}
             </span>
             {isAuthor && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider ml-1">
                   <FiUserCheck /> You
                </span>
             )}
           </div>

           {/* PRICE & ACTION (FIXED logic) */}
           <div className="flex items-center gap-4">
             {!isFree ? (
                <span className="text-gray-900 font-bold text-xs bg-gray-100 px-2.5 py-1 rounded border border-gray-200">
                  KES {priceValue.toLocaleString()}
                </span>
             ) : (
                <span className="text-emerald-700 font-bold text-[10px] uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  Free Access
                </span>
             )}

             <Link
               to={`/post/${post.slug}`}
               className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:gap-2 transition-all"
             >
               Read <FiChevronRight />
             </Link>
           </div>
        </div>
      </div>
    </article>
  );
};

export default ArticleRow;