import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPostBySlug } from "../services/api";
import useFacebookSDK from "../hooks/useFacebookSDK";

const PostDetail = () => {
  const { slug } = useParams(); 
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true); // track loading
  const [error, setError] = useState(false);    // track errors
  const [paid, setPaid] = useState(false);      // track if user has paid

  useFacebookSDK();

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(false);

    getPostBySlug(slug)
      .then((data) => {
        if (data) {
          setPost(data);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  // Re-parse FB comments/likes whenever post changes
  useEffect(() => {
    if (window.FB) window.FB.XFBML.parse();
  }, [post]);

  if (loading) return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading…</p>;
  if (error || !post) return <p style={{ textAlign: "center", marginTop: "50px" }}>Post not found.</p>;

  const handlePayment = () => {
    // Integrate payment system here
    setPaid(true); // simulate payment success
  };

  return (
    <div className="container post-detail">
      <h1 className="post-detail-title">{post.title}</h1>

      <div className="post-detail-meta">
        <span>By {post.author}</span>
        <span>{new Date(post.created_at).toLocaleDateString()}</span>
        <span className="category-tag">{post.category}</span>
      </div>

      <div className={`post-detail-content ${!paid ? "blurred" : ""}`}>
        {post.content}
      </div>

      {!paid && (
        <div className="pay-overlay">
          <p>🔒 This content is locked. Please pay to unlock full article.</p>
          <button className="btn" onClick={handlePayment}>Unlock Article</button>
        </div>
      )}

      <hr className="post-divider" />

      <div className="post-reactions">
        <div
          className="fb-like"
          data-href={`https://example.com/post/${post.slug}`}
          data-width=""
          data-layout="standard"
          data-action="like"
          data-size="small"
          data-share="true"
        ></div>
      </div>

      <div className="post-comments">
        <h3 className="comments-title">Join the conversation</h3>
        <div
          className="fb-comments"
          data-href={`https://example.com/post/${post.slug}`}
          data-width="100%"
          data-numposts="5"
        ></div>
      </div>
    </div>
  );
};

export default PostDetail;
