import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { getPaymentsAnalytics } from "../../services/adminApi";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, BarChart, Bar } from "recharts";
import { TrendingUp, DollarSign, CreditCard, Users } from "lucide-react";

export default function FinancialTrends() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 1. State for the toggle
  const [range, setRange] = useState("daily"); // Default to daily

  // 2. Fetch Data whenever 'range' changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 🔴 FIX: Pass the period to the backend
        const { data } = await getPaymentsAnalytics({ period: range });
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [range]); // <-- Re-run when range changes

  if (loading && !analytics) return <div className="p-12 text-center text-gray-400">Loading financial data...</div>;
  if (!analytics) return null;

  const { summary, revenue_per_post, transactions_over_time } = analytics;

  return (
    <div className="animate-fade-in-up pb-12 max-w-7xl mx-auto space-y-8">

      <Helmet>
        <title>Financial Trends | JK Admin</title>
      </Helmet>
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-6 border-b border-gray-100">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Financial Intelligence</h1>
          <p className="text-gray-500 text-sm mt-1">Deep insight into revenue performance.</p>
        </div>
        
        {/* TIME RANGE TOGGLE */}
        <div className="bg-gray-100 p-1 rounded-xl inline-flex">
          {["daily", "weekly", "monthly", "yearly"].map((opt) => (
            <button
              key={opt}
              onClick={() => setRange(opt)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
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

      {/* KPI STATS (These usually stay global, but backend sends current snapshots) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Revenue" value={`Sh ${Number(summary.total_revenue).toLocaleString()}`} icon={DollarSign} color="emerald"/>
        <StatCard label="Transactions" value={summary.total_transactions.toLocaleString()} icon={CreditCard} color="indigo"/>
        <StatCard label="Active Users" value={summary.active_users.toLocaleString()} icon={Users} color="blue" />
        <StatCard label="ARPU" value={`Sh ${summary.arpu % 1 === 0 ? Number(summary.arpu).toFixed(0) : Number(summary.arpu).toFixed(2)}`} icon={TrendingUp} color="amber" sub="Avg per user"/>
      </div>

      {/* MAIN CHART AREA */}
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative">
        {loading && (
           <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full animate-pulse">Updating...</span>
           </div>
        )}
        
        <div className="mb-8">
          <h3 className="font-serif text-xl font-bold text-gray-900">Revenue Growth</h3>
          <p className="text-sm text-gray-500">
             Visualizing income: <span className="font-bold text-gray-800 capitalize">{range} View</span>
          </p>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={transactions_over_time}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="date" 
                axisLine={false} tickLine={false} 
                tick={{fill: '#9CA3AF', fontSize: 12}} 
                dy={10} 
                // Format date based on range for better readability
                tickFormatter={(val) => {
                    const d = new Date(val);
                    if (range === 'yearly') return d.getFullYear();
                    if (range === 'monthly') return d.toLocaleDateString('en-US', {month:'short'});
                    return d.toLocaleDateString('en-US', {day:'numeric', month:'short'});
                }}
              />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} tickFormatter={v => `Kshs ${v/1000}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
                formatter={(val) => `Kshs ${val.toLocaleString()}`}
                labelFormatter={(val) => new Date(val).toLocaleDateString()}
              />
              <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fill="url(#trendGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SPLIT GRID: Breakdown & Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. Payment Success Rate (Donut) */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-gray-900">Payment Health</h3>
            <p className="text-xs text-gray-500 mt-1">Success vs Failure rates</p>
          </div>
          
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={[
                    { name: 'Success', value: summary.status_counts.SUCCESS || 0, color: '#10B981' },
                    { name: 'Failed', value: summary.status_counts.FAILED || 0, color: '#EF4444' },
                    { name: 'Pending', value: summary.status_counts.PENDING || 0, color: '#F59E0B' },
                  ]}
                  innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                >
                  <Cell fill="#10B981" />
                  <Cell fill="#EF4444" />
                  <Cell fill="#F59E0B" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Stat */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-3xl font-bold text-gray-900">{summary.success_rate}%</span>
               <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Success</span>
            </div>
          </div>
        </div>

        {/* 2. Top Revenue Generators (Ranked List) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-gray-900 mb-6">Top Revenue Generators</h3>
          <div className="space-y-4">
            {revenue_per_post.slice(0, 5).map((post, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-700 transition-colors">
                    {post.post__title}
                  </p>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full" 
                      style={{ width: `${(post.revenue / revenue_per_post[0].revenue) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-emerald-600 font-bold text-sm">Kshs {post.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// Reuse the clean StatCard style
const StatCard = ({ label, value, icon: Icon, color, sub }) => {
  const themes = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between h-32 hover:border-gray-300 transition-colors">
      <div className="flex justify-between items-start">
        <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">{label}</span>
        <div className={`p-2 rounded-lg ${themes[color]}`}>
          <Icon size={18} />
        </div>
      </div>
      <div>
        <h3 className="font-serif text-3xl font-bold text-gray-900">{value}</h3>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}