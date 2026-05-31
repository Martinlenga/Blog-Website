import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-gray-900 font-sans overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Mobile Drawer Shade Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Component - Added toggleSidebar prop */}
      <AdminSidebar 
        open={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        closeMobileSidebar={() => setSidebarOpen(false)} 
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Topbar Frame Link */}
        <AdminTopbar 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          sidebarOpen={sidebarOpen}
        />

        {/* Scrollable Page View Boundary */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto min-h-full">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}