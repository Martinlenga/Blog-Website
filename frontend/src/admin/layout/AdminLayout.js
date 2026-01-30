import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import { AdminProvider } from "../context/AdminContext";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <AdminProvider>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <AdminSidebar open={sidebarOpen} />

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Topbar */}
          <AdminTopbar toggleSidebar={toggleSidebar} />

          {/* Page content */}
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminProvider>
  );
}
