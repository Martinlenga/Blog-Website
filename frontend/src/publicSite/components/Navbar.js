import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../../auth/PublicAuthContext";
import GoogleLoginButton from "../../auth/GoogleLoginButton";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();

  const links = [
    { name: "Home", to: "/" },
    { name: "About", to: "/about" },
    { name: "Blog", to: "/blog" },
    { name: "Contact", to: "/contact" },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="text-xl font-extrabold tracking-tight text-indigo-600">
          YourBlog
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) =>
                `pb-1 transition ${
                  isActive
                    ? "border-b-2 border-indigo-600 text-indigo-600"
                    : "hover:text-indigo-600"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Right side (Auth) */}
        <div className="hidden md:flex items-center gap-4">
          {!isLoggedIn ? (
            <GoogleLoginButton />
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Hi, <strong>{user?.name || "Reader"}</strong>
              </span>
              <button
                onClick={logout}
                className="text-sm px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-2xl text-gray-800"
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="flex flex-col px-6 py-4 space-y-4">
            {links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? "text-indigo-600 font-semibold"
                    : "text-gray-800"
                }
              >
                {link.name}
              </NavLink>
            ))}

            {/* Mobile Auth */}
            <div className="pt-4 border-t">
              {!isLoggedIn ? (
                <GoogleLoginButton />
              ) : (
                <button
                  onClick={logout}
                  className="w-full text-sm py-2 rounded-md border border-gray-300"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
