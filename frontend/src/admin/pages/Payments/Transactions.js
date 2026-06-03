import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { getAdminPayments, exportPaymentsCSV } from "../../services/adminApi";

// 🚀 Utilizing your complete, reusable UI Toolkit!
import Pagination from "../../components/Pagination";
import TableToolbar from "../../components/TableToolbar";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import { TableSkeleton } from "../../components/Skeleton";

import { Download, Clock, FileText, Smartphone, ChevronDown, CreditCard } from "lucide-react";

export default function Transactions() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [exporting, setExporting] = useState(false);

  const pageSize = 10;

  // 🚀 PERFORMANCE FIX: Debounced fetch with unmount protection
  useEffect(() => {
    let isMounted = true;

    const fetchPayments = async () => {
      setLoading(true);
      try {
        const { data } = await getAdminPayments({
          page, pageSize, search, status: statusFilter, ordering: "-created_at"
        });
        if (isMounted) {
          setPayments(data.results || []);
          setCount(data.count || 0);
        }
      } catch (err) {
        if (isMounted) console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchPayments();
    }, 300);

    return () => {
      clearTimeout(timer);
      isMounted = false;
    };
  }, [page, search, statusFilter]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await exportPaymentsCSV({ search, status: statusFilter });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payments_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download CSV");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      <Helmet>
        <title>Transactions | JK Admin</title>
      </Helmet>
      
      {/* HEADER ACTION ROW */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 sm:mb-8 gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Transactions</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Real-time payment system ledger accounts.</p>
        </div>
        <button 
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-gray-200 w-full sm:w-auto"
        >
          <Download size={16} className={exporting ? "animate-bounce" : ""} /> 
          {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      {/* DATA LEDGER TABLE CONTAINER */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-4 sm:p-5">
        
        {/* 🚀 TOOLBAR REUSABILITY: Using our custom component with children */}
        <TableToolbar 
          search={search} 
          setSearch={(val) => { setSearch(val); setPage(1); }} 
        >
           {/* 🚀 RESPONSIVE FIX: Replaced w-full with a compact fixed width and aligned it neatly */}
           <div className="relative mt-3 sm:mt-0 shrink-0 self-start sm:self-auto">
             <select
                id="paymentStatus"
                name="paymentStatus"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="appearance-none w-[140px] sm:w-[160px] pl-3 pr-8 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-all hover:bg-gray-100 shadow-sm"
              >
                <option value="">All Statuses</option>
                <option value="SUCCESS">Success</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
             <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
           </div>
        </TableToolbar>

        <div className="overflow-x-auto w-full mt-4">
          <table className="w-full text-left border-collapse min-w-[750px] lg:min-w-0">
            <thead>
              <tr className="border-y border-gray-100 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                <th className="px-4 sm:px-6 py-4 w-72">Transaction Details</th>
                <th className="px-4 sm:px-6 py-4">Article</th>
                <th className="px-4 sm:px-6 py-4 text-center w-32">Status</th>
                <th className="px-4 sm:px-6 py-4 text-right w-36">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              
              {/* 🚀 SKELETON REUSABILITY */}
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8">
                    <TableSkeleton rows={6} cols={4} />
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                
                /* 🚀 EMPTY STATE REUSABILITY */
                <tr>
                  <td colSpan="4">
                    <EmptyState 
                      title="No transactions found" 
                      description={search || statusFilter ? "Try clearing your filters or adjusting your search term." : "There are no recorded transactions in the ledger yet."}
                      icon={<CreditCard size={32} className="text-gray-400" />}
                    />
                  </td>
                </tr>
              ) : (
                
                payments.map((p) => (
                  <tr key={p.id} className="group hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400 border border-gray-100 shrink-0 group-hover:border-indigo-100 group-hover:text-indigo-500 transition-colors">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-gray-900 font-mono tracking-wide truncate group-hover:text-indigo-700 transition-colors">
                            {p.mpesa_receipt || "PENDING-TX"}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] sm:text-[11px] text-gray-400 font-medium">
                            <span className="flex items-center gap-1"><Clock size={10} /> {new Date(p.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Smartphone size={10} /> {p.phone}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 align-top">
                      <p className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-2 leading-relaxed mt-1">
                        {p.post_title}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center align-top">
                      <div className="inline-flex justify-center mt-1">
                        {/* 🚀 STATUS BADGE REUSABILITY */}
                        <StatusBadge value={p.status} type="pill" />
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right align-top">
                      <div className={`text-xs sm:text-sm font-extrabold font-serif tracking-tight mt-1 ${p.status === 'SUCCESS' ? 'text-emerald-700' : 'text-gray-400'}`}>
                        Kshs {Number(p.amount || 0).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl mt-2">
            <Pagination page={page} setPage={setPage} pageCount={Math.max(Math.ceil(count / pageSize), 0)} />
        </div>
      </div>
    </div>
  );
}