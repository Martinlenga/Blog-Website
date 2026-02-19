import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { FiMenu, FiX, FiUser, FiLogOut, FiChevronDown } from "react-icons/fi";
import { useAuth } from "../../auth/PublicAuthContext";
import GoogleLoginButton from "../../auth/GoogleLoginButton";
import Logo from "../../assets/logo.jpeg";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); // New State for Desktop Dropdown

  const { isLoggedIn, user, logout } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === "/";
  
  // Ref to handle clicking outside the dropdown to close it
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  // Dynamic Styles
  const isTransparent = isHome && !scrolled;
  const navClasses = isTransparent
    ? "bg-transparent text-white border-transparent"
    : "bg-white/90 backdrop-blur-md shadow-sm text-gray-900 border-gray-100";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-6 md:px-12 py-4 border-b ${navClasses}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* BRAND */}
          <Link to="/" className="flex items-center gap-3 z-50" onClick={closeMenu}>
            <div className={`h-10 w-10 md:h-11 md:w-11 rounded-xl overflow-hidden shadow-sm ${isTransparent ? 'border-2 border-white/20' : 'border border-gray-200'}`}>
              <img src={Logo} alt="JK Ithaguru" className="h-full w-full object-cover" />
            </div>
            <span className="font-serif text-xl md:text-2xl font-black tracking-tight">
              JK Ithaguru<span className="text-indigo-500">.</span>
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-8 text-sm font-bold tracking-wide uppercase">
            {['Home', 'Blog', 'About', 'Contact'].map((item) => (
              <NavLink
                key={item}
                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                className={({ isActive }) =>
                  `relative px-1 py-1 transition-all hover:text-indigo-500 ${
                    isActive ? "text-indigo-500 after:w-full" : "after:w-0"
                  } after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-indigo-500 after:transition-all after:duration-300`
                }
              >
                {item}
              </NavLink>
            ))}
          </div>

          {/* DESKTOP AUTH (UPDATED) */}
          <div className="hidden md:flex items-center gap-4">
            {!isLoggedIn ? (
              <div className="w-[160px] transform scale-95 origin-right">
                <GoogleLoginButton elementId="google-btn-desktop" />
              </div>
            ) : (
              // DROP DOWN CONTAINER
              <div className="relative" ref={dropdownRef}>
                
                {/* 1. The Trigger Button (Avatar + Name) */}
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-3 pl-6 border-l transition-all ${isTransparent ? 'border-white/20 hover:text-indigo-300' : 'border-gray-200 hover:text-indigo-600'}`}
                >
                  <div className="text-right">
                    <span className={`block text-xs font-bold uppercase tracking-wider ${isTransparent ? 'text-gray-300' : 'text-gray-400'}`}>
                      Account
                    </span>
                    <span className="block text-sm font-bold">
                      {user?.name?.split(" ")[0]}
                    </span>
                  </div>
                  
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isTransparent ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {user?.picture ? (
                       <img src={user.picture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                       <FiUser size={18} />
                    )}
                  </div>
                  
                  <FiChevronDown className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                </button>

                {/* 2. The Dropdown Card (Matches Mobile Style) */}
                {/* Absolute position puts it right below the button */}
                <div 
                  className={`
                    absolute right-0 top-full mt-4 w-72 
                    bg-white rounded-2xl shadow-2xl border border-gray-100 
                    transform transition-all duration-200 origin-top-right overflow-hidden
                    ${dropdownOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'}
                  `}
                >
                   {/* Header Section */}
                   <div className="p-6 bg-gray-50 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Signed in as</p>
                      <p className="text-gray-900 font-bold text-lg leading-tight truncate">{user?.name}</p>
                      <p className="text-gray-500 text-xs font-medium truncate">{user?.email}</p>
                   </div>

                   {/* Actions */}
                   <div className="p-4">
                      <button 
                        onClick={() => { logout(); setDropdownOpen(false); }}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-100 transition-all shadow-sm"
                      >
                        <FiLogOut /> Logout
                      </button>
                   </div>
                </div>

              </div>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden text-2xl p-2 rounded-lg transition-colors z-50 ${menuOpen ? 'text-gray-900' : 'inherit'}`}
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>

      {/* ================= MOBILE MENU OVERLAY ================= */}
      <div 
        className={`fixed inset-0 z-40 bg-white/95 backdrop-blur-3xl transition-transform duration-500 ease-[cubic-bezier(0.85,0,0.15,1)] overflow-y-auto ${
          menuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="min-h-screen flex flex-col pt-24 pb-10 px-6">
          
          {/* Navigation Links */}
          <div className="flex flex-col items-center gap-6 mb-8 mt-4">
            {['Home', 'Blog', 'About', 'Contact'].map((item) => (
              <NavLink
                key={item}
                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `text-3xl font-black tracking-tight transition-colors ${
                    isActive ? "text-indigo-600" : "text-gray-900 hover:text-indigo-600"
                  }`
                }
              >
                {item}
              </NavLink>
            ))}
          </div>

          {/* MOBILE AUTH SECTION */}
          <div className="w-full max-w-sm mx-auto border-t border-gray-100 pt-8 mt-auto">
            {!isLoggedIn ? (
              <div className="flex flex-col gap-4 text-center">
                <p className="text-sm text-gray-500 mb-2">Sign in to unlock premium articles</p>
                <div className="w-full flex justify-center">
                  <GoogleLoginButton elementId="google-btn-mobile" />
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xl font-bold">
                    {user?.name?.charAt(0) || <FiUser />}
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Signed in as</p>
                    <p className="text-lg font-bold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => { logout(); closeMenu(); }}
                  className="w-full py-3 bg-white border border-gray-200 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-100 transition-all flex items-center justify-center gap-2"
                >
                  <FiLogOut /> Logout
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </>
  );
};

export default Navbar;