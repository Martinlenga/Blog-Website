const testimonials = [
  { text: "A blog that feels human in a noisy digital world.", author: "Sarah M." },
  { text: "Thoughtful, calming, and beautifully written.", author: "James K." },
  { text: "Makes me pause and reflect on life.", author: "Liam P." }
];

const TestimonialsPreview = () => {
  return (
    <section className="home-section testimonials-section">
      <h2 className="section-title">What Readers Say</h2>

      <div className="testimonial-preview">
        {testimonials.map((t, idx) => (
          <blockquote key={idx} className="testimonial-card">
            <p>{t.text}</p>
            <span>— {t.author}</span>
          </blockquote>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsPreview;
