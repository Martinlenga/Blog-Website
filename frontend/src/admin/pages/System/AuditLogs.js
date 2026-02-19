import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { getAdminAuditLogs } from "../../services/adminApi";
import Pagination from "../../components/Pagination";
import Skeleton from "../../components/Skeleton";
import { Search, Terminal, Clock, ShieldAlert, Database, User, Filter } from "lucide-react";

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const ActionBadge = ({ type }) => {
    const styles = {
      CREATE: "bg-emerald-100 text-emerald-700 border-emerald-200",
      UPDATE: "bg-blue-100 text-blue-700 border-blue-200",
      DELETE: "bg-rose-100 text-rose-700 border-rose-200",
      LOGIN: "bg-indigo-100 text-indigo-700 border-indigo-200",
      LOGOUT: "bg-gray-100 text-gray-700 border-gray-200",
      EXPORT: "bg-purple-100 text-purple-700 border-purple-200",
    };
    return (
      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${styles[type] || styles.LOGOUT}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="animate-fade-in-up pb-10">

      <Helmet>
        <title>System Audit Logs | JK Admin</title>
      </Helmet>
      
      {/* 1. Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">System Audit</h1>
          <p className="text-gray-500 text-sm mt-1">Track administrative actions and security events.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
           <Terminal size={14} />
           <span>/var/log/admin_audit.log</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* 2. Filters Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search admin, model, details..."
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={action}
              onChange={(e) => { setPage(1); setAction(e.target.value); }}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer appearance-none"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="EXPORT">Export</option>
            </select>
          </div>
        </div>

        {/* 3. The Logs Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
             <div className="p-8"><Skeleton rows={6} /></div>
          ) : logs.length === 0 ? (
             <div className="p-16 text-center flex flex-col items-center justify-center text-gray-400">
                <ShieldAlert size={48} className="mb-4 text-gray-200" />
                <p className="font-medium text-gray-900">No logs found</p>
                <p className="text-sm">System events will appear here.</p>
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 pl-8">Timestamp</th>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Event</th>
                  <th className="px-6 py-3">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => {
                  const isExpanded = expandedRow === log.id;
                  return (
                    <>
                      <tr 
                        key={log.id} 
                        onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                        className={`cursor-pointer transition-colors ${isExpanded ? "bg-indigo-50/50" : "hover:bg-gray-50"}`}
                      >
                        <td className="px-6 py-4 pl-8 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-gray-500 text-xs font-mono">
                             <Clock size={12} />
                             {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 font-medium text-gray-900 text-sm">
                             <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                <User size={12} />
                             </div>
                             {log.admin_username}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <ActionBadge type={log.action} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                             <Database size={14} className="text-gray-400" />
                             <span className="font-mono text-xs font-bold bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                               {log.model_name}
                             </span>
                             {log.object_id && <span className="text-gray-400 text-xs">#{log.object_id}</span>}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Details - Terminal Style */}
                      {isExpanded && (
                        <tr className="bg-indigo-50/30">
                          <td colSpan={4} className="px-8 pb-6 pt-2">
                            <div className="rounded-lg bg-[#1E293B] border border-slate-700 shadow-inner overflow-hidden">
                               <div className="bg-slate-800/50 px-3 py-1.5 border-b border-slate-700 flex items-center gap-2">
                                  <div className="flex gap-1.5">
                                     <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                                     <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-mono ml-2">payload.json</span>
                               </div>
                               <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto">
                                  {JSON.stringify(log.details, null, 2)}
                               </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
           <Pagination page={page} setPage={setPage} pageCount={Math.ceil(count / pageSize)} />
        </div>
      </div>
    </div>
  );
}