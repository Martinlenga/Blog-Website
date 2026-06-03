import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { FiClock, FiUser, FiUnlock, FiLock, FiAlertCircle } from "react-icons/fi";
import { FaTwitter, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";

import { getPostBySlug, pollPostUnlock, googleLogin } from "../services/api";
import { useAuth } from "../../auth/PublicAuthContext";
import useFacebookSDK from "../hooks/useFacebookSDK";
import MpesaModal from "../components/MpesaModal";
import ArticleBody from "../components/ArticleBody"; 
import { useGoogleLogin } from '@react-oauth/google';

// 🚀 CRITICAL: We import Quill's CSS here so that any alignment classes (like ql-align-center) 
// saved from the admin editor actually render correctly on the public UI.
import 'react-quill-new/dist/quill.snow.css'; 

import FacebookComments from "../components/FacebookComments"; 

const formatDate = (dateString) => {
  if (!dateString) return "Recently Published";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const PostDetail = () => {
  const { slug } = useParams();
  const { isLoggedIn, user, login } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMpesa, setShowMpesa] = useState(false);

  useFacebookSDK(); 
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
  }, [fetchPost]);

  useEffect(() => {
    if (isLoggedIn) fetchPost();
  }, [isLoggedIn, fetchPost]);

  const handleGoogleSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await googleLogin(tokenResponse.access_token);
        if (res?.access) {
          login(res.access, res.user, res.refresh);
        }
      } catch (err) {
        setError("Failed to authenticate with our servers.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError("Google authentication window closed or failed.")
  });

  const handleUnlock = async () => {
    try {
      setLoading(true);
      const unlocked = await pollPostUnlock(slug);
      setPost(unlocked);
    } catch {
      setError("Failed to verify unlock status. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const isUnlocked = post && (!post.locked || post.paid) && isLoggedIn;
  const postUrl = `https://ithaguru.co.ke/posts/${slug}`;

  if (loading && !post) return (
    <div className="min-h-screen pt-32 max-w-3xl mx-auto px-6 md:px-8">
       <div className="animate-pulse">
          <div className="flex gap-3 mb-8">
            <div className="h-6 w-24 bg-indigo-50 rounded-full"></div>
            <div className="h-6 w-32 bg-gray-100 rounded-full"></div>
          </div>
          <div className="h-12 w-full bg-gray-200 rounded-xl mb-4"></div>
          <div className="h-12 w-3/4 bg-gray-200 rounded-xl mb-12"></div>
          
          <div className="flex items-center gap-4 border-y border-gray-100 py-6 mb-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-3 w-32 bg-gray-200 rounded"></div>
              <div className="h-2 w-24 bg-gray-100 rounded"></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-4 w-full bg-gray-100 rounded"></div>
            <div className="h-4 w-full bg-gray-100 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-100 rounded"></div>
          </div>
       </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen pt-40 flex flex-col items-center px-4 text-center">
      <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
        <FiAlertCircle size={32} />
      </div>
      <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Something went wrong</h2>
      <p className="text-gray-500 mb-8 max-w-md">{error}</p>
      <Link to="/" className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors">
        Return to Homepage
      </Link>
    </div>
  );

  if (!post) {
    return (
      <div className="min-h-screen pt-40 flex flex-col items-center px-4 text-center">
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Article not found</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          The publication you're looking for doesn't exist, has been moved, or may have been removed.
        </p>
        <Link to="/" className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors">
          Browse Latest Articles
        </Link>
      </div>
    );
  }

  return (
    // 🚀 Added overflow-x-hidden here safely, to prevent the entire body from horizontal scrolling
    <main className="bg-white min-h-screen pt-28 pb-32 overflow-x-hidden w-full">
      <Helmet>
        <title>{post.title} | JK Ithaguru</title>
        <meta name="description" content={post.meta_description} />
      </Helmet>

      <article className="max-w-3xl mx-auto px-6 md:px-8 relative z-10 animate-in fade-in duration-700">
        
        {/* Category & Date */}
        <div className="flex items-center gap-3 mb-6">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest rounded-full">
            {post.category || "Editorial"}
          </span>
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
            {formatDate(post.published_at || post.created_at)}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.15] mb-8">
          {post.title}
        </h1>

        {/* Author Row */}
        <div className="flex flex-wrap items-center justify-between border-y border-gray-100 py-5 mb-8 gap-4">
          <div className="flex items-center gap-4">
             <div className="w-11 h-11 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
               <FiUser size={20} />
             </div>
             <div>
               <p className="text-sm font-bold text-gray-900">{post.author_name || "JK Team"}</p>
               <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-0.5">
                 <span>Author</span>
                 <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                 <span className="flex items-center gap-1.5"><FiClock className="text-indigo-400"/> {post.reading_time || "5 min read"}</span>
               </div>
             </div>
          </div>

          <div className="flex items-center gap-3">
            {isUnlocked ? (
              <span className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase tracking-widest rounded-lg border border-emerald-100 shadow-sm">
                <FiUnlock size={14} /> Unlocked
              </span>
            ) : post.price > 0 ? (
              <span className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-[10px] font-extrabold uppercase tracking-widest rounded-lg shadow-md">
                <FiLock size={14} /> Premium • KES {post.price}
              </span>
            ) : (
              <span className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase tracking-widest rounded-lg border border-emerald-100 shadow-sm">
                Free Read
              </span>
            )}
          </div>
        </div>

        {/* ================= CONTENT BODY ================= */}
        <div className="relative">
          
          <style>{`
            /* 1. THE ULTIMATE RESET */
            .article-clean-reset {
              padding: 0 2px; /* Micro buffer so letters never touch absolute zero */
              font-family: inherit;
              font-size: inherit;
            }

            /* 2. PROTECT WORDS FROM BEING SLICED & KILL SCROLLBARS */
            .article-clean-reset * {
              word-break: normal !important; 
              overflow-wrap: break-word !important; 
              hyphens: none !important;
              -webkit-hyphens: none !important;
              max-width: 100% !important; /* Forces massive images/strings to obey mobile width */
            }

            /* 3. DESTROY COPY-PASTED GAPS & JUSTIFY RIVERS */
            .article-clean-reset p, 
            .article-clean-reset span, 
            .article-clean-reset div, 
            .article-clean-reset li, 
            .article-clean-reset h1, 
            .article-clean-reset h2, 
            .article-clean-reset h3 {
              text-align: left !important; 
              white-space: pre-wrap !important; /* Preserves natural flow and stops inline width lockups */
            }

            /* 4. SAFE MEDIA & TABLES */
            .article-clean-reset img, 
            .article-clean-reset iframe,
            .article-clean-reset video {
              height: auto !important;
            }
            .article-clean-reset table, 
            .article-clean-reset pre, 
            .article-clean-reset code {
              overflow-x: auto !important; /* Allows tables/code to safely scroll internally */
              white-space: pre-wrap !important;
            }

            /* 5. RESTORE INTENTIONAL QUILL ALIGNMENTS */
            /* Because we imported Quill CSS above, these standard classes will now override our left-align reset */
            .article-clean-reset .ql-align-center, 
            .article-clean-reset .ql-align-center * {
              text-align: center !important;
            }
            .article-clean-reset .ql-align-right, 
            .article-clean-reset .ql-align-right * {
              text-align: right !important;
            }
            .article-clean-reset .ql-align-justify, 
            .article-clean-reset .ql-align-justify * {
              text-align: justify !important;
            }
          `}</style>

          <div 
            // We apply both our 'article-clean-reset' AND Quill's native 'ql-editor' wrapper class here
            className={`article-clean-reset ql-editor transition-opacity duration-500 w-full ${!isUnlocked ? "opacity-95" : "opacity-100"}`}
            style={!isUnlocked ? { maskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)' } : {}}
          >
            {/* The ArticleBody now purely handles Tailwind Typography coloring/fonts without fighting layout */}
            <ArticleBody content={isUnlocked ? post.content : post.content_preview} />
          </div>

          {/* Paywall Overlay */}
          {!isUnlocked && (
            <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center justify-end pb-12 pt-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="relative z-30 bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-2xl rounded-[2rem] p-8 max-w-sm w-full text-center mx-4">
                <div className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl shadow-indigo-600/20">
                   <FiLock size={22} />
                </div>
                <h3 className="font-serif text-2xl font-bold text-gray-900 mb-3">Continue Reading</h3>
                <p className="text-gray-600 mb-8 leading-relaxed text-sm">
                  Unlock this premium publication to get full access to the insights and community discussion.
                </p>
                
                {!isLoggedIn ? (
                   <button onClick={() => handleGoogleSignIn()} className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-lg hover:-translate-y-0.5 text-sm">
                     Sign in to Unlock
                   </button>
                ) : (
                   <button onClick={() => setShowMpesa(true)} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-600/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm">
                     Unlock for KES {post.price}
                   </button>
                )}
                <p className="text-[10px] text-gray-400 mt-5 uppercase tracking-widest font-bold">Secure payment via M-Pesa</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Share / Comments */}
        {isUnlocked && (
          <div className="mt-16 pt-10 border-t border-gray-100 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
               <div>
                  <h4 className="font-bold text-gray-900 mb-1">Enjoyed this read?</h4>
                  <p className="text-sm text-gray-500">Share it with your network.</p>
               </div>
               <div className="flex gap-3">
                  <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}`} target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all shadow-sm"><FaTwitter size={18} /></a>
                  <a href={`https://www.linkedin.com/shareArticle?url=${encodeURIComponent(postUrl)}`} target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center hover:bg-blue-700 hover:text-white transition-all shadow-sm"><FaLinkedinIn size={18} /></a>
                  <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(postUrl)}`} target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm"><FaWhatsapp size={20} /></a>
               </div>
            </div>

            <div className="bg-gray-50 rounded-[2rem] p-6 md:p-10 border border-gray-100 shadow-inner">
               <h3 className="font-serif text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                 <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span> Discussion
               </h3>
               
               <FacebookComments url={postUrl} />

            </div>
          </div>
        )}
      </article>

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

      {isLoggedIn && user?.email && (
        <div className="fixed bottom-5 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out w-max max-w-[95vw]">
          <div className="bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl shadow-gray-200/50 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full sm:rounded-full flex items-center justify-center flex-wrap gap-x-1.5 text-[11px] sm:text-xs font-medium text-gray-500 transition-all hover:shadow-2xl text-center">
            
            <span className="shrink-0 tracking-wide">Reading as</span>
            
            {/* 🚀 FIX: Removed truncate and max-width! Added break-all so a massive email just wraps safely instead of hiding behind dots. */}
            <span className="text-indigo-600 font-bold break-all">
              {user.email}
            </span>
            
          </div>
        </div>
      )}
    </main>
  );
};

export default PostDetail;