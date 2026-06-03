import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { getCategories, getAdminPostAccess } from "../../services/adminApi";

// 🚀 Utilizing your complete, reusable UI Toolkit!
import TableToolbar from "../../components/TableToolbar";
import Pagination from "../../components/Pagination";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import { TableSkeleton } from "../../components/Skeleton";
import NewDataBadge from "../../components/NewDataBadge"; // 🚀 Import the badge

import { Tag, User, Shield, Activity, Clock } from "lucide-react";

export default function PostAccess() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [dateRange, setDateRange] = useState("");
  
  // Pagination & Stats
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // 🚀 NOTIFICATION STATE
  const [hasNewItems, setHasNewItems] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Helper for filter resets
  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  useEffect(() => {
    let isMounted = true;
    
    getCategories()
      .then(res => {
        if (isMounted && res.data?.categories) {
          setCategories(res.data.categories);
        }
      })
      .catch(err => {
        if (isMounted) console.error(err);
      });
      
    return () => {
      isMounted = false;
    };
  }, []);

  // 🚀 PERFORMANCE FIX: Debounced fetch with unmount protection
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (data.length === 0 || search) setLoading(true);
      try {
        const res = await getAdminPostAccess({ page, search, category, date_range: dateRange });
        if (isMounted) {
          setData(res.data.results || []);
          setTotalCount(res.data.count || 0);
          setPageCount(Math.max(Math.ceil((res.data.count || 0) / 10), 1));
          setHasNewItems(false); // Clear badge on natural fetch
        }
      } catch (err) {
        if (isMounted) console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 300);

    return () => {
      clearTimeout(timer);
      isMounted = false;
    };
  // 👇 Added refreshTrigger
  }, [page, search, category, dateRange, refreshTrigger]);

  // 🚀 THE SILENT POLLER
  useEffect(() => {
    if (page !== 1 || search) return;

    const interval = setInterval(async () => {
      try {
        const res = await getAdminPostAccess({ 
          page: 1, 
          search, 
          category, 
          date_range: dateRange 
        });
        
        const latestServerItem = res.data.results[0];
        const latestLocalItem = data[0];

        // Assuming post access records have an 'id'. If they use something else like 'slug', change .id to .slug
        if (latestServerItem && latestLocalItem && latestServerItem.id !== latestLocalItem.id) {
          setHasNewItems(true);
        }
      } catch (err) {
        // Fail silently
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [data, page, search, category, dateRange]);

  const handleRefreshClick = () => {
    setHasNewItems(false);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      <Helmet>
        <title>Access Logs | JK Admin</title>
      </Helmet>

      <NewDataBadge 
        show={hasNewItems} 
        onClick={handleRefreshClick} 
        label="New access logs available" 
      />
      
      {/* HEADER META ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none mt-0.5">Live Activity</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Access Logs</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Real-time tracking of content unlocks and user permissions.</p>
        </div>
        
        {/* Quick Stats Pill Panel */}
        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm flex items-center justify-between sm:justify-start gap-5 self-stretch sm:self-auto">
           <div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Total Unlocks</p>
              <p className="text-xl font-bold text-indigo-600 leading-tight mt-0.5">{totalCount.toLocaleString()}</p>
           </div>
           <div className="h-8 w-[1px] bg-gray-100 hidden sm:block"></div>
           <div className="flex items-center gap-2 text-xs text-gray-400 font-medium hidden sm:flex">
              <div className="p-1.5 bg-gray-50 rounded-lg border border-gray-100"><Activity size={16} className="text-slate-400" /></div>
              <span>System Streams Active</span>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-4 sm:p-5">
        
        {/* Integrated Toolbar Filters Container */}
        <TableToolbar
          search={search} 
          setSearch={(val) => handleFilterChange(setSearch, val)}
          category={category} 
          setCategory={(val) => handleFilterChange(setCategory, val)}
          categories={categories}
          dateRange={dateRange} 
          setDateRange={(val) => handleFilterChange(setDateRange, val)}
          showPriceFilter={false}
        />

        {/* Access Log Table View */}
        <div className="overflow-x-auto w-full mt-4">
          <table className="w-full text-left border-collapse min-w-[700px] lg:min-w-0">
            <thead>
              <tr className="border-y border-gray-100 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                <th className="px-4 sm:px-6 py-4 pl-6 sm:pl-8">User Identity</th>
                <th className="px-4 sm:px-6 py-4">Content Accessed</th>
                <th className="px-4 sm:px-6 py-4 w-32 text-center">Status</th>
                <th className="px-4 sm:px-6 py-4 text-right pr-6 sm:pr-8 w-44">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              
              {/* 🚀 SKELETON REUSABILITY */}
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8">
                    <TableSkeleton rows={5} cols={4} />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                
                /* 🚀 EMPTY STATE REUSABILITY */
                <tr>
                  <td colSpan="4">
                    <EmptyState 
                      title="No access records found" 
                      description={search || category || dateRange ? "Try adjusting your filters or search terms." : "No content unlocks have been recorded yet."}
                      icon={<Shield size={32} className="text-gray-400" />}
                    />
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="group hover:bg-indigo-50/30 transition-colors duration-150">
                    
                    {/* User Profile Column Info */}
                    <td className="px-4 sm:px-6 py-4 pl-6 sm:pl-8 align-top">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
                           <User size={16} strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0">
                           <p className="text-xs sm:text-sm font-bold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">{item.user_email}</p>
                           <p className="text-[10px] text-gray-400 font-mono mt-0.5">Log ID: {item.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Content Component Description Column */}
                    <td className="px-4 sm:px-6 py-4 max-w-xs align-top">
                      <div className="flex flex-col min-w-0 mt-1">
                        <span className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">
                          {item.post_title}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1.5 text-gray-400">
                          <Tag size={12} className="shrink-0 text-indigo-400" />
                          <span className="text-[11px] font-medium text-gray-500">{item.post_category || "General"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="px-4 sm:px-6 py-4 text-center align-top">
                      <div className="mt-1">
                        {/* 🚀 STATUS BADGE REUSABILITY */}
                        <StatusBadge value="SUCCESS" labelOverride="GRANTED" type="pill" />
                      </div>
                    </td>

                    {/* Time Log Stamp Column */}
                    <td className="px-4 sm:px-6 py-4 text-right pr-6 sm:pr-8 align-top">
                      <div className="flex flex-col items-end text-xs sm:text-sm mt-1">
                        <span className="font-bold text-gray-900 tabular-nums">
                           {new Date(item.granted_at).toLocaleDateString("en-GB", {day: 'numeric', month: 'short', year: 'numeric'})}
                        </span>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-1 tabular-nums font-medium">
                           <Clock size={12} className="shrink-0" />
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
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl mt-2">
           <Pagination page={page} setPage={setPage} pageCount={pageCount} />
        </div>
      </div>
    </div>
  );
}