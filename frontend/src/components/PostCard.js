import { Link } from "react-router-dom";
import placeholder from "../assets/article-placeholder.jpg";

const API_BASE = "http://127.0.0.1:8000";

const PostCard = ({ post, isFeatured = false }) => {
  const imageUrl = post?.banner_image
    ? `${post.banner_image.startsWith("http") ? post.banner_image : `${API_BASE}${post.banner_image}`}`
    : placeholder;

  const title = post?.title || "Untitled Post";
  const excerpt = post?.excerpt || "No excerpt available";
  const date = post?.published_at
    ? new Date(post.published_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : "Unknown Date";
  const category = post?.category || "General";
  const author = post?.author_name || "Admin";
  const locked = post?.locked ?? false;

  return (
    <div className={`post-card ${isFeatured ? "featured-card" : ""}`}>
      <div className="post-card-inner">
        <img src={imageUrl} alt={title} className={isFeatured ? "post-image featured-image" : "post-image"} />

        <div className="post-content">
          <Link to={`/post/${post.slug}`} className="post-title-link">
            <h3 className="post-title">{title}</h3>
          </Link>

          {locked && <div className="locked-overlay">🔒 Premium</div>}

          <div className="post-meta">
            <span>By: {author}</span>
            <span>Published: {date}</span>
            <span className="category-tag">{category}</span>
            {post.price && <span className="meta-pill">KES {post.price}</span>}
          </div>

          <p className="post-excerpt">{excerpt}</p>
          <Link to={`/post/${post.slug}`} className="read-more">Read →</Link>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
