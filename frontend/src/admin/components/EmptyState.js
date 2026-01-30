// src/admin/components/EmptyState.jsx
export default function EmptyState({
  title = "No data available",
  description = "",
  icon = (
    <svg
      className="w-16 h-16 mb-4 text-gray-300"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 7h18M3 12h18M3 17h18"
      />
    </svg>
  ),
  children, // optional action buttons
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      {icon}
      <h2 className="text-lg font-semibold text-gray-700 mb-1">{title}</h2>
      {description && <p className="text-sm text-gray-400 mb-4">{description}</p>}
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}
