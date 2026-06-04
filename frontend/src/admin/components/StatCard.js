import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({ label, value, trend, icon: Icon, color = "indigo" }) => {
  const hasTrendData = trend !== undefined && trend !== null;
  const isPositive = trend > 0;
  const isNegative = trend < 0;
  const isNeutral = trend === 0;

  const themes = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-1.5 leading-tight">
            {label}
          </h2>
          
          {/* 🚀 THE FIX: Removed 'truncate', added 'break-words', and made the font responsive (text-xl on mobile, 2xl on desktop) */}
          <div className="font-sans text-xl sm:text-2xl font-bold text-gray-900 break-words tracking-tight">
            {value}
          </div>

        </div>
        
        {Icon && (
          <div 
            className={`p-2.5 rounded-xl shrink-0 ${themes[color] || themes.indigo}`}
            aria-hidden="true"
          >
            <Icon size={18} strokeWidth={2.5} />
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 mt-4">
        {hasTrendData && (
          <div 
            className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isPositive ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
              : isNegative ? "bg-rose-50 text-rose-700 border-rose-100"
              : "bg-gray-50 text-gray-600 border-gray-200"
            }`}
          >
            {isPositive && <TrendingUp size={12} className="mr-1" aria-hidden="true" />}
            {isNegative && <TrendingDown size={12} className="mr-1" aria-hidden="true" />}
            {isNeutral && <Minus size={12} className="mr-1" aria-hidden="true" />}
            
            <span>{Math.abs(trend)}%</span>
            
            <span className="sr-only">
              {isPositive ? 'increase' : isNegative ? 'decrease' : 'no change'}
            </span>
          </div>
        )}
        <span className="text-[11px] text-gray-400 font-medium">vs last month</span>
      </div>
    </div>
  );
};

export default StatCard;