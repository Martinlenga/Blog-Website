import React from 'react';
import { TrendingUp } from 'lucide-react';

const StatCard = ({ label, value, trend, icon: Icon, color = "indigo" }) => {
  const themes = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0 flex-1"> {/* Added flex-1 to allow text to take remaining space */}
          {/* Removed 'truncate' and added 'leading-tight' to allow multiline wrapping */}
          <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-1.5 leading-tight">
            {label}
          </p>
          <h3 className="font-sans text-2xl font-bold text-gray-900 truncate tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`p-2.5 rounded-xl shrink-0 ${themes[color]} bg-opacity-50`}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-4">
        {trend !== undefined && (
          <span className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${trend >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
            <TrendingUp size={10} className="mr-1" /> {trend}%
          </span>
        )}
        <span className="text-[11px] text-gray-400 font-medium">vs last month</span>
      </div>
    </div>
  );
};

export default StatCard;