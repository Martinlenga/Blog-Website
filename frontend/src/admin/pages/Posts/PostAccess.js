import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { getCategories, getAdminPostAccess } from "../../services/adminApi";
import TableToolbar from "../../components/TableToolbar";
import Pagination from "../../components/Pagination";
import { Unlock, Tag, User, Shield, Activity, Clock } from "lucide-react";

export default function PostAccess() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [dateRange, setDateRange] = useState("");
  
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => { setPage(1); }, [search, category, dateRange]);

  useEffect(() => {
    getCategories().then(res => {
        if (res.data?.categories) setCategories(res.data.categories);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getAdminPostAccess({ page, search, category, date_range: dateRange });
        setData(res.data.results || []);
        setTotalCount(res.data.count || 0);
        setPageCount(Math.ceil(res.data.count / 10));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, search, category, dateRange]);

  return (
    <div className="animate-fade-in-up pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      <Helmet>
        <title>Access Logs | JK Admin</title>
      </Helmet>
      
      {/* HEADER META ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Live Activity</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Access Logs</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Real-time tracking of content unlocks and user permissions.</p>
        </div>
        
        {/* Quick Stats Pill Panel */}
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-xs flex items-center justify-between sm:justify-start gap-4 self-stretch sm:self-auto">
           <div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Total Unlocks</p>
              <p className="text-lg sm:text-xl font-bold text-indigo-600 leading-tight">{totalCount.toLocaleString()}</p>
           </div>
           <div className="h-6 w-[1px] bg-gray-100 hidden sm:block"></div>
           <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium hidden sm:flex">
              <Activity size={14} className="text-slate-400" />
              <span>System Streams Active</span>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Integrated Toolbar Filters Container */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/30">
          <TableToolbar
            search={search} setSearch={setSearch}
            category={category} setCategory={setCategory}
            categories={categories}
            dateRange={dateRange} setDateRange={setDateRange}
            showPriceFilter={false}
          />
        </div>

        {/* Access Log Table View */}
        <div className="overflow-x-auto w-full min-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[700px] lg:min-w-0">
            <thead>
              <tr className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 sm:px-6 py-4 pl-6 sm:pl-8">User Identity</th>
                <th className="px-4 sm:px-6 py-4">Content Accessed</th>
                <th className="px-4 sm:px-6 py-4 w-32">Status</th>
                <th className="px-4 sm:px-6 py-4 text-right pr-6 sm:pr-8 w-36">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {loading ? (
                <tr><td colSpan="4" className="p-12 text-center text-gray-400 text-xs sm:text-sm">Syncing system records...</td></tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Shield size={40} className="mb-3 text-gray-200" />
                      <p className="text-sm font-medium text-gray-900">No access records found</p>
                      <p className="text-xs mt-0.5">Try adjusting your filters or search terms.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="group hover:bg-indigo-50/20 transition-colors duration-150">
                    
                    {/* User Profile Column Info */}
                    <td className="px-4 sm:px-6 py-4 pl-6 sm:pl-8">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
                           <User size={14} strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0">
                           <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{item.user_email}</p>
                           <p className="text-[10px] text-gray-400 font-mono mt-0.5">Log ID: {item.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Content Component Description Column */}
                    <td className="px-4 sm:px-6 py-4 max-w-xs">
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                          {item.post_title}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1 text-gray-400">
                          <Tag size={10} className="shrink-0" />
                          <span className="text-[11px] font-medium">{item.post_category || "General"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="px-4 sm:px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 tracking-wider shrink-0">
                        <Unlock size={8} strokeWidth={3} /> GRANTED
                      </span>
                    </td>

                    {/* Time Log Stamp Column */}
                    <td className="px-4 sm:px-6 py-4 text-right pr-6 sm:pr-8">
                      <div className="flex flex-col items-end text-xs sm:text-sm">
                        <span className="font-bold text-gray-900 tabular-nums">
                           {new Date(item.granted_at).toLocaleDateString("en-GB", {day: 'numeric', month: 'short', year: 'numeric'})}
                        </span>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5 tabular-nums font-medium">
                           <Clock size={10} className="shrink-0" />
                           {new Date(item.granted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Navigation */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50">
           <Pagination page={page} setPage={setPage} pageCount={pageCount} />
        </div>
      </div>
    </div>
  );
}