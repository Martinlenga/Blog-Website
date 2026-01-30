import { ArrowUp, ArrowDown } from "lucide-react";

export default function KpiCard({ title, value, growth, icon }) {
  const isPositive = growth >= 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition flex justify-between items-center">
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {growth !== undefined && (
          <span
            className={`flex items-center text-sm mt-1 font-semibold ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            {Math.abs(growth).toFixed(2)}%
          </span>
        )}
      </div>
      {icon && <div className="text-gray-300">{icon}</div>}
    </div>
  );
}
