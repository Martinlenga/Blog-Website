import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPostBySlug } from "../services/api";
import MpesaModal from "../components/MpesaModal";
import { useAuth } from "../../auth/PublicAuthContext";
import "./PostDetail.css";

const PostDetail = () => {
  const { slug } = useParams();
  const { jwt, isLoggedIn, login } = useAuth();

  const [post, setPost] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [googleReady, setGoogleReady] = useState(false);

  // Load post
  useEffect(() => {
    setLoading(true);
    getPostBySlug(slug, jwt)
      .then((data) => {
        setPost(data);
        setIsUnlocked(!data.locked);
      })
      .finally(() => setLoading(false));
  }, [slug, jwt]);

  // Load Google Identity Services script
  useEffect(() => {
    if (isLoggedIn) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
        });
        console.log(window.location.origin); 
        console.log(process.env.REACT_APP_GOOGLE_CLIENT_ID)
        setGoogleReady(true);

        // Immediately show account chooser popup
        window.google.accounts.id.prompt();
      }
    };

    return () => document.body.removeChild(script);
  }, [isLoggedIn]);

  // Called after Google login
  const handleGoogleCredentialResponse = async (response) => {
    try {
      const idToken = response.credential;
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/google-login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      });
      const data = await res.json();
      login(data.jwt, data.user);
      alert("Logged in successfully!");
    } catch (err) {
      console.error("Google login failed:", err);
      alert("Google login failed. Try again.");
    }
  };

  // Unlock handler
  const handleUnlock = () => {
    if (!isLoggedIn) {
      alert("Please log in first with Google.");
      return;
    }
    setShowPayModal(true);
  };

  if (loading)
    return <p className="text-center mt-32 text-gray-500 text-lg">Loading…</p>;
  if (!post)
    return <p className="text-center mt-32 text-red-500 text-lg">Post not found</p>;

  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Unknown";

  return (
    <main className="post-wrapper">
      <header className="post-header">
        <h1 className="post-title">{post.title}</h1>
        <div className="post-meta">
          <span className="meta-author">By: {post.author_name}</span>
          <span className="meta-category">{post.category || "General"}</span>
          <span className="meta-date">{publishedDate}</span>
          <span className="meta-price">KES {post.price}</span>
        </div>
      </header>

      <section className={`post-content ${!isUnlocked ? "locked" : ""}`}>
        <article
          className="content-body"
          dangerouslySetInnerHTML={{
            __html: isUnlocked ? post.content : post.content_preview,
          }}
        />

        {!isUnlocked && (
          <div className="paywall-overlay">
            <div className="paywall-card">
              <span className="unlock-icon">🔒</span>
              <p className="pay-text">Premium Access</p>
              <p className="pay-price">KES {post.price}</p>
              <button className="unlock-btn" onClick={handleUnlock}>
                Unlock
              </button>
            </div>
          </div>
        )}
      </section>

      {showPayModal && (
        <MpesaModal
          post={post}
          jwt={jwt}
          onClose={() => setShowPayModal(false)}
          onPaid={() => setIsUnlocked(true)}
        />
      )}
    </main>
  );
};

export default PostDetail;
