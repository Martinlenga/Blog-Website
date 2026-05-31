import React, { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet";
import { getAdminPayments, exportPaymentsCSV } from "../../services/adminApi";
import Pagination from "../../components/Pagination";
import { Search, Download, CheckCircle, XCircle, Clock, FileText, Smartphone, ChevronDown } from "lucide-react";

// --- CUSTOM DROPDOWN COMPONENT ---
const CustomDropdown = ({ value, onChange, options, placeholder, displayMap }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div className="relative inline-block w-full sm:w-44" ref={ref}>
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-600 cursor-pointer flex items-center justify-between gap-2 shadow-sm hover:bg-gray-50 transition-all"
      >
        <span className="truncate">{displayMap?.[value] || value || placeholder}</span>
        <ChevronDown size={14} className="text-gray-400 shrink-0" />
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] w-full py-1">
          <div className="px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 cursor-pointer" onClick={() => { onChange(""); setIsOpen(false); }}>{placeholder}</div>
          {options.map((opt) => (
            <div key={opt} className="px-3 py-2 text-xs text-gray-800 hover:bg-indigo-50 cursor-pointer" onClick={() => { onChange(opt); setIsOpen(false); }}>
              {displayMap?.[opt] || opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchPayments();
    }, 400);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  useEffect(() => { fetchPayments(); }, [page]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminPayments({
        page, pageSize, search, status: statusFilter, ordering: "-created_at"
      });
      setPayments(data.results);
      setCount(data.count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const StatusIcon = ({ status }) => {
    if (status === "SUCCESS") return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 shrink-0"><CheckCircle size={10} /> Success</span>;
    if (status === "FAILED") return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-100 shrink-0"><XCircle size={10} /> Failed</span>;
    return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-100 shrink-0"><Clock size={10} /> Pending</span>;
  };

  return (
    <div className="animate-fade-in-up pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      <Helmet>
        <title>Transactions | JK Admin</title>
      </Helmet>
      
      {/* HEADER ACTION ROW */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Transactions</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Real-time payment system ledger accounts.</p>
        </div>
        <button 
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs active:scale-95 transition-all disabled:opacity-50 w-full sm:w-auto"
        >
          <Download size={14} /> {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      {/* RESPONSIVE FILTERS TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by phone, receipt ID, or post title..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:bg-white focus:border-indigo-500 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <CustomDropdown 
            value={statusFilter} 
            onChange={setStatusFilter} 
            options={["SUCCESS", "PENDING", "FAILED"]}
            displayMap={{ "SUCCESS": "Success", "PENDING": "Pending", "FAILED": "Failed" }}
            placeholder="All Statuses" 
        />
      </div>

      {/* DATA LEDGER TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full min-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[750px] lg:min-w-0">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                <th className="px-4 sm:px-6 py-4 w-72">Transaction Details</th>
                <th className="px-4 sm:px-6 py-4">Article</th>
                <th className="px-4 sm:px-6 py-4 text-center w-32">Status</th>
                <th className="px-4 sm:px-6 py-4 text-right w-36">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="4" className="p-12 text-center text-gray-400 text-xs sm:text-sm">Loading data ledger...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan="4" className="p-12 text-center text-gray-400 text-xs sm:text-sm">No transactions found.</td></tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="group hover:bg-gray-50/40 transition-colors">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400 border border-gray-100 shrink-0">
                          <FileText size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-gray-900 font-mono tracking-wide truncate">
                            {p.mpesa_receipt || "PENDING-TX"}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400 font-medium">
                            <span className="flex items-center gap-0.5"><Clock size={10} /> {new Date(p.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5"><Smartphone size={10} /> {p.phone}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <p className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-normal">
                        {p.post_title}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <div className="inline-flex justify-center">
                        <StatusIcon status={p.status} />
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <span className={`text-xs sm:text-sm font-extrabold font-serif tracking-tight ${p.status === 'SUCCESS' ? 'text-gray-900' : 'text-gray-400'}`}>
                        Kshs {Number(p.amount).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <Pagination page={page} setPage={setPage} pageCount={Math.ceil(count / pageSize)} />
        </div>
      </div>
    </div>
  );
}