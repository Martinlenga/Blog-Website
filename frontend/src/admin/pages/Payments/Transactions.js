import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { getAdminPayments, exportPaymentsCSV } from "../../services/adminApi";
import Pagination from "../../components/Pagination";
import { Search, Download, CheckCircle, XCircle, Clock, FileText, Smartphone } from "lucide-react";

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
    // Debounce search
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
      // Pass current filters to export
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
    if (status === "SUCCESS") return <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-100"><CheckCircle size={12} /> Success</span>;
    if (status === "FAILED") return <span className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full text-xs font-bold border border-rose-100"><XCircle size={12} /> Failed</span>;
    return <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-100"><Clock size={12} /> Pending</span>;
  };

  return (
    <div className="animate-fade-in-up pb-10">

      <Helmet>
        <title>Transactions | JK Admin</title>
      </Helmet>
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time payment ledger.</p>
        </div>
        <button 
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-gray-200 transition-all disabled:opacity-50"
        >
          <Download size={16} /> {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      {/* FILTERS TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by phone, receipt ID, or post title..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:border-indigo-500 outline-none cursor-pointer hover:bg-gray-50 md:w-48"
        >
          <option value="">All Statuses</option>
          <option value="SUCCESS">Success</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                <th className="px-6 py-4">Transaction Details</th>
                <th className="px-6 py-4">Article</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="4" className="p-12 text-center text-gray-400">Loading ledger...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan="4" className="p-12 text-center text-gray-400">No transactions found.</td></tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="group hover:bg-gray-50/80 transition-colors">
                    
                    {/* DETAILS */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400 border border-gray-100">
                          <FileText size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 font-mono tracking-wide">
                            {p.mpesa_receipt || "PENDING-TX"}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Clock size={10} /> {new Date(p.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Smartphone size={10} /> {p.phone}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* ARTICLE */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {p.post_title}
                      </p>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex justify-center">
                        <StatusIcon status={p.status} />
                      </div>
                    </td>

                    {/* AMOUNT */}
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-extrabold font-serif ${p.status === 'SUCCESS' ? 'text-gray-900' : 'text-gray-400'}`}>
                        Kshs {Number(p.amount).toLocaleString()}
                      </span>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
           <Pagination page={page} setPage={setPage} pageCount={Math.ceil(count / pageSize)} />
        </div>
      </div>
    </div>
  );
}