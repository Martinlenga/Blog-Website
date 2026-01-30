import { useState } from "react";
import { submitFeedback } from "../services/api";

const ratingLabels = [
  "",
  "Terrible – not helpful",
  "Poor – needs improvement",
  "Okay – average experience",
  "Good – enjoyed it",
  "Excellent – highly recommended",
];

const ReviewForm = ({ onSuccess, jwt }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
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
        null, // no postId
        { name: name || "Anonymous", email, rating, comment },
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
      console.error(err);
      setError(err.message || "Failed to submit review. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submitReviewForm}
      className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-8 md:p-12 shadow-xl flex flex-col space-y-5 max-w-3xl mx-auto mb-10 transition-all"
    >
      <h3 className="text-3xl font-extrabold text-indigo-600 tracking-wide mb-2">
        Leave a Review
      </h3>
      <p className="text-gray-600 mb-4">
        Share your thoughts and help us improve! ⭐
      </p>

      {error && <p className="text-red-500 font-medium">{error}</p>}
      {success && <p className="text-green-600 font-medium">Thank you for your review ❤️</p>}

      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="px-4 py-3 rounded-lg bg-gray-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <input
        type="email"
        placeholder="Email (optional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="px-4 py-3 rounded-lg bg-gray-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <div className="flex items-center space-x-3">
        {[1, 2, 3, 4, 5].map((num) => (
          <span
            key={num}
            className={`text-3xl cursor-pointer transition-transform hover:scale-110 ${
              num <= rating ? "text-yellow-400" : "text-gray-400"
            }`}
            title={ratingLabels[num]}
            onClick={() => setRating(num)}
          >
            ★
          </span>
        ))}
      </div>
      {rating > 0 && <p className="text-gray-600 text-sm">{ratingLabels[rating]}</p>}

      <textarea
        placeholder="Share your thoughts..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="px-4 py-3 rounded-lg bg-gray-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        rows={5}
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all max-w-max mx-auto mt-2"
      >
        {loading ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
};

export default ReviewForm;
