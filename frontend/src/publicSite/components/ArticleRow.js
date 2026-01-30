import { Link } from "react-router-dom";
import placeholder from "../../assets/article-placeholder.jpg";

const API_BASE = "http://127.0.0.1:8000";

const ArticleRow = ({ post }) => {
  const imageUrl = post.banner_image
    ? post.banner_image.startsWith("http")
      ? post.banner_image
      : `${API_BASE}${post.banner_image}`
    : placeholder;

  return (
    <article className="flex gap-6 py-6 border-b last:border-b-0 items-start">
      {/* Image */}
      <div className="w-40 h-28 flex-shrink-0 rounded-lg overflow-hidden">
        <img
          src={imageUrl}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs mb-1">
          {post.category && (
            <span className="uppercase tracking-wide text-indigo-600 font-semibold">
              {post.category}
            </span>
          )}
          {post.author_name && (
            <span className="text-gray-500">By: {post.author_name}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 leading-snug">
          <Link to={`/post/${post.slug}`} className="hover:no-underline">
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 mt-1 line-clamp-2 text-sm">
          {post.excerpt}
        </p>

        {/* Footer: reading time, price & link */}
        <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
          <span>{post.reading_time}</span>
          <div className="flex items-center gap-4">
            {post.price && (
              <span className="text-gray-700 font-semibold">
                KES {post.price}
              </span>
            )}
            <Link
              to={`/post/${post.slug}`}
              className="text-indigo-600 font-medium hover:underline"
            >
              Read Article
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ArticleRow;
