import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { Home, FileText, DollarSign, MessageSquare, Folder } from "lucide-react";

export default function AdminSidebar({ open = true }) {
  // Restore sections state from localStorage
  const storedSections = JSON.parse(localStorage.getItem("sidebar_sections") || "{}");
  const [sections, setSections] = useState({
    dashboard: true,
    posts: false,
    payments: false,
    feedback: false,
    system: false,
    ...storedSections,
  });

  const toggleSection = (key) => {
    const newSections = { ...sections, [key]: !sections[key] };
    setSections(newSections);
    localStorage.setItem("sidebar_sections", JSON.stringify(newSections));
  };

  const menu = [
    { key: "dashboard", label: "Dashboard", icon: Home, items: [{ label: "Overview", path: "/admin/dashboard/overview" }] },
    { key: "posts", label: "Posts", icon: FileText, items: [{ label: "All Posts", path: "/admin/posts" }] },
    { key: "payments", label: "Payments", icon: DollarSign, 
        items: [{ label: "Transactions", path: "/admin/payments" },{ label: "Financial Trends", path: "/admin/payments/trends" },]},
    { key: "feedback", label: "Feedback", icon: MessageSquare, 
    items: [{ label: "Reviews", path: "/admin/feedback" },{ label: "Analytics", path: "/admin/feedback/analytics" },]},

    { key: "system", label: "System", icon: Folder, items: [{ label: "Audit Logs", path: "/admin/system/audit-logs" }] },
  ];

  return (
    <aside
      className={`bg-gray-800 text-gray-200 min-h-screen flex flex-col transition-all duration-300 ${
        open ? "w-64" : "w-16"
      }`}
      aria-label="Admin Sidebar"
    >
      <div className="p-6 text-xl font-bold border-b border-gray-700">
        {open && "Admin Panel"}
      </div>

      <nav className="flex-1">
        {menu.map((section) => (
          <div key={section.key}>
            <button
              onClick={() => toggleSection(section.key)}
              className="w-full flex items-center justify-between px-6 py-3 hover:bg-gray-700 focus:outline-none"
              aria-label={`Toggle ${section.label} section`}
            >
              <div className="flex items-center gap-2">
                <section.icon size={18} />
                {open && <span>{section.label}</span>}
              </div>
              {open && <span>{sections[section.key] ? "−" : "+"}</span>}
            </button>

            {sections[section.key] && open && (
              <div className="flex flex-col ml-8">
                {section.items.map((item, idx) => (
                  <NavLink
                    key={idx}
                    to={item.path}
                    end
                    className={({ isActive }) =>
                      `px-4 py-2 text-sm hover:text-white hover:bg-gray-700 rounded ${
                        isActive ? "bg-gray-700 text-white" : "text-gray-300"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
