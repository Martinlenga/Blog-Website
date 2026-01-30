// src/admin/components/Pagination.jsx
export default function Pagination({ page, setPage, pageCount }) {
  const prev = () => setPage((p) => Math.max(p - 1, 1));
  const next = () => setPage((p) => Math.min(p + 1, pageCount));

  return (
    <div className="flex items-center justify-end gap-2 mt-4">
      <button
        onClick={prev}
        disabled={page === 1}
        className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
      >
        Prev
      </button>
      <span className="px-2">
        {page} / {pageCount}
      </span>
      <button
        onClick={next}
        disabled={page === pageCount}
        className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
