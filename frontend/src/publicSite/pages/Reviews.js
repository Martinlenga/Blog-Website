import { useEffect, useState } from "react";
import { getFeedbacksByPost } from "../services/api"; 
import ReviewForm from "./ReviewForm";
import { FiMessageSquare, FiPlus, FiX } from "react-icons/fi";
import { FaQuoteRight } from "react-icons/fa"; 

const Reviews = ({ jwt }) => {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = async () => {
    try {
      const data = await getFeedbacksByPost(null, jwt); 
      setReviews(data.reverse());
    } catch (err) {
      console.error("Failed to load reviews", err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [jwt]);

  return (
    <section className="bg-gray-50 py-20 px-4 md:px-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER & ACTION */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="text-center md:text-left">
            <span className="text-indigo-600 font-bold tracking-widest text-xs uppercase mb-2 block">
              Community Voices
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900">
              Reader Insights
            </h2>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all shadow-lg ${
              showForm 
                ? "bg-gray-200 text-gray-800 hover:bg-gray-300" 
                : "bg-gray-900 text-white hover:bg-indigo-600"
            }`}
          >
            {showForm ? <><FiX /> Close Form</> : <><FiPlus /> Write a Review</>}
          </button>
        </div>

        {/* COLLAPSIBLE FORM */}
        <div 
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            showForm ? "max-h-[800px] opacity-100 mb-16" : "max-h-0 opacity-0"
          }`}
        >
          <ReviewForm onSuccess={() => { fetchReviews(); setShowForm(false); }} jwt={jwt} />
        </div>

        {/* REVIEWS GRID */}
        {reviews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300">
            <FiMessageSquare className="mx-auto text-4xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No reviews yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {reviews.map((r) => (
              <div
                key={r.id}
                // FIX: 'flex flex-col h-full' ensures cards are equal height and we can push content down
                className="relative bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full"
              >
                {/* Background Decoration */}
                <FaQuoteRight className="absolute top-6 right-6 text-6xl text-gray-50 opacity-50 group-hover:text-indigo-50 group-hover:opacity-100 transition-colors" />

                {/* Stars */}
                <div className="relative z-10 flex gap-1 text-yellow-400 text-sm mb-6">
                  {"★".repeat(r.rating)}
                  <span className="text-gray-200">{"★".repeat(5 - r.rating)}</span>
                </div>

                {/* Comment */}
                <p className="relative z-10 text-gray-700 font-serif text-lg leading-relaxed mb-6">
                  "{r.comment}"
                </p>

                {/* Author Section - Pushed to Bottom */}
                {/* FIX: 'mt-auto' pushes this div to the bottom of the flex container */}
                <div className="relative z-10 flex items-center gap-3 pt-6 border-t border-gray-50 mt-auto">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm uppercase shrink-0">
                    {(r.name || "A").charAt(0)}
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-gray-900 line-clamp-1">
                      {r.name || "Anonymous Reader"}
                    </span>
                    <span className="block text-xs text-gray-400 font-medium tracking-wide">
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