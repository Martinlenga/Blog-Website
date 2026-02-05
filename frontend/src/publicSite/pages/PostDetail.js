import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getPostBySlug, unlockPost } from "../services/api";
import { useAuth } from "../../auth/PublicAuthContext";
import useFacebookSDK from "../hooks/useFacebookSDK";
import MpesaModal from "../components/MpesaModal";
import "./PostDetail.css";

const PostDetail = () => {
  const { slug } = useParams();
  const { isLoggedIn, user } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // MPESA MODAL STATE (NEW)
  const [showMpesa, setShowMpesa] = useState(false);

  // FB SDK hook
  const fbLoaded = useFacebookSDK();

  const fetchPost = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPostBySlug(slug);
      setPost(data);
    } catch {
      setError("Failed to load article.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleGooglePrompt = () => {
    if (!window.google?.accounts?.id) return;
    window.google.accounts.id.prompt();
  };

  // EXISTING UNLOCK LOGIC (UNCHANGED)
  const handleUnlock = async () => {
    try {
      setLoading(true);
      const unlocked = await unlockPost(slug);
      setPost(unlocked);

      if (fbLoaded && window.FB) {
        window.FB.XFBML.parse();
      }
    } catch {
      setError("Failed to unlock post.");
    } finally {
      setLoading(false);
    }
  };

  const isUnlocked = post && !post.locked;
  const postUrl = `https://echoingly-uningrafted-deborah.ngrok-free.dev/posts/${slug}`;

  useEffect(() => {
    if (isUnlocked && fbLoaded && window.FB) {
      window.FB.XFBML.parse();
    }
  }, [isUnlocked, fbLoaded]);

  if (loading) return <p className="text-center mt-32">Loading…</p>;
  if (error) return <p className="text-center mt-32 text-red-500">{error}</p>;
  if (!post) return <p className="text-center mt-32">Post not found</p>;

  return (
    <main className="post-wrapper">
      {/* Signed-in banner */}
      {isLoggedIn && user?.email && (
        <div className="auth-banner">
          Signed in as <strong>{user.email}</strong>
        </div>
      )}

      {/* Header */}
      <header className="post-header">
        <h1>{post.title}</h1>
        <div className="post-meta">
          <span>By {post.author_name}</span>
          <span>{post.category}</span>
          {post.price > 0 && <span className="meta-price">KES {post.price}</span>}
          {isUnlocked && <span className="badge unlocked">Already unlocked</span>}
        </div>
      </header>

      {/* Content */}
      <section className={`post-content ${!isUnlocked ? "locked" : ""}`}>
        <article
          className={`content-body ${!isUnlocked ? "blurred" : ""}`}
          dangerouslySetInnerHTML={{
            __html: isUnlocked ? post.content : post.content_preview,
          }}
        />

        {/* PAYWALL */}
        {!isUnlocked && (
          <div className="paywall-overlay">
            <div className="paywall-content">
              {!isLoggedIn && (
                <>
                  <p className="paywall-text-above">
                    Sign in to read full article
                  </p>
                  <button className="google-btn" onClick={handleGooglePrompt}>
                    Continue with Google
                  </button>
                </>
              )}

              {isLoggedIn && (
                <button
                  className="unlock-btn"
                  onClick={() => setShowMpesa(true)}
                >
                  Unlock Post
                </button>
              )}
            </div>
          </div>
        )}

        {/* COMMENTS + SHARING */}
        {isUnlocked && (
          <div className="facebook-section">
            <p className="fb-guide-text">Join the Conversation</p>

            <div
              className="fb-comments"
              data-href={postUrl}
              data-width="100%"
              data-numposts="5"
            ></div>

            <div className="share-section">
              <span className="share-guide">Share this article using:</span>
              <div className="share-icons">
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                    postUrl
                  )}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-icon twitter"
                >
                  <i className="fab fa-twitter"></i>
                </a>

                <a
                  href={`https://www.linkedin.com/shareArticle?url=${encodeURIComponent(
                    postUrl
                  )}&title=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-icon linkedin"
                >
                  <i className="fab fa-linkedin-in"></i>
                </a>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    post.title + " " + postUrl
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-icon whatsapp"
                >
                  <i className="fab fa-whatsapp"></i>
                </a>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* MPESA MODAL (NEW, CLEAN) */}
      {showMpesa && (
        <MpesaModal
          post={post}
          onClose={() => setShowMpesa(false)}
          onPaid={() => {
            setShowMpesa(false);   // 👈 CLOSE FIRST
            handleUnlock();       // 👈 THEN unlock
          }}
        />

      )}
    </main>
  );
};

export default PostDetail;
