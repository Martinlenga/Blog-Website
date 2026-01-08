import { Link } from "react-router-dom";
import placeholderImg from '../assets/article-placeholder.jpg';


const PostCard = ({ post, isFeatured = false }) => {
  return (
    <div className={`post-card ${isFeatured ? "featured-card" : ""}`}>
        <div className="post-card-inner">
            <img
                src={post.banner_image || placeholderImg}
                alt={post.title}
                className="post-image"
            />
            <div className="post-content">
                <div className="post-header">
                <h2 className="post-title">
                    <Link to={`/posts/${post.id}`}>{post.title}</Link>
                </h2>
                <div className="post-meta">
                    <span>By {post.author}</span>
                    <span>· {new Date(post.created_at).toLocaleDateString()}</span>
                    {post.category && <span className="category-tag">{post.category}</span>}
                </div>
                </div>
                <p className="post-excerpt">{post.content.slice(0, 120)}...</p>
            </div>
        </div>

    </div>
  );
};

export default PostCard;
