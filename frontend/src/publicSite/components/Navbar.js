import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { FiMenu, FiX, FiUser, FiLogOut } from "react-icons/fi";
import { useAuth } from "../../auth/PublicAuthContext";
import GoogleLoginButton from "../../auth/GoogleLoginButton";
import Logo from "../../assets/logo.jpeg";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef(null);

  const { isLoggedIn, user, logout } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeAll = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const navClasses = (isHome && !scrolled) 
    ? "bg-transparent text-white" 
    : "bg-white/95 backdrop-blur-md shadow-sm text-gray-900 border-b border-gray-100";

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 px-4 md:px-12 py-3 transition-all ${navClasses}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0" onClick={closeAll}>
            <img src={Logo} alt="Logo" className="h-9 w-9 rounded-xl object-cover" />
            <span className="font-serif text-lg md:text-2xl font-black whitespace-nowrap">JK Ithaguru.</span>
          </Link>

          <div className="flex items-center gap-4 relative">
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8 font-bold uppercase text-xs">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/contact">Contact</NavLink>
            </div>

            {/* Always visible Sign In Button (for both Desktop & Mobile) */}
            {!isLoggedIn && (
              <div className="block">
                <GoogleLoginButton elementId="google-nav" />
              </div>
            )}

            {/* Profile Dropdown (Only when logged in) */}
            {isLoggedIn && (
              <div className="relative" ref={profileRef}>
                <button onClick={() => setProfileOpen(!profileOpen)} className="w-9 h-9 rounded-full bg-gray-200 border border-gray-300 overflow-hidden flex items-center justify-center hover:ring-2 ring-indigo-500 transition-all">
                  {user?.picture ? <img src={user.picture} alt="P" className="w-full h-full object-cover" /> : <FiUser className="text-xl" />}
                </button>
                
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 z-50">
                    <div className="text-center mb-4">
                      <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Signed in as</p>
                      <p className="font-black text-gray-900 truncate">{user?.name}</p>
                      <p className="text-gray-600 text-xs truncate">{user?.email}</p>
                    </div>
                    <button 
                      onClick={() => { logout(); setProfileOpen(false); }} 
                      className="w-full py-2.5 bg-red-50 text-red-600 border border-red-100 font-bold text-sm rounded-xl hover:bg-red-100 flex items-center justify-center gap-2 shadow-sm transition-colors"
                    >
                      <FiLogOut /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Hamburger Menu Trigger */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="block md:hidden text-2xl z-50">
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE SIDE DRAWER */}
      <div className={`fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl transition-transform duration-300 ease-out border-l border-gray-100 ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-10">
            <span className="font-black text-xl">Menu</span>
            <button onClick={() => setMenuOpen(false)} className="text-2xl"><FiX /></button>
          </div>
          <div className="flex flex-col gap-6 text-xl font-bold">
            <NavLink to="/" onClick={closeAll}>Home</NavLink>
            <NavLink to="/contact" onClick={closeAll}>Contact</NavLink>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;