import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export default function KpiCard({ title, value, trend, trendLabel, icon: Icon, color = "indigo" }) {
  const isPositive = trend > 0;
  const isNeutral = trend === 0 || trend === undefined;

  // Modern Color Palettes
  const themes = {
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100 group-hover:ring-indigo-200",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100 group-hover:ring-emerald-200",
    blue: "bg-blue-50 text-blue-600 ring-blue-100 group-hover:ring-blue-200",
    amber: "bg-amber-50 text-amber-600 ring-amber-100 group-hover:ring-amber-200",
    rose: "bg-rose-50 text-rose-600 ring-rose-100 group-hover:ring-rose-200",
  };

  return (
    <div className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        {/* Icon Box */}
        <div className={`p-3 rounded-xl ring-1 transition-all duration-300 ${themes[color]}`}>
          {Icon && <Icon size={22} strokeWidth={2.5} />}
        </div>

        {/* Trend Badge */}
        {!isNeutral && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
            isPositive 
              ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
              : "bg-rose-50 text-rose-700 border-rose-100"
          }`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      <div>
        <p className="text-gray-500 text-xs font-semibold tracking-wider uppercase mb-1">{title}</p>
        <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {value}
        </h3>
        {trendLabel && (
          <div className="flex items-center gap-1 mt-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
            <p className="text-xs text-gray-400 font-medium">{trendLabel}</p>
          </div>
        )}
      </div>
    </div>
  );
}