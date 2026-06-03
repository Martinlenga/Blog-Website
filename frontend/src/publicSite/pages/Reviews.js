import { useEffect, useState } from "react";
// 🚀 Ensure this path points to your updated API file
import { getFeedbacksByPost } from "../services/api"; 
import ReviewForm from "./ReviewForm";
import { FiMessageSquare, FiPlus, FiX, FiLoader } from "react-icons/fi";
import { FaQuoteRight } from "react-icons/fa"; 

const Reviews = ({ jwt }) => {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // 🚀 UX FIX: Loading state

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      // Adjusted function name to match our earlier terminology sweep in publicApi.js
      const data = await getFeedbacksByPost(null, jwt); 
      setReviews(data.reverse());
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jwt]);

  return (
    <section className="bg-gray-50 py-20 px-4 md:px-8 border-t border-gray-200 rounded-[3rem]">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER & ACTION */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="text-center md:text-left">
            <span className="text-indigo-600 font-bold tracking-widest text-[10px] md:text-xs uppercase mb-2 block">
              Community Voices
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900">
              Reader Insights
            </h2>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm transition-all shadow-md active:scale-95 ${
              showForm 
                ? "bg-gray-200 text-gray-800 hover:bg-gray-300" 
                : "bg-gray-900 text-white hover:bg-indigo-600 hover:shadow-lg hover:-translate-y-0.5"
            }`}
          >
            {showForm ? <><FiX size={18} /> Close Form</> : <><FiPlus size={18} /> Write a Review</>}
          </button>
        </div>

        {/* 🚀 UX FIX: COLLAPSIBLE FORM using robust CSS Grid animation */}
        <div 
          className={`grid transition-all duration-500 ease-in-out ${
            showForm ? "grid-rows-[1fr] opacity-100 mb-16" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="pt-2"> {/* Tiny padding to prevent shadow clipping */}
              <ReviewForm onSuccess={() => { fetchReviews(); setShowForm(false); }} jwt={jwt} />
            </div>
          </div>
        </div>

        {/* CONTENT AREA (Loading, Empty, or Grid) */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <FiLoader className="animate-spin text-4xl text-indigo-600 mb-4" />
            <p className="font-medium animate-pulse">Loading reader insights...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 md:py-24 bg-white rounded-[2rem] border border-dashed border-gray-300 shadow-sm animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMessageSquare className="text-3xl text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-500">Be the first to share your thoughts on this publication!</p>
            {!showForm && (
              <button 
                onClick={() => setShowForm(true)}
                className="mt-6 text-indigo-600 font-bold hover:text-indigo-800 transition-colors"
              >
                Write a review
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="relative bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-400 group flex flex-col h-full animate-in fade-in zoom-in-95"
              >
                {/* Background Decoration */}
                <FaQuoteRight className="absolute top-8 right-8 text-6xl text-gray-50 opacity-60 group-hover:text-indigo-50 group-hover:opacity-100 transition-colors duration-500" />

                {/* Stars */}
                <div className="relative z-10 flex gap-1 text-yellow-400 text-sm mb-6">
                  {"★".repeat(r.rating)}
                  <span className="text-gray-200">{"★".repeat(5 - r.rating)}</span>
                </div>

                {/* Comment */}
                <p className="relative z-10 text-gray-700 font-serif text-lg leading-relaxed mb-8">
                  "{r.comment}"
                </p>

                {/* Author Section - Pushed strictly to Bottom via mt-auto */}
                <div className="relative z-10 flex items-center gap-3.5 pt-6 border-t border-gray-50 mt-auto">
                  <div className="w-11 h-11 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm uppercase shrink-0 shadow-sm">
                    {(r.name || "A").charAt(0)}
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-gray-900 line-clamp-1">
                      {r.name || "Anonymous Reader"}
                    </span>
                    <span className="block text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-0.5">
                      Verified Reader
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Reviews;