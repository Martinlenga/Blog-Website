import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getPostComments, submitPostComment } from '../services/api'; 

export default function PostComments({ postSlug }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    let isMounted = true;
    
    const fetchComments = async () => {
      try {
        const res = await getPostComments(postSlug);
        if (isMounted) {
          // 🚀 THE FIX: Safely extract the array whether it comes from Axios (res.data) or native fetch (res)
          const payload = res.data !== undefined ? res.data : res;
          const fetchedComments = Array.isArray(payload) ? payload : (payload?.results || []);
          
          setComments(fetchedComments);
        }
      } catch (err) {
        console.error("Failed to load comments", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (postSlug) fetchComments();

    return () => { isMounted = false; };
  }, [postSlug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const res = await submitPostComment(postSlug, { 
        content: content.trim() 
      });
      
      const newComment = res.data !== undefined ? res.data : res;

      setComments(prevComments => [newComment, ...prevComments]);
      
      // Clear form on success
      setContent('');
      setFeedback({ type: 'success', message: 'Comment posted successfully!' });
      
      // Hide success message after 5 seconds
      setTimeout(() => setFeedback({ type: '', message: '' }), 5000);
      
    } catch (err) {
      setFeedback({ type: 'error', message: 'Please sign in to post a comment.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12 pt-10 border-t border-gray-100 font-sans">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
          <MessageSquare size={20} />
        </div>
        <h3 className="font-serif text-2xl font-bold text-gray-900">
          Discussion
        </h3>
      </div>

      {/* THE COMMENT FORM */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 mb-10 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Removed the 'Name' input completely! */}

          <div>
            <label htmlFor="content" className="sr-only">Your Comment</label>
            <textarea 
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Join the conversation..." 
              rows={4}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400 resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex-1">
              {feedback.message && (
                <div className={`flex items-center gap-2 text-sm font-medium animate-in fade-in ${feedback.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {feedback.message}
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              disabled={submitting || !content.trim()}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {submitting ? 'Posting...' : 'Post Comment'} <Send size={14} />
            </button>
          </div>
        </form>
      </div>

      {/* THE COMMENT LIST */}
      <div className="space-y-6">
        {loading ? (
          <div className="animate-pulse space-y-6">
            {[1, 2].map(i => (
              <div key={i} className="flex gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0"></div>
                <div className="space-y-2 flex-1 pt-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-100 rounded w-full"></div>
                  <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 sm:gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <img 
                src={comment.author_avatar} 
                alt={comment.author_name} 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-100 shadow-sm shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                  <span className="font-bold text-gray-900 text-sm sm:text-base truncate">
                    {comment.author_name}
                  </span>
                  <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <MessageSquare size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium text-sm">No comments yet.</p>
            <p className="text-gray-400 text-xs mt-1">Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}