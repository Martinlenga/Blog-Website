import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Menu, User, Settings, Bell } from "lucide-react";
import { useAdmin } from "../context/AdminContext";

export default function AdminTopbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const { admin, logout, loading } = useAdmin();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    // 📱 Scaled internal layout tracking metrics down on small screens (px-4 to px-8)
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between transition-all duration-300">
      
      {/* LEFT: Sidebar Toggle Trigger Button */}
      <div>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors outline-none"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} strokeWidth={2} />
        </button>
      </div>

      {/* RIGHT: Actions Profile Dropdown Menus */}
      <div className="flex items-center gap-4 sm:gap-6" ref={dropdownRef}>
        
        {/* Notification Bell */}
        <button className="relative text-gray-400 hover:text-indigo-600 transition-colors p-1">
          <Bell size={20} strokeWidth={2} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Divider Grid Segment */}
        <div className="h-6 w-[1px] bg-gray-200"></div>

        {/* Profile Action Hub Container */}
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 sm:gap-3 group focus:outline-none"
          >
            {/* User Meta Summary Nameplate */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-none group-hover:text-indigo-600 transition-colors">
                {loading || !admin ? "Loading..." : (admin.first_name || admin.username)}
              </p>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-1">
                Admin
              </p>
            </div>

            {/* Avatar Badge Image Box */}
            {loading || !admin ? (
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-full animate-pulse" />
            ) : (
              <img
                src={admin.profileImage || "https://ui-avatars.com/api/?name=Admin"}
                alt="profile"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-100 shadow-sm group-hover:shadow-md transition-all"
              />
            )}
            
            <ChevronDown 
              size={14} 
              className={`text-gray-400 transition-transform duration-300 ${dropdownOpen ? "rotate-180 text-indigo-600" : "group-hover:text-gray-600"}`} 
            />
          </button>

          {/* Elegant Floating Dropdown Menu Panel */}
          {dropdownOpen && (
            <div className="absolute right-0 top-14 w-56 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right z-50">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Signed in as</p>
                <p className="text-sm font-bold text-gray-900 truncate mt-0.5">{admin?.email || "admin@jk.com"}</p>
              </div>

              <div className="p-1 space-y-0.5">
                <button
                  className="w-full text-left px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg flex items-center gap-3 transition-colors"
                  onClick={() => { navigate("/admin/my-account/profile"); setDropdownOpen(false); }}
                >
                  <User size={16} /> My Profile
                </button>

                <button
                  className="w-full text-left px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg flex items-center gap-3 transition-colors"
                  onClick={() => { navigate("/admin/my-account/change-password"); setDropdownOpen(false); }}
                >
                  <Settings size={16} /> Settings
                </button>
              </div>

              <div className="h-[1px] bg-gray-100 my-1 mx-2"></div>

              <div className="p-1">
                <button
                  className="w-full text-left px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-3 transition-colors"
                  onClick={() => { logout(); setDropdownOpen(false); }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}