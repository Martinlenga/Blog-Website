import { useState } from "react";
import { submitFeedback } from "../services/api"; 
import { FiSend, FiStar, FiLoader } from "react-icons/fi";

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
  const [hoverRating, setHoverRating] = useState(0);
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

      await submitFeedback(
        null,
        {
          name: name || "Anonymous",
          email,
          rating,
          comment,
        },
        jwt
      );

      setName("");
      setEmail("");
      setRating(0);
      setComment("");
      setSuccess(true);

      onSuccess?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to submit review. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-12 shadow-xl shadow-indigo-900/5 border border-gray-100 max-w-3xl mx-auto">
      <div className="text-center mb-8 md:mb-10">
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mb-2 md:mb-3">
          Share Your Experience
        </h3>
        <p className="text-sm sm:text-base text-gray-500">
          Your feedback helps us curate better content.
        </p>
      </div>

      <form onSubmit={submitReviewForm} className="space-y-6 md:space-y-8">
        
        {/* MESSAGES */}
        {error && (
          <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium text-center animate-in fade-in zoom-in-95">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium text-center animate-in fade-in slide-in-from-top-2">
            Thank you! Your review has been posted.
          </div>
        )}

        {/* STAR RATING */}
        <div className="flex flex-col items-center space-y-3 mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`Rate ${star} out of 5 stars`} // 🚀 A11Y FIX
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-full transition-transform hover:scale-110 active:scale-90 p-1"
              >
                <FiStar
                  className={`text-3xl sm:text-4xl transition-colors duration-200 ${
                    star <= (hoverRating || rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-200 hover:text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>

          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-indigo-600 h-5 transition-all">
            {ratingLabels[hoverRating || rating]}
          </span>
        </div>

        {/* INPUTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          <div className="space-y-2">
            <label htmlFor="review-name" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
              Name
            </label>
            <input
              id="review-name"
              name="review-name"
              type="text"
              placeholder="How should we call you?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 sm:px-5 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-gray-900 placeholder-gray-400 text-sm sm:text-base"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="review-email" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
              Email
            </label>
            <input
              id="review-email"
              name="review-email"
              type="email"
              placeholder="For verification only"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 sm:px-5 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-gray-900 placeholder-gray-400 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* COMMENT */}
        <div className="space-y-2">
          <label htmlFor="review-comment" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
            Review
          </label>
          <textarea
            id="review-comment"
            name="review-comment"
            value={comment}
            placeholder="What did you think of JK thaguru?"
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-4 sm:px-5 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-gray-900 placeholder-gray-400 resize-none text-sm sm:text-base"
          />
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-indigo-600 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? (
            <><FiLoader className="animate-spin" /> Posting...</>
          ) : (
            <>Submit Review <FiSend /></>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;