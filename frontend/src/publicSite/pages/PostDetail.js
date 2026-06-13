import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { FiClock, FiUser, FiUnlock, FiLock, FiAlertCircle } from "react-icons/fi";
import { FaTwitter, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { Layers } from "lucide-react"; // 🚀 Added Layers icon for the Series Badge

import { getPostBySlug, pollPostUnlock, getPosts } from "../services/api";
import { useAuth } from "../../auth/PublicAuthContext";
import MpesaModal from "../components/MpesaModal";
import ArticleBody from "../components/ArticleBody"; 
import GoogleLoginButton from "../../auth/GoogleLoginButton";

import 'react-quill-new/dist/quill.snow.css'; 

import PostComments from "../components/PostComments"; 
import RelatedStories from "../components/RelatedStories";

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
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [slug]);

  const [post, setPost] = useState(null);
  const [allOtherPosts, setAllOtherPosts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMpesa, setShowMpesa] = useState(false);

  const hasFetched = useRef(false);

  const fetchPost = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [postData, allPostsData] = await Promise.all([
        getPostBySlug(slug),
        getPosts()
      ]);
      
      setPost(postData);

      let extractedPosts = [];

      if (allPostsData && Array.isArray(allPostsData.posts)) {
        extractedPosts = [...allPostsData.posts];
        if (allPostsData.featured) {
          extractedPosts.unshift(allPostsData.featured); 
        }
      } else if (Array.isArray(allPostsData)) {
        extractedPosts = allPostsData;
      } else if (allPostsData?.results) {
        extractedPosts = allPostsData.results;
      } else if (allPostsData?.data) {
        extractedPosts = allPostsData.data;
      }

      const filteredPosts = extractedPosts.filter((p) => p.slug !== slug);
      
      let finalCarouselPosts = [];

      if (postData.series_name) {
        const sameSeriesPosts = filteredPosts.filter(p => p.series_name === postData.series_name);
        sameSeriesPosts.sort((a, b) => (a.part_number || 0) - (b.part_number || 0));
        const otherPosts = filteredPosts.filter(p => p.series_name !== postData.series_name);
        finalCarouselPosts = [...sameSeriesPosts, ...otherPosts];
      } else {
        finalCarouselPosts = filteredPosts;
      }

      setAllOtherPosts(finalCarouselPosts);

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
    <main className="bg-white min-h-screen pt-28 pb-32 overflow-x-hidden w-full">
      <Helmet>
        <title>{post.title} | JK Ithaguru</title>
        <meta name="description" content={post.meta_description} />
      </Helmet>

      <article className="max-w-3xl mx-auto px-6 md:px-8 relative z-10 animate-in fade-in duration-700">
        
        {/* 🚀 THE FIX: Category, Date, AND Series Badge Row */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full border border-indigo-100 shrink-0">
            {post.category || "Editorial"}
          </span>
          
          {/* Render the Series Badge if it exists */}
          {post.series_name && (
            <>
              <span className="text-gray-300 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full shadow-sm shrink-0">
                <Layers size={12} />
                {post.series_name} {post.part_number && `• PART ${post.part_number}`}
              </span>
            </>
          )}

          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider ml-auto sm:ml-0">
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
            ) : (
              <span className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-[10px] font-extrabold uppercase tracking-widest rounded-lg shadow-md">
                <FiLock size={14} /> Premium • KES {post.price}
              </span>
            )}
          </div>
        </div>

        {/* ================= CONTENT BODY ================= */}
        <div className="relative">
          
          <style>{`
            .article-clean-reset {
              padding: 0 2px;
              font-family: inherit;
              font-size: inherit;
            }
            .article-clean-reset * {
              word-break: normal !important; 
              overflow-wrap: break-word !important; 
              hyphens: none !important;
              -webkit-hyphens: none !important;
              max-width: 100% !important;
            }
            .article-clean-reset p, 
            .article-clean-reset span, 
            .article-clean-reset div, 
            .article-clean-reset li, 
            .article-clean-reset h1, 
            .article-clean-reset h2, 
            .article-clean-reset h3 {
              text-align: left !important; 
              white-space: pre-wrap !important;
            }
            .article-clean-reset img, 
            .article-clean-reset iframe,
            .article-clean-reset video {
              height: auto !important;
            }
            .article-clean-reset table, 
            .article-clean-reset pre, 
            .article-clean-reset code {
              overflow-x: auto !important;
              white-space: pre-wrap !important;
            }
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
            className={`article-clean-reset ql-editor transition-opacity duration-500 w-full ${!isUnlocked ? "opacity-95" : "opacity-100"}`}
            style={!isUnlocked ? { maskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)' } : {}}
          >
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
                   <GoogleLoginButton 
                     variant="unlock" 
                     onError={(msg) => setError(msg)} 
                   />
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

            <RelatedStories posts={allOtherPosts} />
            <PostComments postSlug={post.slug} />
            
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