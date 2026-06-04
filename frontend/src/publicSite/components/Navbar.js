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
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [menuOpen]);

  const closeAll = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const navClasses =
    isHome && !scrolled
      ? "bg-transparent text-white"
      : "bg-white/95 backdrop-blur-md shadow-sm text-gray-900 border-b border-gray-100";

  const linkStyles = ({ isActive }) => 
    `transition-colors hover:text-indigo-500 ${isActive ? "text-indigo-600 font-black" : ""}`;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navClasses} ${
          scrolled ? "py-2" : "py-3"
        } px-4 md:px-12`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 shrink-0" onClick={closeAll}>
            <img
              src={Logo}
              className="h-8 w-8 md:h-9 md:w-9 rounded-xl object-cover"
              alt="JK Ithaguru logo"
            />
            {/* 🚀 UX FIX: Text is now visible on mobile at a slightly smaller scale */}
            <span className="font-serif font-black text-[15px] sm:text-base md:text-xl tracking-tight">
              JK Ithaguru.
            </span>
          </Link>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">

            {/* DESKTOP NAV LINKS */}
            <div className="hidden md:flex gap-8 font-bold text-xs uppercase tracking-wider">
              <NavLink to="/" className={linkStyles}>Home</NavLink>
              <NavLink to="/contact" className={linkStyles}>Contact</NavLink>
            </div>

            {/* GOOGLE LOGIN */}
            {!isLoggedIn && (
              <div className="flex items-center">
                {/* 🚀 Explicitly tell it to use the small navbar styling */}
                <GoogleLoginButton 
                  variant="navbar" 
                  onSuccess={closeAll} 
                />
              </div>
            )}

            {/* PROFILE */}
            {isLoggedIn && (
              <div className="relative z-50" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-indigo-50 border border-indigo-100 overflow-hidden hover:ring-2 ring-indigo-500 ring-offset-2 transition-all flex items-center justify-center shrink-0"
                >
                  {user?.picture ? (
                    <img src={user.picture} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <FiUser className="w-full h-full p-2 text-indigo-600" />
                  )}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white shadow-2xl border border-gray-100 rounded-2xl p-5 z-[9999] animate-in fade-in slide-in-from-top-2">
                    <div className="mb-5 text-center">
                      <p className="text-[10px] tracking-widest text-gray-400 uppercase mb-1">Signed in as</p>
                      <p className="font-bold text-gray-900 truncate">{user?.name || "Reader"}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-100"
                    >
                      <FiLogOut />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* MOBILE HAMBURGER */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-2xl p-1 sm:p-2 flex-shrink-0 hover:opacity-70 transition-opacity text-gray-900"
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE DARK OVERLAY */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={closeAll}
        />
      )}

      {/* MOBILE SIDE DRAWER */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-white z-[999] shadow-2xl border-l border-gray-100 transition-transform duration-300 ease-out flex flex-col ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
            <span className="font-serif font-black text-xl text-gray-900">Menu</span>
            <button onClick={closeAll} className="text-2xl text-gray-500 hover:text-gray-900">
              <FiX />
            </button>
          </div>

          <div className="flex flex-col gap-6 text-xl font-bold tracking-tight text-gray-800">
            <NavLink to="/" onClick={closeAll} className={linkStyles}>
              Home
            </NavLink>
            <NavLink to="/contact" onClick={closeAll} className={linkStyles}>
              Contact
            </NavLink>
          </div>
          
          {/* 🚀 UX FIX: Button completely removed from slider! */}
        </div>
      </div>
    </>
  );
};

export default Navbar;