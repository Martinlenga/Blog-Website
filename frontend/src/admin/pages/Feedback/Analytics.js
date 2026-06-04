import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { getFeedbackAnalytics } from "../../services/adminApi";
import { MessageSquare, Star, ThumbsUp, TrendingUp } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, LabelList
} from "recharts";

import StatCard from "../../components/StatCard";
import ChartCard from "../../components/ChartCard"; // 🚀 Added reusable wrapper
import { Skeleton } from "../../components/Skeleton"; // 🚀 Added reusable skeleton

export default function FeedbackAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🚀 ARCHITECTURE FIX: Prevent state updates on unmounted components
  useEffect(() => {
    let isMounted = true;

    async function fetch() {
      try {
        const res = await getFeedbackAnalytics();
        if (isMounted) setData(res.data);
      } catch (err) {
        if (isMounted) console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    fetch();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <AnalyticsSkeleton />;
  if (!data) return <div className="p-12 text-center text-gray-500 font-medium">No analytics data available.</div>;

  // 🚀 DATA SAFETY FIX: Provide empty array fallbacks to prevent .reduce() crashes
  const avg_ratings = data.avg_ratings || [];
  const rating_distribution = data.rating_distribution || [];

  const totalReviews = rating_distribution.reduce((acc, curr) => acc + (curr.count || 0), 0);
  const weightedSum = rating_distribution.reduce((acc, curr) => acc + ((curr.rating || 0) * (curr.count || 0)), 0);
  const averageScore = totalReviews > 0 ? (weightedSum / totalReviews) : 0;
  
  const fiveStarCount = rating_distribution.find(r => r.rating === 5)?.count || 0;
  const sentimentScore = totalReviews > 0 ? Math.round((fiveStarCount / totalReviews) * 100) : 0;

  const barColors = ["#EF4444", "#F97316", "#EAB308", "#84CC16", "#22C55E"];

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Helmet>
        <title>Feedback Analytics | JK Admin</title>
      </Helmet>
      
      {/* HEADER ROW */}
      <div className="border-b border-gray-100 pb-5 sm:pb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Feedback Insights</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Measuring community sentiment & satisfaction metrics.</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-100 self-start sm:self-auto shadow-sm">
          <Star size={14} fill="currentColor" /> <span>Live Metrics</span>
        </div>
      </div>

      {/* KPI GRID VIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
        <StatCard label="Total Reviews" value={totalReviews.toLocaleString()} icon={MessageSquare} color="blue" />
        <StatCard label="Average Rating" value={averageScore.toFixed(1)} icon={Star} color="amber" />
        <StatCard label="5-Star Reviews" value={fiveStarCount.toLocaleString()} icon={ThumbsUp} color="emerald" />
        
        {/* Refined Sentiment Meter Card */}
        <div className="bg-slate-900 p-5 rounded-2xl shadow-sm flex items-center justify-between relative overflow-hidden h-full min-h-[120px]">
          <div className="relative z-10 min-w-0 flex-1">
            <p className="text-indigo-300 text-[11px] font-bold uppercase tracking-widest mb-1.5 leading-tight">Sentiment Score</p>
            <h3 className="text-3xl font-sans font-bold text-white tracking-tight">{sentimentScore}%</h3>
          </div>
          
          <div className="h-[70px] w-[70px] relative z-10 shrink-0 ml-4">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie 
                  data={[{ value: sentimentScore }, { value: Math.max(100 - sentimentScore, 0) }]} 
                  innerRadius="70%" outerRadius="100%" 
                  dataKey="value" startAngle={90} endAngle={-270} stroke="none"
                >
                  <Cell fill="#818CF8" />
                  <Cell fill="#374151" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <TrendingUp size={18} className="text-indigo-400" />
            </div>
          </div>
          
          <div className="absolute -right-6 -top-10 w-32 h-32 bg-indigo-500 rounded-full blur-[50px] opacity-20 pointer-events-none"></div>
        </div>
      </div>

      {/* CHARTS CONTAINER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* AREA: RATING HISTORY */}
        <div className="h-[350px] sm:h-[400px]">
          <ChartCard 
            title="Rating History" 
            subtitle="Average score trend lines over time"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={avg_ratings} margin={{ left: -30, right: 5, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} tickLine={false} 
                  tick={{ fill: '#9CA3AF', fontSize: 11 }} 
                  minTickGap={30}
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                  dy={10}
                />
                <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#FCD34D' }}
                  formatter={(val) => [`${Number(val).toFixed(2)} Stars`, "Avg Rating"]}
                  labelFormatter={(val) => new Date(val).toLocaleDateString()}
                />
                <Area type="monotone" dataKey="avg_rating" stroke="#F59E0B" strokeWidth={3} fill="url(#goldGradient)" activeDot={{ r: 6, fill: "#F59E0B", stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* BAR: STAR DISTRIBUTION */}
        <div className="h-[350px] sm:h-[400px]">
          <ChartCard 
            title="Star Distribution" 
            subtitle="Volume metrics broken down by individual ratings"
          >
            
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rating_distribution} layout="vertical" margin={{ left: 0, right: 50, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="rating" 
                  type="category" 
                  tickFormatter={(val) => `${val} ★`}
                  width={35}
                  tick={{ fill: '#4B5563', fontWeight: '700', fontSize: '12px' }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  formatter={(val) => [val.toLocaleString(), "Reviews"]}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
                  
                
                  <LabelList 
                    dataKey="count" 
                    position="right" 
                    offset={8} // Pushes the text 8px away from the end of the bar
                    fill="#6B7280" // A nice soft gray color
                    fontSize={12}
                    fontWeight={700}
                    // Optional: Only show the number if it's greater than 0, and format with commas
                    formatter={(val) => val > 0 ? val.toLocaleString() : ''} 
                  />

                  {rating_distribution.map((entry, index) => {
                    const colorIndex = Math.min(Math.max(Number(entry.rating) - 1, 0), 4);
                    return <Cell key={`cell-${index}`} fill={barColors[colorIndex]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

      </div>
    </div>
  );
}

const AnalyticsSkeleton = () => (
  <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-12 px-4 sm:px-6 lg:px-8">
    <div className="border-b border-gray-100 pb-5 sm:pb-6 flex justify-between items-center">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-8 w-24 rounded-full" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[120px] rounded-2xl" />)}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
      <Skeleton className="h-[350px] sm:h-[400px] rounded-2xl" />
      <Skeleton className="h-[350px] sm:h-[400px] rounded-2xl" />
    </div>
  </div>
);