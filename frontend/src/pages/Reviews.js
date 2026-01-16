const testimonials = [
  { name: "James K.", text: "Insightful, calming, and relatable writing. A blog that actually makes you pause and think.", rating: 5 },
  { name: "Sarah M.", text: "I always leave feeling lighter and more focused. The articles feel deeply human.", rating: 4 },
  { name: "David L.", text: "A refreshing break from noisy content online. Simple, thoughtful, and honest.", rating: 5 }
];

const Reviews = () => (
  <div className="container reviews-section">
    <h2 className="page-title">What Readers Say</h2>
    <p className="page-subtitle">Feedback from readers who’ve connected with the stories and ideas shared here.</p>

    <div className="reviews-grid">
      {testimonials.map((review, i) => (
        <div key={i} className="review-card">
          <p className="review-text">“{review.text}”</p>
          <div className="review-rating">
            {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
          </div>
          <span className="review-author">— {review.name}</span>
        </div>
      ))}
    </div>
  </div>
);

export default Reviews;
