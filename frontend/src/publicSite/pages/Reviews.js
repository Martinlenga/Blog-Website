import { useEffect, useState } from "react";
import { getFeedbacksByPost } from "../services/api"; // can use postId=null
import ReviewForm from "./ReviewForm";

const Reviews = ({ jwt }) => {
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    try {
      const data = await getFeedbacksByPost(null, jwt); // null = general reviews
      setReviews(data.reverse());
    } catch (err) {
      console.error("Failed to load reviews", err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [jwt]);

  return (
    <section className="text-gray-900 py-14 px-4 md:px-8">
      <ReviewForm onSuccess={fetchReviews} jwt={jwt} />

      <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-600 text-center mb-10">
        What Readers Say
      </h2>

      {reviews.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">
          No reviews yet. Be the first to leave a review!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition"
            >
              <p className="text-gray-700 mb-4 italic text-lg">“{r.comment}”</p>
              <div className="flex items-center justify-between">
                <div className="text-yellow-400 text-xl">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </div>
                <span className="text-gray-500 text-sm font-medium">
                  — {r.name || "Anonymous"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Reviews;
