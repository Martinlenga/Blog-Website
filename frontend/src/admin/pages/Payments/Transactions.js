import { useEffect, useState } from "react";
import { getAdminPayments } from "../../services/adminApi";
import Pagination from "../../components/Pagination";
import StatusBadge from "../../components/StatusBadge";
import Skeleton from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";
import { Search } from "lucide-react";

export default function Transactions() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const pageSize = 10;
  const statuses = ["SUCCESS", "PENDING", "FAILED"];

  useEffect(() => {
    fetchPayments();
  }, [page, search, statusFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminPayments({
        page,
        pageSize,
        search,
        ordering: "-created_at",
        status: statusFilter,
      });
      setPayments(data.results);
      setCount(data.count);
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Skeleton rows={10} />;

  if (!payments.length)
    return <EmptyState description="No payments match your criteria." />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by phone or post..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          >
            <option value="">ALL STATUSES</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Scrollable Table */}
      <div className="overflow-x-auto overflow-y-auto max-h-[600px] rounded-lg shadow-lg bg-white border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Post</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Phone</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Amount</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Mpesa Receipt</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Created At</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-indigo-50 transition-colors duration-200">
                <td className="px-6 py-4 font-semibold text-gray-800">{p.post_title}</td>
                <td className="px-6 py-4 text-gray-600">{p.phone}</td>
                <td className="px-6 py-4 text-right text-emerald-600 font-medium">Kshs {p.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-center"><StatusBadge value={p.status} /></td>
                <td className="px-6 py-4 text-center text-gray-500 font-mono">{p.mpesa_receipt || "N/A"}</td>
                <td className="px-6 py-4 text-gray-600 text-center font-medium">
                  {new Date(p.created_at).toLocaleString([], {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end">
        <Pagination page={page} setPage={setPage} pageCount={Math.ceil(count / pageSize)} />
      </div>
    </div>
  );
}
