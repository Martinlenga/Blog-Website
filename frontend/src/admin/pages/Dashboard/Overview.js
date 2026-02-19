import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { getDashboardStats } from "../../services/adminApi";
import { useAdmin } from "../../context/AdminContext";
import { 
  DollarSign, Users, Eye, TrendingUp, Calendar, ArrowUpRight, Star, 
  Tag, Clock, User, CreditCard
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell
} from "recharts";

import placeholder from "../../../assets/article-placeholder.jpg";

// --- Styled KPI Card ---
const StatCard = ({ label, value, trend, icon: Icon, color = "indigo" }) => {
  const themes = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
          <h3 className="font-serif text-3xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${themes[color]} bg-opacity-50`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4">
        {trend !== undefined && (
          <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trend >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
            <TrendingUp size={12} className="mr-1" /> {trend}%
          </span>
        )}
        <span className="text-xs text-gray-400 font-medium">vs last month</span>
      </div>
    </div>
  );
};

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

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-12">

      <Helmet>
        <title>Dashboard Overview | JK Admin</title>
      </Helmet>
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="font-serif text-4xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-2 text-base">
            Welcome back, <span className="font-semibold text-gray-900">{admin?.first_name}</span>. Here is today's report.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 shadow-sm">
          <Calendar size={16} className="text-indigo-600" />
          {new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* 2. KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Monthly Revenue" value={`KES ${kpis.this_month_revenue.toLocaleString()}`} trend={kpis.growth} icon={DollarSign} color="emerald" />
        <StatCard label="Total Reads" value={kpis.total_views?.toLocaleString()} icon={Eye} color="indigo" />
        <StatCard label="Paying Readers" value={kpis.total_customers} icon={Users} color="blue" />
        <StatCard label="Conversion" value={`${conversionRate}%`} icon={ArrowUpRight} color="amber" />
      </div>

      {/* 3. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Financial Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-serif text-xl font-bold text-gray-900">Revenue Performance</h3>
              <p className="text-sm text-gray-500 mt-1">Income trends over the last 12 months</p>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue_trend}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12, fontWeight: 500}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12, fontWeight: 500}} tickFormatter={(val) => `K${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(val) => `KES ${val.toLocaleString()}`}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={3} fill="url(#colorGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT: Top Stories */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <h3 className="font-serif text-xl font-bold text-gray-900 mb-6">Top Stories</h3>
          <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {top_posts.slice(0, 5).map((post, idx) => (
              <div key={idx} className="flex items-start gap-4 group cursor-default">
                <span className="flex-shrink-0 w-6 text-lg font-serif font-bold text-gray-300 group-hover:text-indigo-500 transition-colors">
                  0{idx + 1}
                </span>
                <div className="flex-1 min-w-0 pb-4 border-b border-gray-50 last:border-0">
                  <p className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {post.title}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs font-medium text-gray-500">
                    <span className="flex items-center gap-1"><Eye size={20}/> {post.views.toLocaleString()}</span>
                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded"><DollarSign size={12}/> {post.revenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
            {top_posts.length === 0 && <p className="text-gray-400 text-sm">No data available.</p>}
          </div>
        </div>
      </div>

      {/* 4. BOTTOM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* FEATURED POST CARD */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-300">
          
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center backdrop-blur-sm">
            <h3 className="font-serif text-lg font-bold text-gray-900">Featured Article</h3>
            <span className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm shadow-indigo-200">
              <Star size={10} fill="currentColor" /> Active
            </span>
          </div>

          {featured_post ? (
            <div className="flex flex-col sm:flex-row h-full">
              
              {/* Image Section */}
              <div className="sm:w-2/5 relative min-h-[240px] sm:min-h-0 overflow-hidden group">
                <div className="absolute inset-0 bg-gray-900/10 group-hover:bg-transparent transition-colors z-10"></div>
                <img
                  src={featured_post.banner_image || placeholder}
                  alt={featured_post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              {/* Content Section */}
              <div className="p-6 sm:p-8 sm:w-3/5 flex flex-col justify-between">
                <div>
                  {/* Meta Tags */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="font-bold text-indigo-700 text-[10px] uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded border border-indigo-100 flex items-center gap-1">
                      <Tag size={10} /> {featured_post.category || "Editorial"}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <Clock size={12} /> {new Date(featured_post.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Title - No Line Clamp, Serif Font */}
                  <h3 className="font-serif text-2xl leading-tight font-bold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">
                    {featured_post.title}
                  </h3>
                </div>

                {/* Footer: Author & Price */}
                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center text-gray-500 shadow-sm">
                      <User size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Author</span>
                      <span className="text-sm font-semibold text-gray-900 capitalize">
                        {featured_post.author || "Admin"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Price</span>
                    <span className="text-xl font-extrabold text-emerald-600 font-serif">
                      KES {Number(featured_post.price).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400 bg-gray-50/50">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Star size={32} className="text-gray-300" />
              </div>
              <p className="font-medium text-gray-600">No article is currently featured.</p>
              <p className="text-sm mt-1">Go to 'All Articles' to pin a post here.</p>
            </div>
          )}
        </div>

        {/* Transaction Volume - FIXED & REFINED */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-end mb-6">
             <div>
                <h3 className="font-serif text-xl font-bold text-gray-900">Transaction Volume</h3>
                <p className="text-sm text-gray-500 mt-1">Monthly payment activity count</p>
             </div>
             <div className="text-right">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Total Sales</p>
                <p className="text-3xl font-serif font-bold text-gray-900">{totalTransactions}</p>
             </div>
          </div>
          
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue_trend} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" hide />
                
                {/* ⭐ THE FIX: Custom Tooltip that reads 'month' and 'sales' 
                   even if XAxis is hidden 
                */}
                <Tooltip 
                  cursor={{ fill: '#F9FAFB' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl">
                          <p className="font-bold text-slate-300 mb-1 uppercase tracking-wide">{label}</p>
                          <p className="font-medium text-white text-sm">
                            {payload[0].value} Sales
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                
                {/* ⭐ THE FIX: Thinner bars (barSize={12}) and rounded corners 
                */}
                <Bar dataKey="sales" radius={[4, 4, 4, 4]} barSize={12}>
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
    <div className="space-y-8 animate-pulse p-4">
      <div className="h-12 w-64 bg-gray-200 rounded mb-8"></div>
      <div className="grid grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-gray-200 rounded-2xl"></div>)}
      </div>
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 h-96 bg-gray-200 rounded-2xl"></div>
        <div className="h-96 bg-gray-200 rounded-2xl"></div>
      </div>
    </div>
  );
}