import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { getDashboardStats } from "../../services/adminApi";
import { useAdmin } from "../../context/AdminContext";
import { 
  DollarSign, Users, Eye, TrendingUp, Calendar, ArrowUpRight, Star, 
  Tag, Clock, User
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell
} from "recharts";

import placeholder from "../../../assets/article-placeholder.jpg";
import StatCard from "../../components/StatCard";

export default function Overview() {
  const { admin } = useAdmin();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (!data) return null;

  const { kpis, revenue_trend, top_posts, featured_post } = data;
  
  const conversionRate = kpis.total_views > 0 
    ? ((kpis.total_customers / kpis.total_views) * 100).toFixed(1) 
    : 0;
  
  const totalTransactions = revenue_trend.reduce((acc, curr) => acc + curr.sales, 0);

  // 🔹 SOLID Y-AXIS FORMATTING LOGIC
  // Prevents decimals by rounding clean numbers, falling back to real representations
  const formatYAxis = (val) => {
    if (val === 0) return "0";
    if (val >= 1000) {
      return `Kshs ${(val / 1000).toFixed(0)}k`;
    }
    return `Kshs ${val}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in-up pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Helmet>
        <title>Dashboard Overview | JK Admin</title>
      </Helmet>
      
      {/* 1. HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 sm:pb-6">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Welcome back, <span className="font-semibold text-gray-900">{admin?.first_name}</span>. Here is today's report.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-600 shadow-sm self-start sm:self-auto">
          <Calendar size={14} className="text-indigo-600 shrink-0" />
          <span>{new Date().toLocaleDateString("en-US", { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* 2. RESPONSIVE KPI GRID */}
      {/* Updated KPI Grid for better spacing on large screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
        <StatCard label="Monthly Revenue" value={`Kshs ${kpis.this_month_revenue.toLocaleString()}`} trend={kpis.growth} icon={DollarSign} color="emerald" />
        <StatCard label="Total Views" value={kpis.total_views?.toLocaleString()} icon={Eye} color="indigo" />
        <StatCard label="Paying Readers" value={kpis.total_customers} icon={Users} color="blue" />
        <StatCard label="Conversion" value={`${conversionRate}%`} icon={ArrowUpRight} color="amber" />
      </div>
      {/* 3. CHART & TOP STORIES CONTAINER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* LEFT CHART LAYOUT */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
          <div className="mb-6">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900">Revenue Performance</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Income trends over the last 12 months</p>
          </div>
          {/* Responsive container heights for stable mobile rendering */}
          <div className="h-[250px] sm:h-[320px] min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue_trend} margin={{ left: -15, right: 5, top: 10 }}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 11}} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#6b7280', fontSize: 11}} 
                  tickFormatter={formatYAxis}
                  allowDecimals={false} // Forces whole integer tracks explicitly
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  formatter={(val) => `Kshs ${val.toLocaleString()}`}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2.5} fill="url(#colorGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT TOP STORIES PANEL */}
        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900 mb-5">Top Stories</h3>
          <div className="space-y-5 overflow-y-auto pr-1 custom-scrollbar flex-1 max-h-[350px] lg:max-h-none">
            {top_posts.slice(0, 5).map((post, idx) => (
              <div key={idx} className="flex items-start gap-3 group cursor-default">
                <span className="flex-shrink-0 w-5 text-base sm:text-lg font-serif font-bold text-gray-300 group-hover:text-indigo-500 transition-colors">
                  0{idx + 1}
                </span>
                <div className="flex-1 min-w-0 pb-3 border-b border-gray-50 last:border-0">
                  <p className="text-xs sm:text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {post.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] font-medium text-gray-500">
                    <span className="flex items-center gap-1"><Eye size={12}/> {post.views.toLocaleString()}</span>
                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Kshs {post.revenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
            {top_posts.length === 0 && <p className="text-gray-400 text-xs">No data available.</p>}
          </div>
        </div>
      </div>

      {/* 4. LOWER CONTAINER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* FEATURED POST COMPONENT CARD */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-300">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center">
            <h3 className="font-serif text-base sm:text-lg font-bold text-gray-900">Featured Article</h3>
            <span className="bg-indigo-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Star size={9} fill="currentColor" /> Active
            </span>
          </div>

          {featured_post ? (
            <div className="flex flex-col sm:flex-row h-full">
              {/* Responsive Image boundaries */}
              <div className="sm:w-2/5 relative min-h-[180px] sm:min-h-0 overflow-hidden group">
                <img
                  src={featured_post.banner_image || placeholder}
                  alt={featured_post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <div className="p-5 sm:p-6 sm:w-3/5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-bold text-indigo-700 text-[9px] uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                      <Tag size={9} /> {featured_post.category || "Editorial"}
                    </span>
                    <span className="text-gray-300 text-[10px]">|</span>
                    <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                      <Clock size={10} /> {new Date(featured_post.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg leading-tight font-bold text-gray-900 group-hover:text-indigo-700 transition-colors line-clamp-3">
                    {featured_post.title}
                  </h3>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                      <User size={14} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Author</span>
                      <span className="text-xs font-semibold text-gray-900 truncate capitalize">{featured_post.author || "Admin"}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">Price</span>
                    <span className="text-base sm:text-lg font-extrabold text-emerald-600 font-serif">
                      Kshs {Number(featured_post.price).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 bg-gray-50/50 min-h-[200px]">
              <Star size={24} className="text-gray-300 mb-2" />
              <p className="font-medium text-gray-600 text-sm">No article featured.</p>
            </div>
          )}
        </div>

        {/* BAR CHART: TRANSACTION VOLUME */}
        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-end mb-6 gap-4">
             <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900">Transaction Volume</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Monthly payment activity count</p>
             </div>
             <div className="text-right shrink-0">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Total Sales</p>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">{totalTransactions}</p>
             </div>
          </div>
          
          <div className="w-full h-44 min-h-[176px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue_trend} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" hide />
                <Tooltip 
                  cursor={{ fill: '#F9FAFB' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white text-[11px] p-2 rounded-lg shadow-xl">
                          <p className="font-bold text-slate-300 mb-0.5">{label}</p>
                          <p className="font-medium text-white">{payload[0].value} Sales</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="sales" radius={[2, 2, 0, 0]} barSize={8}>
                  {revenue_trend?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#4F46E5" : "#818CF8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      <div className="h-10 w-48 bg-gray-200 rounded-xl mb-6"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl"></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 sm:h-80 bg-gray-200 rounded-2xl"></div>
        <div className="h-72 sm:h-80 bg-gray-200 rounded-2xl"></div>
      </div>
    </div>
  );
}