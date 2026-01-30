import { useEffect, useState } from "react";
import {
  getAdminFeedback,
  approveFeedback,
  updateFeedbackStatus,
} from "../../services/adminApi";

import Pagination from "../../components/Pagination";
import StatusBadge from "../../components/StatusBadge";
import Skeleton from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function Reviews() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const pageSize = 10;

  /* =========================
     FETCH DATA
  ========================= */
  useEffect(() => {
    fetchFeedback();
    // eslint-disable-next-line
  }, [page, search, statusFilter, ratingFilter]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminFeedback({
        page,
        pageSize,
        search,
        isApproved: statusFilter,
        rating: ratingFilter,
      });

      setFeedbacks(data.results);
      setCount(data.count);
    } catch (err) {
      console.error("Failed to load feedback", err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ACTIONS
  ========================= */
  const handleApprove = async (id) => {
    await approveFeedback(id);
    fetchFeedback();
  };

  const handleUnapprove = async (id) => {
    await updateFeedbackStatus(id, false);
    fetchFeedback();
  };

  const handleBulkApprove = async () => {
    await Promise.all(selectedIds.map((id) => approveFeedback(id)));
    setSelectedIds([]);
    fetchFeedback();
  };

  /* =========================
     UI STATES
  ========================= */
  if (loading) return <Skeleton rows={8} />;

  if (!loading && count === 0) {
    return (
      <EmptyState
        description="Customer reviews will appear here once submitted."
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-800">
          Customer Feedback
        </h1>

        <div className="flex flex-wrap gap-3">
          <input
            placeholder="Search name, email, comment..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-100"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="true">Approved</option>
            <option value="false">Pending</option>
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => {
              setPage(1);
              setRatingFilter(e.target.value);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All ratings</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} ★
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-indigo-50 px-4 py-3 text-sm">
          <span className="font-medium text-indigo-700">
            {selectedIds.length} selected
          </span>
          <button
            onClick={handleBulkApprove}
            className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            Bulk approve
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setSelectedIds(
                      e.target.checked ? feedbacks.map((f) => f.id) : []
                    )
                  }
                />
              </th>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Rating</th>
              <th className="px-4 py-3 text-left">Comment</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {feedbacks.map((fb) => (
              <tr key={fb.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(fb.id)}
                    onChange={() =>
                      setSelectedIds((prev) =>
                        prev.includes(fb.id)
                          ? prev.filter((i) => i !== fb.id)
                          : [...prev, fb.id]
                      )
                    }
                  />
                </td>

                <td className="px-4 py-3">
                  <div className="font-medium">{fb.name}</div>
                  <div className="text-xs text-gray-500">{fb.email}</div>
                </td>

                <td className="px-4 py-3 text-amber-600 font-semibold">
                  {"★".repeat(fb.rating)}
                </td>

                <td className="px-4 py-3 max-w-md">
                  <button
                    onClick={() => setSelectedFeedback(fb)}
                    className="text-left text-gray-700 hover:underline line-clamp-2"
                  >
                    {fb.comment}
                  </button>
                </td>

                <td className="px-4 py-3">
                  <StatusBadge featured={fb.is_approved} />
                </td>

                <td className="px-4 py-3 text-right space-x-2">
                  {!fb.is_approved ? (
                    <button
                      onClick={() => handleApprove(fb.id)}
                      className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-700"
                    >
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnapprove(fb.id)}
                      className="rounded-md bg-rose-100 px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-200"
                    >
                      Unapprove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}          
        setPage={setPage}   
        pageCount={Math.ceil(count / pageSize)}
      />


      {/* COMMENT MODAL */}
      {selectedFeedback && (
        <ConfirmDialog
          title={`Feedback from ${selectedFeedback.name}`}
          message={selectedFeedback.comment}
          confirmText="Close"
          hideCancel
          onConfirm={() => setSelectedFeedback(null)}
        />
      )}
    </div>
  );
}
