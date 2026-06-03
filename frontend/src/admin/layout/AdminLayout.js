import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default function AdminLayout() {
  // 🚀 THE FIX: Dynamically set the default state based on screen size!
  // Desktop screens start OPEN (true). Mobile screens start CLOSED (false).
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // We check if window exists to prevent errors during any server-side rendering
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return false;
  });
  
  const location = useLocation();

  // 🚀 UX OPTIMIZATION: Automatically close the mobile sidebar on navigation.
  useEffect(() => {
    // Only auto-close the sidebar if the user is on a small screen!
    if (window.innerWidth < 1024) {
      setSidebarOpen(false); 
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-gray-900 font-sans overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Mobile Drawer Shade Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true" 
        />
      )}

      {/* Sidebar Component */}
      <AdminSidebar 
        open={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Topbar Frame Link */}
        <AdminTopbar 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          sidebarOpen={sidebarOpen}
        />

        {/* Scrollable Page View Boundary */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 scroll-smooth focus:outline-none" tabIndex="-1">
          <div className="max-w-7xl mx-auto min-h-full">
            <Outlet />
          </div>
        </main>
        
      </div>
    </div>
  );
}