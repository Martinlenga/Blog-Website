import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPostBySlug } from "../services/api";
import MpesaModal from "../components/MpesaModal";
import useFacebookSDK from "../hooks/useFacebookSDK";
import { Helmet } from "react-helmet";

const PostDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [paid, setPaid] = useState(false);
  const [phone, setPhone] = useState("");
  const [showPayModal, setShowPayModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useFacebookSDK();

  // Load saved phone
  useEffect(() => {
    const saved = localStorage.getItem(`paid-${slug}`);
    if (saved) setPhone(saved);
  }, [slug]);

  // Fetch post
  useEffect(() => {
    setLoading(true);
    getPostBySlug(slug, phone)
      .then((data) => {
        setPost(data);
        // ← Keep old working locked check
        setPaid(data?.locked === false);
      })
      .finally(() => setLoading(false));
  }, [slug, phone]);

  // Polling to check payment
  useEffect(() => {
    if (!phone || paid) return;

    const interval = setInterval(async () => {
      const data = await getPostBySlug(slug, phone);
      if (data.locked === false) {
        clearInterval(interval);
        setPaid(true);
        setPost(data);
        localStorage.setItem(`paid-${slug}`, phone);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [slug, phone, paid]);

  // Force FB SDK to re-render likes/comments
  useEffect(() => {
    if (window.FB) window.FB.XFBML.parse();
  }, [post, paid]);

  if (loading)
    return <p style={{ textAlign: "center", marginTop: 40 }}>Loading…</p>;
  if (!post) return <p style={{ textAlign: "center", marginTop: 40 }}>Post not found</p>;

  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Unknown";

  return (
    <div className="container post-detail">
      {/* Helmet meta tags */}
      <Helmet>
        <title>{post.title} | My Blog</title>
        <meta name="description" content={post.excerpt || post.content.slice(0, 150)} />
        {post.banner_image && <meta property="og:image" content={post.banner_image.startsWith("http") ? post.banner_image : `http://127.0.0.1:8000${post.banner_image}`} />}
      </Helmet>

      {/* Title */}
      <h1 className="post-detail-title">{post.title}</h1>

      {/* Meta */}
      <div className="post-detail-meta">
        <span className="meta-pill">Author: {post.author_name || "Anonymous"}</span>
        <span className="meta-pill">Category: {post.category || "General"}</span>
        <span className="meta-pill">Published: {publishedDate}</span>
        <span className="meta-pill">Price: KES {post.price}</span>
      </div>

      {/* Content */}
      <div style={{ position: "relative" }}>
        <div className={`post-detail-content ${paid ? "full-content" : "blurred-content"}`}>
          {post.content}
        </div>

        {!paid && (
          <div className="pay-overlay">
            <h3>🔒 Premium Content</h3>
            <p>Unlock the full article</p>
            <p className="price">KES {post.price}</p>
            <button className="btn" onClick={() => setShowPayModal(true)}>Unlock Article</button>
          </div>
        )}
      </div>

      {/* Reactions & Comments */}
      {paid && (
        <>
          <div className="post-reactions">
            <div className="fb-like" data-href={window.location.href} data-layout="standard" data-action="like" data-size="small" data-share="true"></div>
          </div>
          <div className="post-comments">
            <h3 className="comments-title">Join the Conversation</h3>
            <div
              className="fb-comments"
              data-href={`https://myblog.com/post/${post.slug}`} // must be public
              data-width="100%"
              data-numposts="5"
            />
          </div>
        </>
      )}

      {/* Payment Modal */}
      {showPayModal && (
        <MpesaModal
          post={post}
          onClose={() => setShowPayModal(false)}
          onPaid={(p) => {
            setPhone(p);
            setShowPayModal(false);
          }}
        />
      )}
    </div>
  );
};

export default PostDetail;
