export default function StatusBadge({ value, featured }) {
  // Legacy boolean usage
  if (typeof featured === "boolean") {
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          featured
            ? "bg-emerald-100 text-emerald-700"
            : "bg-rose-100 text-rose-700"
        }`}
      >
        {featured ? "Active" : "Inactive"}
      </span>
    );
  }

  // Action-based styles
  const actionStyles = {
    CREATE: "bg-blue-100 text-blue-700",
    UPDATE: "bg-indigo-100 text-indigo-700",
    DELETE: "bg-red-100 text-red-700",
    LOGIN: "bg-purple-100 text-purple-700",
    LOGOUT: "bg-gray-100 text-gray-700",
  };

  // Payment / Feedback statuses
  const statusStyles = {
    SUCCESS: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-yellow-100 text-yellow-800",
    FAILED: "bg-rose-100 text-rose-700",
    REFUNDED: "bg-purple-100 text-purple-800",
    APPROVED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-rose-100 text-rose-700",
  };

  const styles = actionStyles[value] || statusStyles[value] || "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${styles}`}
    >
      {value}
    </span>
  );
}
