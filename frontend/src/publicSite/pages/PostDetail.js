import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getPostBySlug, unlockPost } from "../services/api";
import { useAuth } from "../../auth/PublicAuthContext";
import useFacebookSDK from "../hooks/useFacebookSDK";
import MpesaModal from "../components/MpesaModal";
import ArticleBody from "../components/ArticleBody"; 
import { Helmet } from "react-helmet";
import { FiClock, FiUser, FiUnlock, FiLock } from "react-icons/fi";
import { FaTwitter, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";

const PostDetail = () => {
  const { slug } = useParams();
  const { isLoggedIn, user } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMpesa, setShowMpesa] = useState(false);

  const fbLoaded = useFacebookSDK();
  const hasFetched = useRef(false);

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
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchPost();
    return () => { hasFetched.current = false; };
  }, [slug]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchPost();
    }
  }, [isLoggedIn, fetchPost]);

  const handleGooglePrompt = () => {
    if (!window.google?.accounts?.id) return;
    window.google.accounts.id.prompt();
  };

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

  const isUnlocked = post && (!post.locked || post.paid) && isLoggedIn;
  const postUrl = `https://ithaguru.co.ke/posts/${slug}`;

  useEffect(() => {
    if (isUnlocked && fbLoaded && window.FB) {
      window.FB.XFBML.parse();
    }
  }, [isUnlocked, fbLoaded]);

  if (loading) return (
    <div className="min-h-screen pt-32 flex justify-center">
       <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
       </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen pt-32 text-center px-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-red-500 mb-6">{error}</p>
      <Link to="/blog" className="text-indigo-600 font-bold hover:underline">Return to Blog</Link>
    </div>
  );

  if (!post) return <p className="text-center mt-32">Post not found</p>;

  return (
    // 🔴 Increased pb-20 to pb-32 so the footer content isn't covered by the floating pill
    <main className="bg-white min-h-screen pt-28 pb-32">
      <Helmet>
        <title>{post.title} | JK Ithaguru</title>
        <meta name="description" content={post.meta_description} />
      </Helmet>

      <article className="max-w-3xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Category & Date */}
        <div className="flex items-center gap-3 mb-6">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest rounded-full">
            {post.category || "Editorial"}
          </span>
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
            {new Date(post.published_at || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-8">
          {post.title}
        </h1>

        {/* Author Row */}
        <div className="flex flex-wrap items-center justify-between border-y border-gray-100 py-5 mb-6 gap-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
               <FiUser />
             </div>
             <div>
               <p className="text-sm font-bold text-gray-900">{post.author_name}</p>
               <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <span>Author</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="flex items-center gap-1"><FiClock className="text-indigo-400"/> {post.reading_time}</span>
               </div>
             </div>
          </div>

          <div className="flex items-center gap-3">
            {isUnlocked ? (
              <span className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-emerald-100">
                <FiUnlock /> Unlocked
              </span>
            ) : post.price > 0 ? (
              <span className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md">
                <FiLock /> Premium • KES {post.price}
              </span>
            ) : (
              <span className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-emerald-100">
                Free Read
              </span>
            )}
          </div>
        </div>

        {/* ================= CONTENT BODY ================= */}
        <div className="relative">
          <div 
            className={`transition-opacity duration-500 ${!isUnlocked ? "opacity-90" : "opacity-100"}`}
            style={!isUnlocked ? { maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)' } : {}}
          >
            <ArticleBody content={isUnlocked ? post.content : post.content_preview} />
          </div>

          {/* Paywall Overlay */}
          {!isUnlocked && (
            // 🔴 THE FIX: Changed pb-10 to pb-28. This pushes the white card UP away from the bottom edge.
            <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center justify-end pb-24 pt-32">
              <div className="relative z-30 bg-white/95 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-2xl p-8 max-w-sm w-full text-center mx-4">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                   <FiLock size={20} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Continue Reading</h3>
                <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                  Unlock this premium article to get full access to the insights and comments.
                </p>
                
                {!isLoggedIn ? (
                   <button onClick={handleGooglePrompt} className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-lg text-sm">
                     Sign in to Unlock
                   </button>
                ) : (
                   <button onClick={() => setShowMpesa(true)} className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 text-sm">
                     Unlock for KES {post.price}
                   </button>
                )}
                <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-wide font-bold">Secure payment via M-Pesa</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Share / Comments */}
        {isUnlocked && (
          <div className="mt-16 pt-10 border-t border-gray-100 animate-fade-in">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
               <div>
                  <h4 className="font-bold text-gray-900 mb-1">Enjoyed this read?</h4>
                  <p className="text-sm text-gray-500">Share it with your network.</p>
               </div>
               <div className="flex gap-3">
                  <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all"><FaTwitter /></a>
                  <a href={`https://www.linkedin.com/shareArticle?url=${encodeURIComponent(postUrl)}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center hover:bg-blue-700 hover:text-white transition-all"><FaLinkedinIn /></a>
                  <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(postUrl)}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all"><FaWhatsapp /></a>
               </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-200">
               <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                 <span className="w-1 h-6 bg-indigo-600 rounded-full"></span> Discussion
               </h3>
               <div className="fb-comments" data-href={postUrl} data-width="100%" data-numposts="5"></div>
            </div>
          </div>
        )}
      </article>

      {/* MPESA MODAL */}
      {showMpesa && (
        <MpesaModal
          post={post}
          onClose={() => setShowMpesa(false)}
          onPaid={() => {
            setShowMpesa(false);
            handleUnlock();
          }}
        />
      )}

      {/* Auth Status Bar (Floating Bottom) */}
      {isLoggedIn && user?.email && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md border border-gray-200 px-5 py-2.5 rounded-full shadow-xl text-xs font-medium text-gray-600 z-40 hidden md:block">
          Reading as <span className="text-indigo-600 font-bold ml-1">{user.email}</span>
        </div>
      )}

    </main>
  );
};

export default PostDetail;