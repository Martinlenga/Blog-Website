import { FaFacebookF } from "react-icons/fa";
import { FiArrowUp } from "react-icons/fi";
import { Link } from "react-router-dom";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">
        
        {/* MAIN GRID: Centered on mobile, aligned on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 text-center md:text-left">
          
          {/* 1. LEFT: Brand & Tagline */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-serif text-2xl font-bold text-gray-900 tracking-tight">
              JK Ithaguru<span className="text-indigo-600">.</span>
            </h3>
            <p className="text-gray-500 text-sm mt-3 max-w-xs leading-relaxed">
              Thoughtful writing for modern living. Stories that matter, perspectives that challenge, and insights that inspire.
            </p>
          </div>

          {/* 2. CENTER: Quick Links */}
          <div className="flex flex-col items-center">
            <h4 className="text-gray-900 text-xs font-bold uppercase tracking-widest mb-4">
              Quick Links
            </h4>
            <div className="flex flex-col md:flex-row gap-4 md:gap-8">
              {['Home', 'Contact'].map((item) => (
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

          {/* 3. RIGHT: Social */}
          <div className="flex flex-col items-center md:items-end">
            <h4 className="text-gray-900 text-xs font-bold uppercase tracking-widest mb-4">
              Connect
            </h4>
            <a 
              href="https://web.facebook.com/IthaguruJK/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-indigo-600 hover:text-white transition-all duration-300"
            >
              <FaFacebookF size={16} />
            </a>
          </div>
        </div>

        {/* BOTTOM BAR: Now using Flex Wrap for mobile safety */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <p className="text-gray-400 text-sm font-medium order-2 md:order-1">
            © {new Date().getFullYear()} JK Ithaguru. All rights reserved.
          </p>

          <button 
            onClick={scrollToTop}
            className="order-1 md:order-2 group flex items-center gap-2 bg-white border border-gray-200 hover:border-indigo-600 text-gray-600 hover:text-indigo-600 px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all"
          >
            <span className="text-xs font-bold uppercase tracking-wider">Top</span>
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