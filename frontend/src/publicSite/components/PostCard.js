import { Link } from "react-router-dom";
import placeholder from "../../assets/article-placeholder.jpg";

const API_BASE = "http://127.0.0.1:8000";

const PostCard = ({ post }) => {
  const imageUrl = post.banner_image
    ? post.banner_image.startsWith("http")
      ? post.banner_image
      : `${API_BASE}${post.banner_image}`
    : placeholder;

  return (
    <div className="relative group h-[360px] rounded-xl overflow-hidden bg-white border border-gray-200 hover:border-indigo-400 transition-all">
      
      {/* Image */}
      <img
        src={imageUrl}
        alt={post.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Info box sliding from bottom */}
      <div className="absolute bottom-0 w-full p-4 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        
        {/* Meta info (top) */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 mb-1">
          {post.category && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">
              {post.category}
            </span>
          )}
          {post.author_name && <span>By: {post.author_name}</span>}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-xs text-gray-600 line-clamp-3 mt-1">{post.excerpt}</p>

        {/* Price, reading time & button */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            {post.price && (
              <span className="text-indigo-600 font-semibold">
                KES {post.price}
              </span>
            )}
            {post.reading_time && <span>{post.reading_time}</span>}
          </div>

          <Link
            to={`/post/${post.slug}`}
            className="text-xs font-medium text-white bg-indigo-600 px-3 py-1.5 rounded hover:bg-indigo-700"
          >
            Read Article
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
