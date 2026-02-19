import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { getCategories, getAdminPostAccess } from "../../services/adminApi";
import TableToolbar from "../../components/TableToolbar";
import Pagination from "../../components/Pagination";
import { Lock, Unlock, Calendar, Tag, User, Shield, Activity, Clock } from "lucide-react";

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

  // Filters Reset
  useEffect(() => { setPage(1); }, [search, category, dateRange]);

  // Init Categories
  useEffect(() => {
    getCategories().then(res => {
        if (res.data?.categories) setCategories(res.data.categories);
    }).catch(console.error);
  }, []);

  // Fetch Data
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
    <div className="animate-fade-in-up pb-10">

      <Helmet>
        <title>Access Logs | JK Admin</title>
      </Helmet>
      
      {/* 1. Header Section with "Live" Feel */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Live Activity</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Access Logs</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time tracking of content unlocks and permissions.</p>
        </div>
        
        {/* Quick Stats Pill */}
        <div className="bg-white border border-gray-200 rounded-xl px-5 py-2 shadow-sm flex items-center gap-4">
           <div className="text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Unlocks</p>
              <p className="text-xl font-bold text-indigo-600">{totalCount.toLocaleString()}</p>
           </div>
           <div className="h-8 w-[1px] bg-gray-100"></div>
           <div className="flex items-center gap-2 text-sm text-gray-500">
              <Activity size={16} />
              <span>System Active</span>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* 2. Integrated Toolbar */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <TableToolbar
            search={search} setSearch={setSearch}
            category={category} setCategory={setCategory}
            categories={categories}
            dateRange={dateRange} setDateRange={setDateRange}
            showPriceFilter={false}
          />
        </div>

        {/* 3. The "Wow" Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4 pl-8">User Identity</th>
                <th className="px-6 py-4">Content Accessed</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right pr-8">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {loading ? (
                <tr><td colSpan="4" className="p-12 text-center text-gray-400">Syncing records...</td></tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Shield size={48} className="mb-4 text-gray-200" />
                      <p className="text-lg font-medium text-gray-900">No access records found</p>
                      <p className="text-sm">Try adjusting your filters or search terms.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="group hover:bg-indigo-50/30 transition-colors duration-200">
                    
                    {/* User Column */}
                    <td className="px-6 py-4 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-white border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                           <User size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-gray-900">{item.user_email}</p>
                           <p className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {item.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Content Column */}
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                          {item.post_title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <Tag size={10} className="text-gray-400" />
                          <span className="text-xs text-gray-500">{item.post_category}</span>
                        </div>
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <Unlock size={10} strokeWidth={3} />
                        GRANTED
                      </span>
                    </td>

                    {/* Time Column */}
                    <td className="px-6 py-4 text-right pr-8">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-gray-900 tabular-nums">
                           {new Date(item.granted_at).toLocaleDateString("en-GB", {day: 'numeric', month: 'short', year: 'numeric'})}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 tabular-nums">
                           <Clock size={10} />
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

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
           <Pagination page={page} setPage={setPage} pageCount={pageCount} />
        </div>
      </div>
    </div>
  );
}