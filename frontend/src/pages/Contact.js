import { useState } from "react";
import { Helmet } from "react-helmet";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setStatus("Sending...");

    if (!form.name || !form.email || !form.message) {
      setError("All fields are required.");
      setStatus("");
      return;
    }

    // Replace with actual API endpoint or email service
    setTimeout(() => {
      setStatus("Message sent successfully!");
      setForm({ name: "", email: "", message: "" });
    }, 1000);
  };

  return (
    <div className="container contact-page">
      <Helmet>
        <title>Contact | My Blog</title>
        <meta name="description" content="Contact the blog for feedback, collaboration, or inquiries." />
      </Helmet>

      <h1 className="page-title">Get in Touch</h1>
      <p className="page-subtitle">
        Whether it’s feedback, collaboration, or a simple hello — we’d love to hear from you.
      </p>

      <div className="contact-box">
        <div className="contact-info">
          <p><strong>Email:</strong> hello@yourblog.com</p>
          <p><strong>Twitter:</strong> @yourhandle</p>
          <p><strong>Instagram:</strong> @yourhandle</p>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Your Name" value={form.name} onChange={handleChange} />
          <input type="email" name="email" placeholder="Your Email" value={form.email} onChange={handleChange} />
          <textarea name="message" placeholder="Your Message" rows="5" value={form.message} onChange={handleChange}></textarea>
          <button type="submit" className="btn">Send Message</button>
        </form>

        {status && <p className="status-message">{status}</p>}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default Contact;
