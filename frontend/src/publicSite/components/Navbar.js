import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { FiMenu, FiX, FiUser, FiLogOut, FiChevronDown } from "react-icons/fi";
import { useAuth } from "../../auth/PublicAuthContext";
import GoogleLoginButton from "../../auth/GoogleLoginButton";
import Logo from "../../assets/logo.jpeg";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false); // 🔹 NEW: Separate state for mobile profile panel
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { isLoggedIn, user, logout } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    
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

  // 🔹 Helper functions to ensure menus don't overlap
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    setProfileOpen(false);
  };

  const toggleProfile = () => {
    setProfileOpen(!profileOpen);
    setMenuOpen(false);
  };

  const closeAllMenus = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const isTransparent = isHome && !scrolled;
  const navClasses = isTransparent
    ? "bg-transparent text-white border-transparent"
    : "bg-white/95 backdrop-blur-md shadow-sm text-gray-900 border-gray-100";

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-4 md:px-12 py-3 border-b ${navClasses}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* BRAND */}
          <Link to="/" className="flex items-center gap-2 z-50" onClick={closeAllMenus}>
            <div className={`h-9 w-9 rounded-xl overflow-hidden shadow-sm ${isTransparent ? 'border-2 border-white/20' : 'border border-gray-200'}`}>
              <img src={Logo} alt="JK Ithaguru" className="h-full w-full object-cover" />
            </div>
            <span className="font-serif text-lg md:text-2xl font-black tracking-tight whitespace-nowrap">
              JK Ithaguru<span className="text-indigo-500">.</span>
            </span>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <div className="hidden md:flex items-center gap-8 text-sm font-bold tracking-wide uppercase">
            {['Home', 'Contact'].map((item) => (
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

          {/* INTERACTION CORNER */}
          <div className="flex items-center gap-2">
            
            {/* 🖥️ DESKTOP LOGGED IN HUB */}
            {isLoggedIn && (
              <div className="hidden md:block relative" ref={dropdownRef}>
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
                  
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden transition-all ${isTransparent ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {user?.picture ? (
                      <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <FiUser size={18} />
                    )}
                  </div>
                  <FiChevronDown className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                </button>

                {/* DESKTOP DROPDOWN CARD */}
                <div 
                  className={`
                    absolute right-0 top-full mt-4 w-72 
                    bg-white rounded-2xl shadow-2xl border border-gray-100 
                    transform transition-all duration-200 origin-top-right overflow-hidden
                    ${dropdownOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'}
                  `}
                >
                  <div className="p-6 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Signed in as</p>
                    <p className="text-gray-900 font-bold text-lg leading-tight truncate">{user?.name}</p>
                    <p className="text-gray-500 text-xs font-medium truncate">{user?.email}</p>
                  </div>
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

            {/* DESKTOP LOGGED OUT BUTTON */}
            {!isLoggedIn && (
              <div className="hidden md:block w-[150px]">
                <GoogleLoginButton elementId="google-desktop-nav" size="medium" />
              </div>
            )}

            {/* 📱 MOBILE LOGGED IN AVATAR (Now acts as a direct link to User Details only) */}
            {isLoggedIn && (
              <button
                onClick={toggleProfile}
                className={`block md:hidden w-8 h-8 rounded-full overflow-hidden mr-1 border transition-transform ${profileOpen ? 'scale-110 border-indigo-500' : isTransparent ? 'border-white/20' : 'border-gray-200'}`}
              >
                {user?.picture ? (
                  <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-600">
                    <FiUser size={16} />
                  </div>
                )}
              </button>
            )}

            {/* MOBILE LOGGED OUT BUTTON */}
            {!isLoggedIn && (
              <div className="block md:hidden w-[140px] transform scale-90 origin-right mr-1">
                <GoogleLoginButton elementId="google-mobile-header" size="medium" />
              </div>
            )}

            {/* HAMBURGER TOGGLE BUTTON */}
            <button
              onClick={toggleMenu}
              className="block md:hidden text-2xl p-2 focus:outline-none z-50"
            >
              {menuOpen ? <FiX className="text-gray-900" /> : <FiMenu />}
            </button>

          </div>
        </div>
      </nav>

      {/* ================= 📱 MENU OVERLAY 1: MAIN SITE NAVIGATION LINKS ONLY ================= */}
      <div className={`fixed inset-0 z-40 bg-white transition-transform duration-300 ease-in-out flex flex-col pt-24 px-6 ${menuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex flex-col items-center gap-6 text-2xl font-black mt-10">
          <Link to="/" onClick={closeAllMenus} className="text-gray-900 hover:text-indigo-600 transition-colors">Home</Link>
          <Link to="/contact" onClick={closeAllMenus} className="text-gray-900 hover:text-indigo-600 transition-colors">Contact</Link>
        </div>
      </div>

      {/* ================= 📱 MENU OVERLAY 2: ACCOUNT / PROFILE OVERLAY ONLY ================= */}
      <div className={`fixed inset-0 z-40 bg-white transition-transform duration-300 ease-in-out flex flex-col pt-24 px-6 ${profileOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="w-full max-w-sm mx-auto my-auto">
          {isLoggedIn && (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center shadow-xl">
              <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 bg-indigo-100 flex items-center justify-center border-2 border-indigo-200">
                {user?.picture ? (
                  <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-xl text-indigo-600">{user?.name?.charAt(0)}</span>
                )}
              </div>
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Signed in as</p>
              <p className="text-xl font-black text-gray-900 truncate leading-tight mb-1">{user?.name}</p>
              <p className="text-sm text-gray-500 truncate mb-6">{user?.email}</p>
              
              <button 
                onClick={() => { logout(); closeAllMenus(); }} 
                className="w-full py-3 bg-white border border-gray-200 text-red-600 font-bold rounded-xl shadow-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <FiLogOut /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;