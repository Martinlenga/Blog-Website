import { useState } from "react";
import { Helmet } from "react-helmet";
import { FiMail, FiSend, FiMapPin } from "react-icons/fi";
import { FaFacebookF } from "react-icons/fa"; // Added Facebook icon

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setStatus("sending");

    if (!form.name || !form.email || !form.message) {
      setError("All fields are required.");
      setStatus("");
      return;
    }

    setTimeout(() => {
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-28 pb-20">
      <Helmet>
        <title>Contact | JK Ithaguru</title>
        <meta name="description" content="Contact JK Ithaguru for feedback, collaboration, or inquiries." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <header className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-indigo-600 font-bold tracking-widest uppercase text-xs mb-4">Get in Touch</p>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-gray-900 mb-6">Let’s start a conversation.</h1>
          <p className="text-xl text-gray-500 leading-relaxed font-light">
            Questions, ideas, partnerships, or feedback — our inbox is always open.
          </p>
        </header>

        <div className="grid md:grid-cols-12 gap-12 md:gap-20 items-start">
          <div className="md:col-span-5 space-y-12">
            <div>
              <h2 className="font-serif text-3xl font-bold text-gray-900 mb-4">We'd love to hear from you</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                JK Ithaguru is built for readers who value powerful storytelling. 
                Whether you want to collaborate, publish, or simply say hello, we read every message.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shrink-0">
                  <FiMail size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Email Us</h3>
                  <a href="mailto:info@ithaguru.co.ke" className="text-indigo-600 hover:text-indigo-800 transition-colors font-medium">
                    info@ithaguru.co.ke
                  </a>
                  <p className="text-sm text-gray-500 mt-1">Typical reply time: 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shrink-0">
                  <FiMapPin size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Socials</h3>
                  <div className="flex gap-4 mt-2">
                     <a href="https://web.facebook.com/IthaguruJK/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition font-medium">
                       <FaFacebookF /> Facebook
                     </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              <form className="relative z-10 flex flex-col gap-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-gray-900 placeholder-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Message</label>
                  <textarea
                    name="message"
                    placeholder="How can we help you?"
                    rows="6"
                    value={form.message}
                    onChange={handleChange}
                    className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-gray-900 placeholder-gray-400 resize-none"
                  />
                </div>

                {status === "success" && (
                  <div className="p-4 bg-green-50 text-green-700 rounded-xl text-center font-medium border border-green-100">
                    Message sent successfully! We'll be in touch soon.
                  </div>
                )}
                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center font-medium border border-red-100">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-2 w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-indigo-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status === "sending" ? "Sending..." : <>Send Message <FiSend /></>}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="text-center mt-24 max-w-2xl mx-auto border-t border-gray-100 pt-16">
          <h3 className="font-serif text-2xl font-bold text-gray-900">Built for readers who appreciate depth.</h3>
          <p className="mt-3 text-gray-500">JK Ithaguru is where premium stories live.</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;