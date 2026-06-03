import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { 
  Home, FileText, DollarSign, MessageSquare, Folder, 
  ChevronDown, Activity 
} from "lucide-react";

// Removed the obsolete closeMobileSidebar prop
export default function AdminSidebar({ open = false, toggleSidebar }) {
  const location = useLocation();
  
  // 🚀 PERFORMANCE FIX: Lazy initialization (the arrow function) ensures we 
  // only parse localStorage once on mount, not on every single render cycle.
  const [sections, setSections] = useState(() => {
    // Wrap in try/catch in case the user's localStorage JSON is corrupted
    try {
      const stored = JSON.parse(localStorage.getItem("sidebar_sections") || "{}");
      return {
        dashboard: true,
        posts: false,
        payments: false,
        feedback: false,
        system: false,
        ...stored,
      };
    } catch {
      return { dashboard: true, posts: false, payments: false, feedback: false, system: false };
    }
  });

  const toggleSection = (key) => {
    // If user clicks a section while sidebar is closed, open the sidebar first
    if (!open) toggleSidebar();
    
    const newSections = { ...sections, [key]: !sections[key] };
    setSections(newSections);
    localStorage.setItem("sidebar_sections", JSON.stringify(newSections));
  };

  const menu = [
    { key: "dashboard", label: "Dashboard", icon: Home, items: [{ label: "Overview", path: "/admin/dashboard/overview" }] },
    { key: "posts", label: "Content", icon: FileText, items: [{ label: "All Articles", path: "/admin/posts", end: true }, { label: "Access Control", path: "/admin/posts/access" }] },
    { key: "payments", label: "Finance", icon: DollarSign, items: [{ label: "Transactions", path: "/admin/payments", end: true }, { label: "Trends", path: "/admin/payments/trends" }] },
    { key: "feedback", label: "Feedback", icon: MessageSquare, items: [{ label: "Reviews", path: "/admin/feedback", end: true }, { label: "Analytics", path: "/admin/feedback/analytics" }] },
    { key: "system", label: "System", icon: Folder, items: [{ label: "Audit Logs", path: "/admin/system/audit-logs" }] },
  ];

  return (
    <>
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>

      <aside
        className={`bg-[#0B1120] text-slate-400 h-screen flex flex-col border-r border-slate-800 shadow-2xl fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out lg:static
          ${open ? "w-72 translate-x-0" : "w-72 -translate-x-full lg:translate-x-0 lg:w-20"}
        `}
      >
        {/* BRAND HEADER */}
        <div 
            className="h-20 flex items-center justify-center border-b border-slate-800/50 bg-[#0B1120] shrink-0 cursor-pointer" 
            onClick={() => {
              // Ensure window is defined to prevent SSR crashes if ported to Next.js later
              if (typeof window !== "undefined" && window.innerWidth >= 1024) toggleSidebar();
            }}
        >
          {/* 🚀 BUG FIX: We only need to check `open` now. If it's closed on mobile, 
              it's off-screen anyway, so rendering the mini-icon doesn't hurt anything. */}
          {open ? (
             <div className="flex items-center gap-3 px-6 w-full animate-fade-in">
               <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-900/50 ring-1 ring-white/10 shrink-0">
                 <Activity size={20} strokeWidth={2.5} />
               </div>
               <div className="min-w-0">
                 <h1 className="text-lg font-bold text-white tracking-tight leading-none font-serif truncate">JK ADMIN</h1>
                 <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Portal v2.0</p>
               </div>
             </div>
          ) : (
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg font-serif">JK</div>
          )}
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto scrollbar-hide">
          {menu.map((section) => {
            const isSectionActive = section.items.some(item => location.pathname.startsWith(item.path));
            const isExpanded = sections[section.key];

            return (
              <div key={section.key} className="group">
                <button
                  onClick={() => toggleSection(section.key)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 border border-transparent ${
                    isSectionActive ? 'text-indigo-100 bg-slate-800/40' : 'hover:bg-slate-800/30 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <section.icon size={20} className={`shrink-0 transition-colors duration-300 ${isSectionActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                    {open && <span className="font-medium text-sm tracking-wide truncate">{section.label}</span>}
                  </div>
                  {open && (
                     <ChevronDown size={14} className={`transition-transform duration-300 text-slate-600 shrink-0 ${isExpanded ? "rotate-180" : ""}`} />
                  )}
                </button>

                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded && open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="ml-5 pl-4 border-l border-slate-800 space-y-1 py-2 mt-1">
                    {section.items.map((item, idx) => (
                      <NavLink
                        key={idx} to={item.path} end={item.end}
                        // 🚀 BUG FIX: Removed closeMobileSidebar() call. Layout handles this now.
                        className={({ isActive }) => `relative block px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${isActive ? "text-white bg-indigo-600 shadow-md font-medium" : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/30"}`}
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}