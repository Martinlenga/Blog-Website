import { useEffect, useState } from "react";
import { getAdminAuditLogs } from "../../services/adminApi";
import Pagination from "../../components/Pagination";
import StatusBadge from "../../components/StatusBadge";
import Skeleton from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";

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
    fetchLogs();
    // eslint-disable-next-line
  }, [page, search, action]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminAuditLogs({
        page,
        pageSize,
        search,
        action,
      });

      setLogs(data.results);
      setCount(data.count);
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Skeleton rows={10} />;

  if (!logs.length) {
    return (
      <EmptyState
        description="Audit logs will appear here once activity starts."
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-800">
          System Audit Logs
        </h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search admin, model, details..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-64 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />

          <select
            value={action}
            onChange={(e) => {
              setPage(1);
              setAction(e.target.value);
            }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">All actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="LOGIN">LOGIN</option>
            <option value="LOGOUT">LOGOUT</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Admin</th>
              <th className="px-4 py-3 text-left">Action</th>
              <th className="px-4 py-3 text-left">Model</th>
              <th className="px-4 py-3 text-left">Object ID</th>
              <th className="px-4 py-3 text-left">Timestamp</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {logs.map((log) => {
              const isExpanded = expandedRow === log.id;

              return (
                <>
                  <tr
                    key={log.id}
                    onClick={() =>
                      setExpandedRow(isExpanded ? null : log.id)
                    }
                    className="cursor-pointer transition hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {log.admin_username}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge value={log.action} />
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {log.model_name}
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {log.object_id ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>

                  {/* Expanded details */}
                  {isExpanded && (
                    <tr className="bg-gray-50">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="rounded-lg bg-slate-900 p-4 text-xs text-slate-100 shadow-inner">
                          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Details
                          </div>
                          <pre className="overflow-x-auto whitespace-pre-wrap">
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
      </div>

      {/* Pagination */}
      <Pagination
        page={page}          
        setPage={setPage}    
        pageCount={Math.ceil(count / pageSize)}
      />
    </div>
  );
}
