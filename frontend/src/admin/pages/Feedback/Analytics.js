import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { getFeedbackAnalytics } from "../../services/adminApi";
import { MessageSquare, Star, ThumbsUp, TrendingUp, AlertCircle } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from "recharts";

// --- Custom Stat Card for this Page ---
const StatCard = ({ label, value, sub, icon: Icon, color }) => {
  const themes = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between h-36 hover:border-gray-300 transition-all duration-300 group">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
          <h3 className="font-serif text-4xl font-bold text-gray-900 tracking-tight group-hover:scale-105 transition-transform origin-left">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${themes[color]} bg-opacity-60`}>
          <Icon size={22} strokeWidth={2.5} />
        </div>
      </div>
      {sub && <p className="text-xs font-medium text-gray-500 mt-2">{sub}</p>}
    </div>
  );
};

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
  if (!data) return <div className="p-12 text-center text-gray-400">No analytics data available.</div>;

  const { avg_ratings, rating_distribution } = data;

  // --- Calculations ---
  const totalReviews = rating_distribution.reduce((acc, curr) => acc + curr.count, 0);
  const weightedSum = rating_distribution.reduce((acc, curr) => acc + (curr.rating * curr.count), 0);
  const averageScore = totalReviews > 0 ? (weightedSum / totalReviews) : 0;
  
  const fiveStarCount = rating_distribution.find(r => r.rating === 5)?.count || 0;
  const sentimentScore = totalReviews > 0 ? Math.round((fiveStarCount / totalReviews) * 100) : 0;

  // Colors for Bar Chart (1=Red -> 5=Green)
  const barColors = ["#EF4444", "#F97316", "#EAB308", "#84CC16", "#22C55E"];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-12">

      <Helmet>
        <title>Feedback Analytics | JK Admin</title>
      </Helmet>
      
      {/* 1. HEADER */}
      <div className="border-b border-gray-100 pb-6 flex justify-between items-end">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Feedback Insights</h1>
          <p className="text-gray-500 text-sm mt-1">Measuring community sentiment & satisfaction.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-bold border border-amber-100">
           <Star size={14} fill="currentColor" /> Live Metrics
        </div>
      </div>

      {/* 2. KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          label="Total Reviews" 
          value={totalReviews.toLocaleString()} 
          icon={MessageSquare} 
          color="blue" 
          sub="All time volume"
        />
        <StatCard 
          label="Average Rating" 
          value={averageScore.toFixed(1)} 
          icon={Star} 
          color="amber" 
          sub="Out of 5.0 stars"
        />
        <StatCard 
          label="5-Star Reviews" 
          value={fiveStarCount.toLocaleString()} 
          icon={ThumbsUp} 
          color="emerald" 
          sub="Highest praise count"
        />
        
        {/* Sentiment Meter Card */}
        <div className="bg-indigo-900 p-6 rounded-2xl shadow-lg flex items-center justify-between relative overflow-hidden h-36">
           <div className="relative z-10">
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Sentiment Score</p>
              <h3 className="text-4xl font-serif font-bold text-white">{sentimentScore}%</h3>
              <p className="text-indigo-300 text-xs mt-2">Positive interactions</p>
           </div>
           
           {/* Decorative Circular Chart using Pie */}
           <div className="h-24 w-24 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={[{ value: sentimentScore }, { value: 100 - sentimentScore }]} 
                    innerRadius={28} 
                    outerRadius={38} 
                    dataKey="value" 
                    startAngle={90} 
                    endAngle={-270}
                    stroke="none"
                  >
                    <Cell fill="#818CF8" />
                    <Cell fill="#312E81" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                 <TrendingUp size={18} className="text-indigo-400" />
              </div>
           </div>
           
           {/* Background Glow */}
           <div className="absolute -right-4 -top-10 w-32 h-32 bg-indigo-500 rounded-full blur-[50px] opacity-30"></div>
        </div>
      </div>

      {/* 3. CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT: Rating Trend Over Time */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <div className="mb-8">
            <h3 className="font-serif text-xl font-bold text-gray-900">Rating History</h3>
            <p className="text-sm text-gray-500">Average score trend over time</p>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={avg_ratings}>
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
                  tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                  minTickGap={40}
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                />
                <YAxis domain={[0, 5]} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#FCD34D' }}
                  labelStyle={{ color: '#9CA3AF', marginBottom: '0.25rem' }}
                  formatter={(val) => [`${Number(val).toFixed(1)} Stars`, "Avg Rating"]}
                  labelFormatter={(val) => new Date(val).toLocaleDateString()}
                />
                <Area 
                  type="monotone" 
                  dataKey="avg_rating" 
                  stroke="#F59E0B" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#goldGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT: Star Distribution */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-xl font-bold text-gray-900">Star Distribution</h3>
            <p className="text-sm text-gray-500 mb-6">Breakdown by rating count</p>
          </div>
          
          <div className="h-[280px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rating_distribution} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="rating" 
                  type="category" 
                  tickFormatter={(val) => `${val} ★`}
                  width={40}
                  tick={{ fill: '#4B5563', fontWeight: '800', fontSize: '14px' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                  {rating_distribution.map((entry, index) => {
                    // Map rating 1-5 to correct color index
                    // Assuming data might not be sorted, we use entry.rating - 1
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

// --- Skeleton ---
const AnalyticsSkeleton = () => (
  <div className="space-y-8 animate-pulse p-4">
    <div className="h-10 w-64 bg-gray-200 rounded-xl mb-8"></div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-gray-200 rounded-2xl"></div>)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="h-80 bg-gray-200 rounded-2xl"></div>
      <div className="h-80 bg-gray-200 rounded-2xl"></div>
    </div>
  </div>
);