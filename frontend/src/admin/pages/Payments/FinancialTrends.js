import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { getPaymentsAnalytics } from "../../services/adminApi";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";
import { TrendingUp, DollarSign, CreditCard, Users } from "lucide-react";

import StatCard from "../../components/StatCard";
import ChartCard from "../../components/ChartCard"; 
import { Skeleton } from "../../components/Skeleton"; 

export default function FinancialTrends() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("daily"); 

  // 🚀 ARCHITECTURE FIX: Prevent state updates on unmounted components
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await getPaymentsAnalytics({ period: range });
        if (isMounted) setAnalytics(data);
      } catch (err) {
        if (isMounted) console.error("Failed to fetch analytics:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchData();

    return () => {
      isMounted = false;
    };
  }, [range]);

  if (loading && !analytics) return <FinancialSkeleton />;
  if (!analytics) return <div className="p-12 text-center text-gray-500 font-medium">Failed to load financial data.</div>;

  const { summary = {}, revenue_per_post = [], transactions_over_time = [] } = analytics;

  // 🚀 DATA SAFETY: Prevent division by zero if there are no posts yet
  const maxRevenue = revenue_per_post.length > 0 ? (revenue_per_post[0].revenue || 1) : 1;

  // 🔹 SOLID Y-AXIS FRACTION PROTECTION LOGIC
  const formatYAxis = (val) => {
    if (val === 0) return "0";
    if (val >= 1000) return `Kshs ${(val / 1000).toFixed(0)}k`;
    return `Kshs ${val}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Helmet>
        <title>Financial Trends | JK Admin</title>
      </Helmet>
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-gray-100">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Financial Intelligence</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Deep insight into content revenue performance.</p>
        </div>
        
        {/* TIME RANGE TOGGLE TRIGGER BUTTONS */}
        <div className="bg-gray-100 p-1 rounded-xl flex items-center justify-between sm:justify-start overflow-x-auto scrollbar-hide self-start sm:self-auto w-full sm:w-auto shadow-inner">
          {["daily", "weekly", "monthly", "yearly"].map((opt) => (
            <button
              key={opt}
              onClick={() => setRange(opt)}
              disabled={loading}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all flex-1 sm:flex-none text-center disabled:opacity-50 ${
                range === opt 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* RESPONSIVE KPI STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
        <StatCard label="Total Revenue" value={`Kshs ${Number(summary.total_revenue || 0).toLocaleString()}`} icon={DollarSign} color="emerald"/>
        <StatCard label="Transactions" value={Number(summary.total_transactions || 0).toLocaleString()} icon={CreditCard} color="indigo"/>
        <StatCard label="Active Paying Users" value={Number(summary.active_users || 0).toLocaleString()} icon={Users} color="blue" />
        <StatCard label="Avg Revenue Per User" value={`Kshs ${Number(summary.arpu || 0).toFixed(0)}`} icon={TrendingUp} color="amber" />
      </div>

      {/* MASTER AREA GROWTH CHART CARD */}
      <div className="h-[350px] sm:h-[450px] relative">
        {/* Soft loading overlay when switching date ranges */}
        {loading && (
           <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-2xl">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full animate-pulse shadow-sm border border-indigo-100">Updating Metrics...</span>
           </div>
        )}
        
        <ChartCard 
          title="Revenue Growth" 
          subtitle={`Visualizing income: ${range.charAt(0).toUpperCase() + range.slice(1)} View`}
        >
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={transactions_over_time} margin={{ left: -15, right: 5, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="date" 
                axisLine={false} tickLine={false} 
                tick={{fill: '#9CA3AF', fontSize: 11}} 
                dy={10} 
                minTickGap={20}
                tickFormatter={(val) => {
                    const d = new Date(val);
                    if (range === 'yearly') return d.getFullYear();
                    if (range === 'monthly') return d.toLocaleDateString('en-US', {month:'short'});
                    return d.toLocaleDateString('en-US', {day:'numeric', month:'short'});
                }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#9CA3AF', fontSize: 11}} 
                tickFormatter={formatYAxis} 
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: '#10B981' }}
                formatter={(val) => [`Kshs ${Number(val).toLocaleString()}`, "Revenue"]}
                labelFormatter={(val) => new Date(val).toLocaleDateString()}
              />
              <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fill="url(#trendGradient)" activeDot={{ r: 6, fill: "#10B981", stroke: "#fff", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* LOWER SPLIT LAYOUT BREAKDOWN BLOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* DONUT: PAYMENT HEALTH */}
        {/* 🔹 FIX 1: Removed h-[350px] and added min-w-0 to prevent grid blowout */}
        <div className="min-w-0">
          <ChartCard 
            title="Payment Health" 
            subtitle="Success vs Failure ledger parameters"
          >
            {/* 🔹 FIX 2: Explicit height and relative positioning for the center text */}
            <div style={{ width: '100%', height: '260px', position: 'relative', marginTop: '1rem' }}>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie 
                    data={[
                      { name: 'Success', value: summary.status_counts?.SUCCESS || 0 },
                      { name: 'Failed', value: summary.status_counts?.FAILED || 0 },
                      { name: 'Pending', value: summary.status_counts?.PENDING || 0 },
                    ]}
                    innerRadius="65%" 
                    outerRadius="85%" 
                    paddingAngle={4} 
                    dataKey="value" 
                    stroke="none"
                  >
                    <Cell fill="#10B981" />
                    <Cell fill="#EF4444" />
                    <Cell fill="#F59E0B" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                    itemStyle={{ color: '#374151', fontWeight: '600' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* 🔹 FIX 3: Removed 'mt-8' because it's now perfectly centered inside the 260px wrapper */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-3xl font-bold text-gray-900 leading-none">{summary.success_rate || 0}%</span>
                 <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-1">Success</span>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* LIST: RANKED GENERATORS */}
        {/* 🔹 THE FIX: h-full makes it match the Donut chart, min-h-0 allows the inside to scroll safely */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[350px] lg:h-full lg:min-h-[360px]">
          <h3 className="font-serif text-lg font-bold text-gray-900 mb-5 shrink-0">Top Revenue Generators</h3>
          
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {revenue_per_post.length > 0 ? (
              revenue_per_post.slice(0, 5).map((post, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                  <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold shrink-0 ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                      {post.post__title || "Untitled Post"}
                    </p>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${Math.min(((post.revenue || 0) / maxRevenue) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <span className="block text-emerald-600 font-bold text-xs sm:text-sm">
                      Kshs {Number(post.revenue || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-400 font-medium">
                No revenue data available for this period.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// 🚀 SKELETON LOADER
function FinancialSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="border-b border-gray-100 pb-5 sm:pb-6 flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-48 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[120px] rounded-2xl" />)}
      </div>

      <Skeleton className="h-[350px] sm:h-[450px] rounded-2xl" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <Skeleton className="h-[350px] rounded-2xl" />
        <Skeleton className="lg:col-span-2 h-[350px] rounded-2xl" />
      </div>
    </div>
  );
}