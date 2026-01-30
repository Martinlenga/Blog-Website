import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Menu } from "lucide-react";
import { useAdmin } from "../context/AdminContext";

export default function AdminTopbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  const { profile, loading } = useAdmin();
  const [error, setError] = useState("");

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  // 🔹 Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_access");
    localStorage.removeItem("admin_refresh");
    localStorage.removeItem("admin_profile");
    navigate("/admin/login");
  };

  return (
    <header className="bg-white shadow px-6 py-3 flex items-center justify-between">
      {/* Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded hover:bg-gray-200"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Title */}
      <h1 className="text-lg font-bold">Admin Panel</h1>

      {/* Profile dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="flex items-center gap-3 p-2 rounded hover:bg-gray-200"
          aria-label="Admin profile menu"
        >
          {loading ? (
            <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
          ) : (
            <img
              src={profile.profileImage}
              alt="profile"
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          {!loading && <span className="text-sm font-medium">{profile.username}</span>}
          <ChevronDown size={16} />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg z-50 border">
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => navigate("/admin/my-account/profile")}
            >
              Profile
            </button>

            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => navigate("/admin/my-account/change-password")}
            >
              Change Password
            </button>

            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-red-600"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="absolute top-16 right-6 bg-red-100 text-red-800 px-4 py-2 rounded">
          {error}
        </div>
      )}
    </header>
  );
}
