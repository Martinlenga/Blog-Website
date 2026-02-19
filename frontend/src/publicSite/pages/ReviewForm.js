import { useState } from "react";
import { submitFeedback } from "../services/api";
import { FiSend, FiStar } from "react-icons/fi";

const ratingLabels = [
  "Select a rating",
  "Terrible",
  "Poor",
  "Average",
  "Good",
  "Excellent",
];

const ReviewForm = ({ onSuccess, jwt }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0); // For star hover effect
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submitReviewForm = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!rating || !comment.trim()) {
      setError("Please select a rating and write a comment.");
      return;
    }

    try {
      setLoading(true);
      await submitFeedback(null, { name: name || "Anonymous", email, rating, comment }, jwt);

      setName("");
      setEmail("");
      setRating(0);
      setComment("");
      setSuccess(true);
      onSuccess?.();
      
      // Clear success msg after 3s
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to submit review. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Share Your Experience</h3>
        <p className="text-gray-500">Your feedback helps us create better content.</p>
      </div>

      <form onSubmit={submitReviewForm} className="space-y-6">
        
        {/* Feedback Messages */}
        {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium text-center">{error}</div>}
        {success && <div className="p-4 bg-green-50 text-green-600 rounded-xl text-sm font-medium text-center">Thank you! Your review has been posted.</div>}

        {/* STAR RATING */}
        <div className="flex flex-col items-center justify-center space-y-2 mb-8">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                <FiStar 
                  className={`text-3xl md:text-4xl transition-colors ${
                    star <= (hoverRating || rating) 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-gray-300"
                  }`} 
                />
              </button>
            ))}
          </div>
          <span className="text-sm font-medium text-indigo-600 h-5">
            {ratingLabels[hoverRating || rating]}
          </span>
        </div>

        {/* INPUTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Name</label>
            <input
              type="text"
              placeholder="Your Name (Optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
            <input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
            />
          </div>
        </div>

        {/* COMMENT AREA */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Review</label>
          <textarea
            placeholder="What did you think of the articles?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none"
            rows={4}
          />
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-indigo-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            "Posting..."
          ) : (
            <>
              Submit Review <FiSend />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;