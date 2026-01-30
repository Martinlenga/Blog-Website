// src/admin/components/Skeleton.jsx
export default function Skeleton({ rows = 5, cols = 8 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex gap-2 mb-2"
        >
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="bg-gray-200 rounded h-6 flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
}
