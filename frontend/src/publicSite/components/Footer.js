import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { FiArrowUp } from "react-icons/fi";
import { Link } from "react-router-dom";

const Footer = () => {
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      {/* Reduced max-width to 6xl to bring the edges closer to the center */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-12 pb-8">
        
        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          
          {/* 1. LEFT: Brand & Tagline */}
          <div className="flex flex-col items-start justify-center">
            <h3 className="font-serif text-2xl font-bold text-gray-900 tracking-tight">
              JK Ithaguru<span className="text-indigo-600">.</span>
            </h3>
            <p className="text-gray-500 text-sm mt-3 max-w-xs leading-relaxed">
              Thoughtful writing for modern living. Stories that matter, perspectives that challenge, and insights that inspire.
            </p>
          </div>

          {/* 2. CENTER: Quick Links (Font Size Increased) */}
          <div className="flex flex-col md:items-center justify-center">
            <h4 className="text-gray-900 text-xs font-bold uppercase tracking-widest mb-4">
              Quick Links
            </h4>
            {/* Increased font size to text-base and bold */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 justify-center">
              {['Home', 'Blog', 'About', 'Contact'].map((item) => (
                <Link 
                  key={item}
                  to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                  className="text-base text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* 3. RIGHT: Social Connect (Brought closer via max-w-6xl) */}
          <div className="flex flex-col md:items-end justify-center">
            <h4 className="text-gray-900 text-xs font-bold uppercase tracking-widest mb-4">
              Connect With Us
            </h4>
            <div className="flex gap-3">
              {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, index) => (
                <a 
                  key={index} 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-indigo-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* BOTTOM BAR: Centered Copyright + Elaborate Back to Top */}
        <div className="relative border-t border-gray-100 pt-8 flex items-center justify-center">
          
          {/* Centered Copyright */}
          <p className="text-gray-400 text-sm font-medium">
            © {new Date().getFullYear()} JK Ithaguru. All rights reserved.
          </p>

          {/* ELABORATE BACK TO TOP BUTTON */}
          <button 
            onClick={scrollToTop}
            className="absolute right-0 top-5 group flex items-center gap-2 bg-white border border-gray-200 hover:border-indigo-600 text-gray-600 hover:text-indigo-600 px-5 py-2.5 rounded-full shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            title="Scroll to Top"
          >
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline-block">
              Top
            </span>
            <div className="w-5 h-5 rounded-full bg-gray-100 group-hover:bg-indigo-50 flex items-center justify-center transition-colors">
              <FiArrowUp className="text-xs" />
            </div>
          </button>

        </div>

      </div>
    </footer>
  );
};

export default Footer;