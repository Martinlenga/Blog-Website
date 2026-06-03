import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // 🚀 UX OPTIMIZATION: Automatically close the mobile sidebar whenever the user 
  // navigates to a new page. This eliminates the need to manually pass close functions 
  // to every single Navigation Link inside the Sidebar component.
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-gray-900 font-sans overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Mobile Drawer Shade Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true" // 🔹 a11y: Tells screen readers to ignore this purely visual backdrop
        />
      )}

      {/* Sidebar Component */}
      <AdminSidebar 
        open={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        // We can safely remove closeMobileSidebar prop now since the useEffect handles it!
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