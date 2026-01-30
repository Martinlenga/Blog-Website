import { useState } from "react";
import { Helmet } from "react-helmet";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setStatus("Sending...");

    if (!form.name || !form.email || !form.message) {
      setError("All fields are required.");
      setStatus("");
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setStatus("Message sent successfully!");
      setForm({ name: "", email: "", message: "" });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-24 px-4 md:px-8">
      <Helmet>
        <title>Contact | YourBlog</title>
        <meta
          name="description"
          content="Contact the blog for feedback, collaboration, or inquiries."
        />
      </Helmet>

      <div className="max-w-5xl mx-auto space-y-12">
        <h1 className="text-5xl md:text-6xl font-extrabold text-indigo-600 text-center">
          Get in Touch
        </h1>
        <p className="text-gray-600 text-center text-lg md:text-xl">
          Whether it’s feedback, collaboration, or a simple hello — we’d love to hear from you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-gradient-to-tr from-indigo-50 via-white to-indigo-50 p-8 md:p-12 rounded-2xl shadow-2xl hover:shadow-3xl transition-all">
          
          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-indigo-600 mb-2">Contact Info</h2>
            <p><strong>Email:</strong> hello@yourblog.com</p>
            <p><strong>Twitter:</strong> @yourhandle</p>
            <p><strong>Instagram:</strong> @yourhandle</p>
            <p className="text-gray-500 text-sm">
              We usually respond within 24 hours.
            </p>
          </div>

          {/* Contact Form */}
          <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              className="px-4 py-3 rounded-lg bg-gray-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={form.email}
              onChange={handleChange}
              className="px-4 py-3 rounded-lg bg-gray-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <textarea
              name="message"
              placeholder="Your Message"
              rows="5"
              value={form.message}
              onChange={handleChange}
              className="px-4 py-3 rounded-lg bg-gray-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all max-w-max mx-auto mt-2"
            >
              {status === "Sending..." ? "Sending…" : "Send Message"}
            </button>

            {status && <p className="text-green-600 font-medium">{status}</p>}
            {error && <p className="text-red-500 font-medium">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
