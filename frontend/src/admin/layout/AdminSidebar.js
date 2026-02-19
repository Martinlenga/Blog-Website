import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { 
  Home, FileText, DollarSign, MessageSquare, Folder, 
  ChevronDown, ChevronRight, ShieldCheck, Activity 
} from "lucide-react";

export default function AdminSidebar({ open = true }) {
  const location = useLocation();
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
    { 
      key: "dashboard", label: "Dashboard", icon: Home, 
      items: [{ label: "Overview", path: "/admin/dashboard/overview" }] 
    },
    { 
      key: "posts", label: "Content", icon: FileText, 
      items: [
        { label: "All Articles", path: "/admin/posts", end: true },
        { label: "Access Control", path: "/admin/posts/access" }
      ] 
    },
    { 
      key: "payments", label: "Finance", icon: DollarSign, 
      items: [
        { label: "Transactions", path: "/admin/payments", end: true },
        { label: "Trends", path: "/admin/payments/trends" },
      ] 
    },
    { 
      key: "feedback", label: "Feedback", icon: MessageSquare, 
      items: [
        { label: "Reviews", path: "/admin/feedback", end: true }, // 🔴 FIXED
        { label: "Analytics", path: "/admin/feedback/analytics" },
      ] 
    },
    { 
      key: "system", label: "System", icon: Folder, 
      items: [{ label: "Audit Logs", path: "/admin/system/audit-logs" }] 
    },
  ];

  return (
    <>
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>

      <aside
        className={`bg-[#0B1120] text-slate-400 min-h-screen flex flex-col transition-all duration-300 border-r border-slate-800 shadow-2xl relative z-50 ${
          open ? "w-72" : "w-20"
        }`}
      >
        {/* BRAND HEADER */}
        <div className="h-20 flex items-center justify-center border-b border-slate-800/50 bg-[#0B1120]">
          {open ? (
             <div className="flex items-center gap-3 animate-fade-in">
               <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-900/50 ring-1 ring-white/10">
                 <Activity size={20} strokeWidth={2.5} />
               </div>
               <div>
                 <h1 className="text-lg font-bold text-white tracking-tight leading-none font-serif">JK ADMIN</h1>
                 <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Portal v2.0</p>
               </div>
             </div>
          ) : (
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg font-serif">JK</div>
          )}
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto scrollbar-hide">
          {menu.map((section) => {
            const isSectionActive = section.items.some(item => location.pathname.startsWith(item.path));

            return (
              <div key={section.key} className="group">
                {/* Section Button */}
                <button
                  onClick={() => toggleSection(section.key)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 border border-transparent ${
                     isSectionActive 
                       ? 'text-indigo-100 bg-slate-800/40' 
                       : 'hover:bg-slate-800/30 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <section.icon 
                      size={20} 
                      className={`transition-colors duration-300 ${isSectionActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} 
                    />
                    {open && <span className="font-medium text-sm tracking-wide">{section.label}</span>}
                  </div>
                  {open && (
                     <ChevronDown 
                       size={14} 
                       className={`transition-transform duration-300 text-slate-600 ${sections[section.key] ? "rotate-180" : ""}`} 
                     />
                  )}
                </button>

                {/* Submenu Children */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${sections[section.key] && open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="ml-5 pl-4 border-l border-slate-800 space-y-1 py-2 mt-1">
                    {section.items.map((item, idx) => (
                      <NavLink
                        key={idx}
                        to={item.path}
                        end={item.end} // ⭐ CRITICAL: Prevents partial match highlighting
                        className={({ isActive }) =>
                          `relative block px-4 py-2.5 text-sm rounded-lg transition-all duration-200 group/link ${
                            isActive 
                              ? "text-white bg-indigo-600 shadow-md shadow-indigo-900/30 font-medium" 
                              : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/30"
                          }`
                        }
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

        {/* FOOTER */}
        {open && (
          <div className="p-4 border-t border-slate-800/50 bg-[#0B1120]">
             <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
                <div className="relative">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse absolute top-0 right-0 border border-[#0B1120]"></div>
                  <ShieldCheck className="text-emerald-400/80" size={20} />
                </div>
                <div>
                   <p className="text-xs font-bold text-slate-200 tracking-wide">Secure Connection</p>
                   <p className="text-[10px] text-slate-500 font-mono mt-0.5">Encrypted</p>
                </div>
             </div>
          </div>
        )}
      </aside>
    </>
  );
}