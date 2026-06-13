import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { getDashboardStats } from "../../services/adminApi";
import { useAdmin } from "../../context/AdminContext";
import { 
  DollarSign, Users, Eye, ArrowUpRight, Calendar, Star, 
  Tag, Clock, User, Layers
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Bar, ComposedChart, Line, Legend
} from "recharts";

import placeholder from "../../../assets/article-placeholder.jpg";
import StatCard from "../../components/StatCard";
import ChartCard from "../../components/ChartCard"; // 🚀 Added integration
import { Skeleton } from "../../components/Skeleton";

export default function Overview() {
  const { admin } = useAdmin();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🚀 ARCHITECTURE FIX: Prevent state updates on unmounted components
  useEffect(() => {
    let isMounted = true;

    getDashboardStats()
      .then((res) => {
        if (isMounted) setData(res.data);
      })
      .catch((err) => {
        if (isMounted) console.error("Failed to load dashboard data:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (!data) return (
    <div className="flex h-[50vh] items-center justify-center text-gray-500">
      Failed to load dashboard data. Please try refreshing.
    </div>
  );

  const { kpis, revenue_trend, top_posts, featured_post } = data;
  
  // Safe math calculations
  const totalViews = kpis?.total_views || 0;
  const totalCustomers = kpis?.total_customers || 0;
  
  const conversionRate = totalViews > 0 
    ? ((totalCustomers / totalViews) * 100).toFixed(1) 
    : "0.0";
  
  const totalTransactions = (revenue_trend || []).reduce((acc, curr) => acc + (curr.sales || 0), 0);

  const formatYAxis = (val) => {
    if (val === 0) return "0";
    if (val >= 1000) return `Kshs ${(val / 1000).toFixed(0)}k`;
    return `Kshs ${val}`;
  };
  
  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 font-sans">
      <Helmet>
        <title>Dashboard Overview | JK Admin</title>
      </Helmet>
      
      {/* 1. HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 sm:pb-6">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Welcome back, <span className="font-semibold text-gray-900">{admin?.first_name || 'Admin'}</span>. Here is today's report.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-600 shadow-sm self-start sm:self-auto">
          <Calendar size={14} className="text-indigo-600 shrink-0" />
          <span>{new Date().toLocaleDateString("en-US", { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* 2. RESPONSIVE KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
        <StatCard label="Monthly Revenue" value={`Kshs ${(kpis?.this_month_revenue || 0).toLocaleString()}`} trend={kpis?.growth} icon={DollarSign} color="emerald" />
        <StatCard label="Total Views" value={totalViews.toLocaleString()} icon={Eye} color="indigo" />
        <StatCard label="Paying Readers" value={totalCustomers.toLocaleString()} icon={Users} color="blue" />
        <StatCard label="Conversion" value={`${conversionRate}%`} icon={ArrowUpRight} color="amber" />
      </div>

      {/* 3. CHART & TOP STORIES CONTAINER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* LEFT CHART LAYOUT: Uses your reusable ChartCard now! */}
        <div className="lg:col-span-2 h-[350px] sm:h-[420px]">
          <ChartCard 
            title="Revenue Performance" 
            subtitle="Income trends over the last 12 months"
          >
            {/* 🚀 FIX 1: Changed height from 350 to "100%" */}
            <ResponsiveContainer width="100%" height="100%">
              
              {/* 🚀 FIX 2: Increased 'bottom' margin to 25 so X-axis labels fit, and changed 'left' from -15 to 0 so big numbers don't clip */}
              <AreaChart data={revenue_trend || []} margin={{ left: 0, right: 5, top: 10, bottom: 25 }}>
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
                  allowDecimals={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  formatter={(val) => [`Kshs ${Number(val).toLocaleString()}`, 'Revenue']}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2.5} fill="url(#colorGradient)" activeDot={{ r: 6, fill: "#4F46E5", stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* RIGHT TOP STORIES PANEL */}
        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[350px] sm:h-[420px]">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900 mb-5">Top Stories</h3>
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {(top_posts || []).slice(0, 5).map((post, idx) => (
              <div key={idx} className="flex items-start gap-3 group cursor-default pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                <span className="flex-shrink-0 w-5 text-base sm:text-lg font-serif font-bold text-gray-300 group-hover:text-indigo-500 transition-colors">
                  0{idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {post.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] font-medium text-gray-500">
                    <span className="flex items-center gap-1"><Eye size={12}/> {(post.views || 0).toLocaleString()}</span>
                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Kshs {(post.revenue || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
            {(!top_posts || top_posts.length === 0) && (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">No stories available.</div>
            )}
          </div>
        </div>
      </div>

      {/* 4. LOWER CONTAINER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* FEATURED POST COMPONENT CARD */}
        {/* FEATURED POST COMPONENT CARD */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-xl transition-all duration-300 group/card">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center shrink-0">
            <h3 className="font-serif text-base sm:text-lg font-bold text-gray-900">Featured Article</h3>
            <span className="bg-indigo-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Star size={9} fill="currentColor" /> Active
            </span>
          </div>

          {featured_post ? (
            <div className="flex flex-col flex-1 min-h-0">
              
              {/* Image Section - TOP HALF */}
              <div className="relative h-48 sm:h-56 w-full overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-gray-900/20 to-transparent z-10 pointer-events-none"></div>
                <img
                  src={featured_post.banner_image || placeholder}
                  alt={featured_post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                />
                <div className="absolute bottom-4 left-5 z-20">
                  <span className="font-bold text-white text-[10px] uppercase tracking-widest bg-indigo-600/90 backdrop-blur-md px-2.5 py-1.5 rounded border border-white/20 flex items-center gap-1.5 shadow-lg">
                    <Tag size={10} /> {featured_post.category || "Editorial"}
                  </span>
                </div>
              </div>

              {/* Content Section - BOTTOM HALF */}
              <div className="p-5 sm:p-6 flex flex-col flex-1 bg-white relative z-20">
                <div className="flex items-center flex-wrap gap-x-3 gap-y-2 mb-3">
                  <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                    <Clock size={12} /> {new Date(featured_post.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  
                  {/* 🚀 THE SERIES BADGE */}
                  {featured_post.series_name && (
                    <>
                      <span className="text-gray-300 hidden sm:inline">•</span>
                      <span className="flex items-center gap-1 text-indigo-600 text-[9px] font-black uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded shadow-sm">
                        <Layers size={10} />
                        {featured_post.series_name} {featured_post.part_number && `• PT ${featured_post.part_number}`}
                      </span>
                    </>
                  )}
                </div>
                
                <h3 className="font-serif text-xl sm:text-2xl leading-snug font-bold text-gray-900 group-hover/card:text-indigo-600 transition-colors line-clamp-2 mb-4">
                  {featured_post.title}
                </h3>

                <div className="pt-4 mt-auto border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                      <User size={16} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Author</span>
                      {/* 🚀 THE CUSTOM AUTHOR */}
                      <span className="text-sm font-semibold text-gray-900 truncate capitalize">
                        {featured_post.custom_author || featured_post.author || "Admin"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100/50">
                    <span className="block text-[9px] text-emerald-600/70 font-bold uppercase tracking-wider mb-0.5">Price</span>
                    <span className="text-lg font-extrabold text-emerald-700 font-serif leading-none">
                      Kshs {Number(featured_post.price || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 bg-gray-50/50">
              <Star size={24} className="text-gray-300 mb-3 opacity-50" />
              <p className="font-medium text-gray-500 text-sm">No article is currently featured.</p>
              <p className="text-xs text-gray-400 mt-1">Select an article from the posts menu to feature it here.</p>
            </div>
          )}
        </div>

        {/* PREMIUM COMPOSED CHART: TRANSACTIONS & REVENUE */}
        {/* 🔹 FIX: Added h-full and flex-col to force it to match the featured post card height */}
        <div className="min-w-0 flex flex-col h-full">
          <ChartCard 
            title="Financial Overview" 
            subtitle="Volume vs. Actual Revenue"
            action={
              <div className="text-right shrink-0 ml-2">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Total Sales</p>
                <p className="text-xl sm:text-2xl font-serif font-bold text-gray-900">{totalTransactions.toLocaleString()}</p>
              </div>
            }
          >
            {/* 🔹 FIX: Replaced hardcoded inline styles with fluid Tailwind classes & 100% sizing */}
            <div className="w-full h-[280px] sm:h-[320px] mt-6">
              <ResponsiveContainer width="100%" height={335}>
                {/* 🔹 FIX: Changed right margin from 10 to 40 so the text has room, and left to -30 to trim dead space */}
                <ComposedChart data={revenue_trend || []} margin={{ top: 10, right: 40, left: -30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#6B7280', fontSize: 11, fontWeight: 500}} 
                    dy={10} 
                  />
                  
                  <YAxis 
                    yAxisId="left" 
                    orientation="left" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={false} 
                  />
                  
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9CA3AF', fontSize: 11}}
                    tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
                  />

                  <Tooltip 
                    cursor={{ fill: '#F3F4F6', opacity: 0.6 }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white/95 backdrop-blur-sm border border-gray-100 p-4 rounded-xl shadow-xl min-w-[160px]">
                            <p className="font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">{label}</p>
                            
                            <div className="flex items-center justify-between gap-4 mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue</span>
                              </div>
                              <span className="text-sm font-bold text-gray-900">
                                Ksh {Number(payload.find(p => p.dataKey === 'revenue')?.value || 0).toLocaleString()}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-100"></div>
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Purchases</span>
                              </div>
                              <span className="text-sm font-bold text-gray-900">
                                {payload.find(p => p.dataKey === 'sales')?.value || 0}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#6B7280', paddingTop: '10px' }} />

                  <Bar 
                    yAxisId="left" 
                    dataKey="sales" 
                    name="Transactions" 
                    fill="#C7D2FE" 
                    radius={[6, 6, 0, 0]} 
                    barSize={32} 
                  />
                  
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Revenue (Kshs)" 
                    stroke="#4F46E5" 
                    strokeWidth={3} 
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#4F46E5' }} 
                    activeDot={{ r: 6, fill: '#4F46E5', stroke: '#EEF2FF', strokeWidth: 4 }} 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Header Skeleton */}
      <div className="border-b border-gray-100 pb-5 sm:pb-6 flex justify-between items-center">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* KPI Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[120px] rounded-2xl" />)}
      </div>

      {/* Middle Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <Skeleton className="lg:col-span-2 h-[350px] sm:h-[420px] rounded-2xl" />
        <Skeleton className="h-[350px] sm:h-[420px] rounded-2xl" />
      </div>

      {/* Bottom Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <Skeleton className="h-[300px] rounded-2xl" />
        <Skeleton className="h-[300px] rounded-2xl" />
      </div>
    </div>
  );
}