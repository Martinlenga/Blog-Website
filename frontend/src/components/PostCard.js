import { Link } from "react-router-dom";
import placeholder from "../assets/article-placeholder.jpg";

const PostCard = ({ post, isFeatured }) => {
  const imageUrl = post?.banner_image || placeholder;
  const title = post?.title || "Untitled Post";
  const excerpt = post?.content ? post.content.slice(0, 120) + "..." : "No excerpt available";
  const date = post?.created_at ? new Date(post.created_at).toLocaleDateString() : "Unknown Date";
  const category = post?.category || "Uncategorized";
  const author = post?.author || "Admin";

  return (
    <div className={`post-card ${isFeatured ? "featured-card" : ""}`}>
      <div className="post-card-inner">
        <img src={imageUrl} alt={title} className={isFeatured ? "post-image featured-image" : "post-image"} />

        <div className="post-content">
            <Link to={`/post/${post.slug}`} className="post-title-link">
                <h3 className="post-title">{title}</h3>
            </Link>

            <div className="post-meta">
                <span>{author}</span>
                <span>{date}</span>
                <span className="category-tag">{category}</span>
            </div>

            <p className="post-excerpt">{excerpt}</p>

            <Link to={`/post/${post.slug}`} className="read-more">
                Read →
            </Link>

        </div>
      </div>
    </div>
  );
};

export default PostCard;
