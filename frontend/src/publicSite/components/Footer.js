import { FaFacebookF } from "react-icons/fa";
import { FiArrowUp } from "react-icons/fi";
import { Link } from "react-router-dom";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      {/* 🔹 FIX: Updated max-w to match the 7xl standard used in your other components */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        
        {/* MAIN GRID: Left-aligned for editorial sharpness on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-center md:text-left">
          
          {/* 1. BRANDING (Takes up half the space on desktop for visual weight) */}
          <div className="md:col-span-2 flex flex-col items-center md:items-start">
            <h3 className="font-serif text-3xl font-bold text-gray-900 tracking-tight mb-4">
              JK Ithaguru<span className="text-indigo-600">.</span>
            </h3>
            <p className="text-gray-500 text-base max-w-sm leading-relaxed">
              Thoughtful writing for modern living. Stories that matter, perspectives that challenge, and insights that inspire.
            </p>
          </div>

          {/* 2. NAVIGATION (Stacked cleanly) */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-gray-900 text-[10px] font-extrabold uppercase tracking-widest mb-6">
              Navigation
            </h4>
            <div className="flex flex-col gap-3">
              {[
                { name: 'Home', path: '/' },
                //{ name: 'Articles', path: '/blog' },
                //{ name: 'About', path: '/about' },
                { name: 'Contact', path: '/contact' }
              ].map((item) => (
                <Link 
                  key={item.name}
                  to={item.path}
                  className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* 3. CONNECT */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-gray-900 text-[10px] font-extrabold uppercase tracking-widest mb-6">
              Connect
            </h4>
            <div className="flex gap-4">
              <a 
                href="https://web.facebook.com/IthaguruJK/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                aria-label="Facebook"
              >
                <FaFacebookF size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider order-2 md:order-1">
            © {new Date().getFullYear()} JK Ithaguru. All rights reserved.
          </p>

          {/* 🔹 FIX: Refined the Back to Top button into a sleek, minimalist action */}
          <button 
            onClick={scrollToTop}
            className="order-1 md:order-2 group flex items-center gap-3 text-gray-400 hover:text-indigo-600 transition-colors focus:outline-none"
          >
            <span className="text-[10px] font-extrabold uppercase tracking-widest">Back to top</span>
            <div className="w-8 h-8 rounded-full border border-gray-200 group-hover:border-indigo-200 group-hover:bg-indigo-50 flex items-center justify-center transition-all">
              <FiArrowUp size={14} className="group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>
        </div>

      </div>
    </footer>
  );
};

export default Footer;