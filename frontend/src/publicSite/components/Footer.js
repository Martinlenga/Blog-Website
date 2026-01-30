import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-50 text-gray-800 mt-6">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-indigo-600 tracking-wide">YourBlog</h3>
          <p className="text-gray-500 text-sm">Thoughtful writing for modern living.</p>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-gray-900 text-sm font-semibold uppercase tracking-widest">Quick Links</h4>
          <div className="flex flex-col space-y-2">
            <a href="/" className="hover:text-indigo-600 transition">Home</a>
            <a href="/about" className="hover:text-indigo-600 transition">About</a>
            <a href="/blog" className="hover:text-indigo-600 transition">Blog</a>
            <a href="/reviews" className="hover:text-indigo-600 transition">Reviews</a>
            <a href="/faq" className="hover:text-indigo-600 transition">FAQ</a>
            <a href="/contact" className="hover:text-indigo-600 transition">Contact</a>
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-3">
          <h4 className="text-gray-900 text-sm font-semibold uppercase tracking-widest">Follow Us</h4>
          <div className="flex items-center gap-4 text-xl text-gray-700">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition">
              <FaFacebookF />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition">
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 mt-8 py-4 text-center text-gray-500 text-xs">
        © {new Date().getFullYear()} YourBlog. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
