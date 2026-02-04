import { Link } from "react-router-dom";
import placeholder from "../../assets/article-placeholder.jpg";

const API_BASE = "http://127.0.0.1:8000";

const FeaturedPost = ({ post }) => {
  if (!post) return null;

  const imageUrl = post.banner_image
    ? post.banner_image.startsWith("http")
      ? post.banner_image
      : `${API_BASE}${post.banner_image}`
    : placeholder;

  return (
    <section className="flex flex-col md:flex-row items-stretch gap-8 mb-16 container mx-auto px-4 md:px-8">
      {/* Image */}
      <div className="md:w-1/2 flex-shrink-0 shadow-lg rounded-xl overflow-hidden">
        <img
          src={imageUrl}
          alt={post.title}
          className="w-full h-full min-h-[360px] object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="md:w-1/2 flex flex-col justify-center space-y-4">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          {post.category && (
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium">
              {post.category}
            </span>
          )}
          {post.author_name && <span>By: {post.author_name}</span>}
          {post.reading_time && <span>{post.reading_time}</span>}
          {post.price && (
            <span className="text-gray-700 font-semibold">KES {post.price}</span>
          )}
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          {post.title}
        </h2>

        <p className="mt-4 text-lg text-gray-700 leading-relaxed line-clamp-3">
          {post.meta_description}
        </p>

        <div className="mt-6 flex items-center gap-4">
          <Link
            to={`/post/${post.slug}`}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Read Article
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPost;
