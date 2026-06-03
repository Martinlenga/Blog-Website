import { useState } from "react";
import { Helmet } from "react-helmet";
import { FiMail, FiSend, FiMapPin, FiLoader } from "react-icons/fi";
import { FaFacebookF } from "react-icons/fa"; 

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

    // Simulate API call for now
    setTimeout(() => {
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
      
      // Clear success message after 5 seconds
      setTimeout(() => setStatus(""), 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-28 pb-20">
      <Helmet>
        <title>Contact | JK Ithaguru</title>
        <meta name="description" content="Contact JK Ithaguru for feedback, collaboration, or inquiries." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* HEADER SECTION */}
        <header className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <p className="text-indigo-600 font-bold tracking-widest uppercase text-[10px] sm:text-xs mb-3 sm:mb-4">Get in Touch</p>
          {/* 🚀 UX FIX: Scaled text down slightly for small mobile screens to prevent bad wrapping */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">Let’s start a conversation.</h1>
          <p className="text-lg sm:text-xl text-gray-500 leading-relaxed font-light">
            Questions, ideas, partnerships, or feedback — our inbox is always open.
          </p>
        </header>

        <div className="grid md:grid-cols-12 gap-12 md:gap-20 items-start">
          
          {/* LEFT SIDE: Info */}
          <div className="md:col-span-5 space-y-10 md:space-y-12">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mb-4">We'd love to hear from you</h2>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                JK Ithaguru is built for readers who value powerful storytelling. 
                Whether you want to collaborate, publish, or simply say hello, we read every message.
              </p>
            </div>

            <div className="space-y-6">
              {/* Email Card */}
              <div className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-gray-50 border border-gray-100 transition-colors hover:border-indigo-100">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shrink-0">
                  <FiMail size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Email Us</h3>
                  <a href="mailto:info@ithaguru.co.ke" className="text-indigo-600 hover:text-indigo-800 transition-colors font-medium">
                    info@ithaguru.co.ke
                  </a>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Typical reply time: 24 hours</p>
                </div>
              </div>

              {/* Socials Card */}
              <div className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-gray-50 border border-gray-100 transition-colors hover:border-indigo-100">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shrink-0">
                  <FiMapPin size={18} />
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

          {/* RIGHT SIDE: Form */}
          <div className="md:col-span-7">
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 md:p-12 shadow-2xl shadow-indigo-900/5 border border-gray-100 relative overflow-hidden">
              
              {/* Glowing Orb Background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              
              <form className="relative z-10 flex flex-col gap-5 sm:gap-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
                  
                  {/* Name Input */}
                  <div className="space-y-2">
                    {/* 🚀 A11Y FIX: Linked label to input via htmlFor and id */}
                    <label htmlFor="name" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Your Name</label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      autoComplete="name"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-gray-900 placeholder-gray-400 text-sm sm:text-base"
                    />
                  </div>
                  
                  {/* Email Input */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-gray-900 placeholder-gray-400 text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Message Input */}
                <div className="space-y-2">
                  <label htmlFor="message" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    autoComplete="off"
                    placeholder="How can we help you?"
                    rows="5"
                    value={form.message}
                    onChange={handleChange}
                    className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-gray-900 placeholder-gray-400 resize-none text-sm sm:text-base"
                  />
                </div>

                {/* Status Messages */}
                {status === "success" && (
                  <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-center font-medium border border-emerald-100 text-sm animate-in fade-in slide-in-from-top-2">
                    Message sent successfully! We'll be in touch soon.
                  </div>
                )}
                {error && (
                  <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-center font-medium border border-rose-100 text-sm animate-in fade-in zoom-in-95">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-2 w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-indigo-600 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {/* 🚀 UX FIX: Added spinner for native feel */}
                  {status === "sending" ? (
                    <><FiLoader className="animate-spin" /> Sending...</>
                  ) : (
                    <>Send Message <FiSend /></>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FOOTER MESSAGE */}
        <div className="text-center mt-20 sm:mt-24 max-w-2xl mx-auto border-t border-gray-100 pt-12 sm:pt-16">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">Built for readers who appreciate depth.</h3>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-500">JK Ithaguru is where premium stories live.</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;