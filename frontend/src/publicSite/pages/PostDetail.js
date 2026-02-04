import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  getPostBySlug,
  unlockPost,
  initiatePayment,
  pollPostUnlock,
} from "../services/api";
import { useAuth } from "../../auth/PublicAuthContext";
import GoogleLoginButton from "../../auth/GoogleLoginButton";
import "./PostDetail.css";

const PostDetail = () => {
  const { slug } = useParams();
  const { isLoggedIn, user } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  /* ---------------- Fetch post ---------------- */
  const fetchPost = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getPostBySlug(slug);
      setPost(data);
    } catch (err) {
      setError("Failed to load article.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  /* ---------------- Unlock ---------------- */
  const handleUnlock = async () => {
    try {
      setLoading(true);
      const unlocked = await unlockPost(slug);
      setPost(unlocked);
    } catch {
      setError("Failed to unlock post.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Payment ---------------- */
  const handlePayment = async () => {
    const phone = prompt("Enter your MPESA phone number:");
    if (!phone) return;

    try {
      setPaymentLoading(true);
      await initiatePayment(slug, phone);
      const unlocked = await pollPostUnlock(slug, 30000);
      setPost(unlocked);
    } catch (err) {
      setError(err.message || "Payment failed.");
    } finally {
      setPaymentLoading(false);
    }
  };

  /* ---------------- Guards ---------------- */
  if (loading) return <p className="text-center mt-32">Loading…</p>;
  if (error) return <p className="text-center mt-32 text-red-500">{error}</p>;
  if (!post) return <p className="text-center mt-32">Post not found</p>;

  const isUnlocked = !post.locked;

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

          {isUnlocked ? (
            <span className="badge unlocked">Already unlocked</span>
          ) : (
            post.price > 0 && (
              <span className="meta-price">KES {post.price}</span>
            )
          )}
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

        {/* Paywall */}
        {!isUnlocked && (
          <div className="paywall-overlay">
            <div className="paywall-content">
              {!isLoggedIn ? (
                <>
                  <p>Sign in to continue reading.</p>
                  <GoogleLoginButton />
                </>
              ) : (
                <>
                  <button className="unlock-btn" onClick={handleUnlock}>
                    Unlock Post
                  </button>

                  {post.price > 0 && (
                    <button
                      className="payment-btn"
                      onClick={handlePayment}
                      disabled={paymentLoading}
                    >
                      {paymentLoading
                        ? "Processing…"
                        : `Pay KES ${post.price}`}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default PostDetail;
