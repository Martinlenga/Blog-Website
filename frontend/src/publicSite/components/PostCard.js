import { Link } from "react-router-dom";
import placeholder from "../../assets/article-placeholder.jpg";

const API_BASE = "http://127.0.0.1:8000";

const PostCard = ({ post }) => {
  console.log("data:", post)
  const imageUrl = post.banner_image
    ? post.banner_image.startsWith("http")
      ? post.banner_image
      : `${API_BASE}${post.banner_image}`
    : placeholder;

  return (
    <div className="relative group h-[280px] rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:border-indigo-400 transition-all duration-300 cursor-pointer">
      
      {/* Image */}
      <img
        src={imageUrl}
        alt={post.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Info box sliding up */}
      <div className="absolute bottom-0 w-full p-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-t-xl translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        
        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500 mb-1">
          {post.category && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">
              {post.category}
            </span>
          )}
          {post.author_name && <span>By {post.author_name}</span>}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
          {post.title}
        </h3>

        {/* Meta Description */}
        <p className="text-xs text-gray-600 line-clamp-2 mt-1">{post.meta_description}</p>

        {/* Price & Button */}
        <div className="flex items-center justify-between mt-2 text-xs">
          <div className="flex items-center gap-3 text-indigo-600 font-semibold">
            {post.price && <span>KES {post.price}</span>}
            {post.reading_time && <span className="text-gray-500 font-normal">{post.reading_time}</span>}
          </div>

          <Link
            to={`/post/${post.slug}`}
            className="text-[10px] font-medium text-white bg-indigo-600 px-3 py-1.5 rounded hover:bg-indigo-700 transition-colors"
          >
            Read
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
