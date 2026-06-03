import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { getAdminAuditLogs } from "../../services/adminApi";

// 🚀 Utilizing your complete, reusable UI Toolkit!
import TableToolbar from "../../components/TableToolbar";
import Pagination from "../../components/Pagination";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import { TableSkeleton } from "../../components/Skeleton";

import { Terminal, Clock, ShieldAlert, User, ChevronDown, ChevronRight } from "lucide-react";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 10;
  
  // Filters
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  
  // UI State
  const [expandedRow, setExpandedRow] = useState(null);

  // Helper for filter resets
  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
    setExpandedRow(null); // Close expanded rows when filtering
  };

  // 🚀 PERFORMANCE FIX: Debounced fetch with unmount protection
  useEffect(() => {
    let isMounted = true;

    const fetchLogs = async () => {
      setLoading(true);
      try {
        const { data } = await getAdminAuditLogs({ page, pageSize, search, action });
        if (isMounted) {
          setLogs(data.results || []);
          setCount(data.count || 0);
        }
      } catch (err) {
        if (isMounted) console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchLogs();
    }, 300);

    return () => {
      clearTimeout(timer);
      isMounted = false;
    };
  }, [page, search, action]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      <Helmet><title>System Audit Logs | JK Admin</title></Helmet>
      
      {/* HEADER SECTION */}
      <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">System Audit</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Track secure administrative session changes and data audit lines.</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono text-gray-500 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 shadow-inner self-start md:self-auto w-full md:w-auto overflow-hidden">
           <Terminal size={16} className="text-indigo-500 shrink-0" /> 
           <span className="truncate">/var/log/admin_audit.log</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-4 sm:p-5">
        
        {/* 🚀 TOOLBAR REUSABILITY */}
        <TableToolbar 
          search={search} 
          setSearch={(val) => handleFilterChange(setSearch, val)}
        >
          <div className="relative w-full sm:w-auto mt-3 md:mt-0">
             <select
              name="action"
              id="action"
              value={action}
              onChange={(e) => handleFilterChange(setAction, e.target.value)}
              className="appearance-none w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[11px] sm:text-xs font-medium text-gray-600 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-all hover:bg-gray-100"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="EXPORT">Export</option>
            </select>
             <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </TableToolbar>

        <div className="overflow-x-auto w-full mt-4">
          <table className="w-full text-left border-collapse min-w-[700px] lg:min-w-0">
            <thead className="bg-gray-50/50 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider border-y border-gray-100">
              <tr>
                {/* 🔹 FIX: Moved comment to avoid whitespace text node bug inside <tr> */}
                {/* Expansion Chevron Column */}
                <th className="px-4 py-4 w-8"></th>
                <th className="px-4 py-4 w-44">Timestamp</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4 w-32">Event</th>
                <th className="px-6 py-4">Target Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              
              {/* 🚀 SKELETON REUSABILITY */}
              {loading ? (
                 <tr>
                   <td colSpan="5" className="px-6 py-8">
                     <TableSkeleton rows={8} cols={4} />
                   </td>
                 </tr>
              ) : logs.length === 0 ? (
                 
                 /* 🚀 EMPTY STATE REUSABILITY */
                 <tr>
                   <td colSpan="5">
                     <EmptyState 
                       title="No audit logs found" 
                       description={search || action ? "Try clearing your filters or adjusting your search term." : "The system ledger is currently empty."}
                       icon={<ShieldAlert size={32} className="text-gray-400" />}
                     />
                   </td>
                 </tr>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedRow === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr 
                        onClick={() => setExpandedRow(isExpanded ? null : log.id)} 
                        className={`cursor-pointer transition-colors duration-200 ${isExpanded ? "bg-indigo-50/30" : "hover:bg-gray-50/60"}`}
                        aria-expanded={isExpanded}
                      >
                        <td className="px-4 py-5 text-gray-400">
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </td>
                        <td className="px-4 py-5 whitespace-nowrap text-[11px] sm:text-xs text-gray-500 font-mono flex items-center gap-2 mt-0.5">
                          <Clock size={12} className="shrink-0" />
                          {new Date(log.timestamp).toLocaleString("en-GB", {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'})}
                        </td>
                        <td className="px-6 py-5 align-middle">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-gray-100 rounded-full text-gray-500"><User size={12} /></div>
                            <span className="font-bold text-gray-900 text-xs sm:text-sm">{log.admin_username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 align-middle">
                          <StatusBadge value={log.action} type="pill" />
                        </td>
                        <td className="px-6 py-5 align-middle">
                          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                            <span className="bg-gray-100 px-2 py-1 rounded-md font-mono text-[10px] sm:text-xs border border-gray-200">{log.model_name}</span> 
                            {log.object_id && <span className="text-gray-400 font-mono">#{log.object_id}</span>}
                          </div>
                        </td>
                      </tr>
                      
                      {/* 🚀 UI POLISH: Elegant floating terminal window */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="5" className="bg-gray-50/30 p-4 sm:p-6 border-b border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-800">
                              <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center gap-2">
                                <div className="flex gap-1.5">
                                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400 ml-2">JSON Payload Details</span>
                              </div>
                              <pre className="text-emerald-400 text-[11px] sm:text-xs font-mono overflow-x-auto p-4 sm:p-5 custom-scrollbar">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl mt-2">
            <Pagination page={page} setPage={setPage} pageCount={Math.max(Math.ceil(count / pageSize), 0)} />
        </div>
      </div>
    </div>
  );
}