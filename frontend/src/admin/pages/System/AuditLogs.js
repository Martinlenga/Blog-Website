import React, { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet";
import { getAdminAuditLogs } from "../../services/adminApi";
import Pagination from "../../components/Pagination";
import Skeleton from "../../components/Skeleton";
import { Search, Terminal, Clock, ShieldAlert, Database, User, Filter, ChevronDown } from "lucide-react";

// --- CUSTOM DROPDOWN COMPONENT (With larger font) ---
const CustomDropdown = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div className="relative inline-block w-full sm:w-56" ref={ref}>
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 cursor-pointer flex items-center justify-between shadow-sm hover:border-gray-300 transition-all"
      >
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown size={14} className="text-gray-400 shrink-0" />
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] w-full py-1">
          <div className="px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer" onClick={() => { onChange(""); setIsOpen(false); }}>{placeholder}</div>
          {options.map((opt) => (
            <div key={opt} className="px-4 py-2.5 text-sm text-gray-800 hover:bg-indigo-50 cursor-pointer" onClick={() => { onChange(opt); setIsOpen(false); }}>{opt}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);

  const pageSize = 10;

  useEffect(() => {
    const timer = setTimeout(() => fetchLogs(), 300);
    return () => clearTimeout(timer);
  }, [page, search, action]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminAuditLogs({ page, pageSize, search, action });
      setLogs(data.results);
      setCount(data.count);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const ActionBadge = ({ type }) => {
    const styles = {
      CREATE: "bg-emerald-50 text-emerald-700 border-emerald-200",
      UPDATE: "bg-blue-50 text-blue-700 border-blue-200",
      DELETE: "bg-rose-50 text-rose-700 border-rose-200",
      LOGIN: "bg-indigo-50 text-indigo-700 border-indigo-200",
      LOGOUT: "bg-gray-50 text-gray-700 border-gray-200",
      EXPORT: "bg-purple-50 text-purple-700 border-purple-200",
    };
    return (
      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${styles[type] || styles.LOGOUT}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="animate-fade-in-up pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      <Helmet><title>System Audit Logs | JK Admin</title></Helmet>
      
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">System Audit</h1>
          <p className="text-gray-500 text-sm mt-1">Track secure administrative session changes and data audit lines.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-gray-100 px-4 py-2 rounded-lg border border-gray-200">
           <Terminal size={14} /> /var/log/admin_audit.log
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text" placeholder="Search logs by user, model, or ID..."
              value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 transition-all"
            />
          </div>
          <CustomDropdown value={action} onChange={(val) => { setPage(1); setAction(val); }} options={["CREATE", "UPDATE", "DELETE", "LOGIN", "EXPORT"]} placeholder="All Actions" />
        </div>

        <div className="overflow-x-auto w-full min-h-[400px]">
          {loading ? (
             <div className="p-8"><Skeleton rows={8} /></div>
          ) : logs.length === 0 ? (
             <div className="p-20 text-center text-gray-400"><ShieldAlert size={48} className="mx-auto mb-4 text-gray-200" /><p>No logs found.</p></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5">Timestamp</th>
                  <th className="px-6 py-5">User</th>
                  <th className="px-6 py-5">Event</th>
                  <th className="px-6 py-5">Target Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => {
                  const isExpanded = expandedRow === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr onClick={() => setExpandedRow(isExpanded ? null : log.id)} className={`cursor-pointer transition-colors ${isExpanded ? "bg-indigo-50/30" : "hover:bg-gray-50"}`}>
                        <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-600 font-mono flex items-center gap-2"><Clock size={14} />{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-5 font-bold text-gray-900 text-sm"><div className="flex items-center gap-2"><User size={16} className="text-gray-400" />{log.admin_username}</div></td>
                        <td className="px-6 py-5"><ActionBadge type={log.action} /></td>
                        <td className="px-6 py-5 text-sm font-medium text-gray-700">
                          <span className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">{log.model_name}</span> {log.object_id && <span className="text-gray-400">#{log.object_id}</span>}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-gray-900">
                          <td colSpan={4} className="px-8 py-4">
                            <pre className="text-emerald-400 text-xs font-mono overflow-x-auto p-4">{JSON.stringify(log.details, null, 2)}</pre>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/50">
            <Pagination page={page} setPage={setPage} pageCount={Math.ceil(count / pageSize)} />
        </div>
      </div>
    </div>
  );
}