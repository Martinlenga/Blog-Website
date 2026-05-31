import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { getFeedbackAnalytics } from "../../services/adminApi";
import { MessageSquare, Star, ThumbsUp, TrendingUp } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from "recharts";
import StatCard from "../../components/StatCard";

export default function FeedbackAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await getFeedbackAnalytics();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  if (loading) return <AnalyticsSkeleton />;
  if (!data) return <div className="p-12 text-center text-gray-400 text-sm">No analytics data available.</div>;

  const { avg_ratings, rating_distribution } = data;

  const totalReviews = rating_distribution.reduce((acc, curr) => acc + curr.count, 0);
  const weightedSum = rating_distribution.reduce((acc, curr) => acc + (curr.rating * curr.count), 0);
  const averageScore = totalReviews > 0 ? (weightedSum / totalReviews) : 0;
  
  const fiveStarCount = rating_distribution.find(r => r.rating === 5)?.count || 0;
  const sentimentScore = totalReviews > 0 ? Math.round((fiveStarCount / totalReviews) * 100) : 0;

  const barColors = ["#EF4444", "#F97316", "#EAB308", "#84CC16", "#22C55E"];

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in-up pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Helmet>
        <title>Feedback Analytics | JK Admin</title>
      </Helmet>
      
      {/* HEADER ROW */}
      <div className="border-b border-gray-100 pb-5 sm:pb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Feedback Insights</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Measuring community sentiment & satisfaction metrics.</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-100 self-start sm:self-auto">
          <Star size={12} fill="currentColor" /> <span>Live Metrics</span>
        </div>
      </div>

      {/* KPI GRID VIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Stat Cards inherit your refined, non-truncating styles */}
      <StatCard label="Total Reviews" value={totalReviews.toLocaleString()} icon={MessageSquare} color="blue" sub="All time volume" />
      <StatCard label="Average Rating" value={averageScore.toFixed(1)} icon={Star} color="amber" sub="Out of 5.0 stars" />
      <StatCard label="5-Star Reviews" value={fiveStarCount.toLocaleString()} icon={ThumbsUp} color="emerald" sub="Highest praise count" />
      
      {/* Refined Sentiment Meter Card */}
      <div className="bg-indigo-900 p-6 rounded-2xl shadow-sm flex items-center justify-between relative overflow-hidden h-[150px]">
        <div className="relative z-10 min-w-0 flex-1">
          <p className="text-indigo-300 text-[11px] font-bold uppercase tracking-widest mb-1.5">Sentiment Score</p>
          <h3 className="text-4xl font-sans font-bold text-white tracking-tight">{sentimentScore}%</h3>
          <p className="text-indigo-300 text-xs mt-2 font-medium">Positive interactions</p>
        </div>
        
        <div className="h-20 w-20 relative z-10 shrink-0 ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={[{ value: sentimentScore }, { value: 100 - sentimentScore }]} 
                innerRadius="70%" outerRadius="95%" 
                dataKey="value" startAngle={90} endAngle={-270} stroke="none"
              >
                <Cell fill="#818CF8" />
                <Cell fill="#312E81" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <TrendingUp size={20} className="text-indigo-300" />
          </div>
        </div>
        
        {/* Decorative blur effect kept subtle */}
        <div className="absolute -right-6 -top-10 w-24 h-24 bg-indigo-500 rounded-full blur-[40px] opacity-20"></div>
      </div>
    </div>

      {/* CHARTS CONTAINER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* AREA: RATING HISTORY */}
        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
          <div className="mb-6">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900">Rating History</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Average score trend lines over time</p>
          </div>
          <div className="h-[250px] sm:h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={avg_ratings} margin={{ left: -30, right: 5 }}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15}/>
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
                />
                {/* 🔹 FIXED INLINE STEPPERS: Forces clean integer constraints to prevent decimals */}
                <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#FCD34D' }}
                  formatter={(val) => [`${Number(val).toFixed(2)} Stars`, "Avg Rating"]}
                  labelFormatter={(val) => new Date(val).toLocaleDateString()}
                />
                <Area type="monotone" dataKey="avg_rating" stroke="#F59E0B" strokeWidth={3} fill="url(#goldGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BAR: STAR DISTRIBUTION */}
        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
          <div className="mb-4">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900">Star Distribution</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Volume metrics broken down by individual ratings</p>
          </div>
          
          <div className="h-[250px] sm:h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rating_distribution} layout="vertical" margin={{ left: -10, right: 15 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="rating" 
                  type="category" 
                  tickFormatter={(val) => `${val} ★`}
                  width={45}
                  tick={{ fill: '#4B5563', fontWeight: '700', fontSize: '12px' }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
                  {rating_distribution.map((entry, index) => {
                    const colorIndex = Math.min(Math.max(entry.rating - 1, 0), 4);
                    return <Cell key={`cell-${index}`} fill={barColors[colorIndex]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

const AnalyticsSkeleton = () => (
  <div className="space-y-6 p-4 max-w-7xl mx-auto animate-pulse">
    <div className="h-10 w-48 bg-gray-200 rounded-xl mb-6"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl"></div>)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-72 bg-gray-200 rounded-2xl"></div>
      <div className="h-72 bg-gray-200 rounded-2xl"></div>
    </div>
  </div>
);