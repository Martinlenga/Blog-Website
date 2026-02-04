// Footer.js
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-50 text-gray-700 mt-6">
  <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="flex flex-col items-start space-y-1">
      <h3 className="text-xl font-bold text-indigo-600">YourBlog</h3> {/* increased from text-lg */}
      <p className="text-gray-500 text-sm md:text-base">Thoughtful writing for modern living.</p> {/* added md:text-base */}
    </div>

    <div className="flex flex-col space-y-1">
      <h4 className="text-gray-900 text-sm md:text-base font-semibold uppercase mb-1">Quick Links</h4> {/* increased */}
      <div className="flex flex-wrap gap-2 text-sm md:text-base"> {/* increased */}
        <a href="/" className="hover:text-indigo-600 transition">Home</a>
        <a href="/about" className="hover:text-indigo-600 transition">About</a>
        <a href="/blog" className="hover:text-indigo-600 transition">Blog</a>
        <a href="/contact" className="hover:text-indigo-600 transition">Contact</a>
      </div>
    </div>

    <div className="flex flex-col items-start space-y-1">
      <h4 className="text-gray-900 text-sm md:text-base font-semibold uppercase mb-1">Follow Us</h4> {/* increased */}
      <div className="flex gap-3 text-gray-600 text-lg md:text-xl"> {/* increased */}
        <a href="#" className="hover:text-indigo-600"><FaFacebookF /></a>
        <a href="#" className="hover:text-indigo-600"><FaTwitter /></a>
        <a href="#" className="hover:text-indigo-600"><FaInstagram /></a>
      </div>
    </div>
  </div>

  <div className="border-t border-gray-200 mt-4 py-3 text-center text-gray-500 text-sm md:text-base">
    © {new Date().getFullYear()} YourBlog. All rights reserved.
  </div>
</footer>

  );
};

export default Footer;
