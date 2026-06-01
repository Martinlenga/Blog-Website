import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { getPaymentsAnalytics } from "../../services/adminApi";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";
import { TrendingUp, DollarSign, CreditCard, Users } from "lucide-react";
import StatCard from "../../components/StatCard";


export default function FinancialTrends() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("daily"); 

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await getPaymentsAnalytics({ period: range });
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [range]);

  if (loading && !analytics) return <div className="p-12 text-center text-gray-400 text-sm">Loading financial data...</div>;
  if (!analytics) return null;

  const { summary, revenue_per_post, transactions_over_time } = analytics;

  // 🔹 SOLID Y-AXIS FRACTION PROTECTION LOGIC
  const formatYAxis = (val) => {
    if (val === 0) return "0";
    if (val >= 1000) return `Kshs ${(val / 1000).toFixed(0)}k`;
    return `Kshs ${val}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in-up pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Helmet>
        <title>Financial Trends | JK Admin</title>
      </Helmet>
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-gray-100">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Financial Intelligence</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Deep insight into content revenue performance.</p>
        </div>
        
        {/* TIME RANGE TOGGLE TRIGGER BUTTONS */}
        <div className="bg-gray-100 p-1 rounded-xl flex items-center justify-between sm:justify-start overflow-x-auto scrollbar-hide self-start sm:self-auto w-full sm:w-auto">
          {["daily", "weekly", "monthly", "yearly"].map((opt) => (
            <button
              key={opt}
              onClick={() => setRange(opt)}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all flex-1 sm:flex-none text-center ${
                range === opt 
                  ? "bg-white text-indigo-600 shadow-xs" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* RESPONSIVE KPI STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Revenue Collected" value={`Sh ${Number(summary.total_revenue).toLocaleString()}`} icon={DollarSign} color="emerald"/>
        <StatCard label="Total Transactions Processed" value={summary.total_transactions.toLocaleString()} icon={CreditCard} color="indigo"/>
        <StatCard label="Active Paying Users" value={summary.active_users.toLocaleString()} icon={Users} color="blue" />
        <StatCard label="Average Revenue Per User" value={`Sh ${Number(summary.arpu).toFixed(0)}`} icon={TrendingUp} color="amber" sub="Avg per user"/>
      </div>

      {/* MASTER AREA GROWTH CHART CARD */}
      <div className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-200 shadow-sm relative">
        {loading && (
           <div className="absolute inset-0 bg-white/60 backdrop-blur-2xs z-10 flex items-center justify-center rounded-2xl">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full animate-pulse">Updating Metrics...</span>
           </div>
        )}
        
        <div className="mb-6">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900">Revenue Growth</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
             Visualizing income: <span className="font-bold text-gray-800 capitalize">{range} View</span>
          </p>
        </div>

        <div className="h-[250px] sm:h-[350px] min-h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={transactions_over_time} margin={{ left: -15, right: 5, top: 10 }}>
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
                allowDecimals={false} // Prevents fraction scaling loops
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                itemStyle={{ color: '#fff' }}
                formatter={(val) => `Kshs ${val.toLocaleString()}`}
                labelFormatter={(val) => new Date(val).toLocaleDateString()}
              />
              <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5} fill="url(#trendGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LOWER SPLIT LAYOUT BREAKDOWN BLOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* DONUT: PAYMENT HEALTH */}
        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-gray-900">Payment Health</h3>
            <p className="text-xs text-gray-500 mt-0.5">Success vs Failure ledger parameters</p>
          </div>
          
          <div className="h-60 min-h-[240px] relative mt-4 sm:mt-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={[
                    { name: 'Success', value: summary.status_counts.SUCCESS || 0 },
                    { name: 'Failed', value: summary.status_counts.FAILED || 0 },
                    { name: 'Pending', value: summary.status_counts.PENDING || 0 },
                  ]}
                  innerRadius="65%" outerRadius="85%" paddingAngle={4} dataKey="value"
                >
                  <Cell fill="#10B981" />
                  <Cell fill="#EF4444" />
                  <Cell fill="#F59E0B" />
                </Pie>
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-2xl sm:text-3xl font-bold text-gray-900 leading-none">{summary.success_rate}%</span>
               <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-1">Success</span>
            </div>
          </div>
        </div>

        {/* LIST: RANKED GENERATORS */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-gray-900 mb-5">Top Revenue Generators</h3>
          <div className="space-y-3">
            {revenue_per_post.slice(0, 5).map((post, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all group">
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold shrink-0 ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                    {post.post__title}
                  </p>
                  <div className="w-full bg-gray-100 h-1 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full" 
                      style={{ width: `${(post.revenue / revenue_per_post[0].revenue) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right shrink-0 pl-2">
                  <span className="block text-emerald-600 font-bold text-xs sm:text-sm">Kshs {post.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}