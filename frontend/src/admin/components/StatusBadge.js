export default function StatusBadge({ value, featured, type = "pill" }) {
  // Normalize input
  const status = typeof featured === "boolean" 
    ? (featured ? "ACTIVE" : "INACTIVE") 
    : value?.toUpperCase();

  const configs = {
    // Green (Success)
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200 dot-emerald-500",
    SUCCESS: "bg-emerald-50 text-emerald-700 border-emerald-200 dot-emerald-500",
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200 dot-emerald-500",
    PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200 dot-emerald-500",

    // Blue (Info)
    CREATE: "bg-blue-50 text-blue-700 border-blue-200 dot-blue-500",
    LOGIN: "bg-blue-50 text-blue-700 border-blue-200 dot-blue-500",
    
    // Yellow (Warning)
    PENDING: "bg-amber-50 text-amber-700 border-amber-200 dot-amber-500",
    UPDATE: "bg-amber-50 text-amber-700 border-amber-200 dot-amber-500",

    // Red (Danger)
    FAILED: "bg-rose-50 text-rose-700 border-rose-200 dot-rose-500",
    REJECTED: "bg-rose-50 text-rose-700 border-rose-200 dot-rose-500",
    DELETE: "bg-rose-50 text-rose-700 border-rose-200 dot-rose-500",
    INACTIVE: "bg-rose-50 text-rose-700 border-rose-200 dot-rose-500",

    // Gray (Default)
    DEFAULT: "bg-gray-50 text-gray-600 border-gray-200 dot-gray-400",
  };

  const style = configs[status] || configs.DEFAULT;
  const dotColor = style.split(" ").find(c => c.startsWith("dot-")).replace("dot-", "bg-");

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${style.replace(/dot-\w+/, "")}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {status}
    </span>
  );
}