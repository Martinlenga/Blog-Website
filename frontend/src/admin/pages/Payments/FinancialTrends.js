// src/admin/pages/Payments/FinancialTrends.jsx
import { useEffect, useMemo, useState } from "react";
import { getPaymentsAnalytics } from "../../services/adminApi";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

/* =========================
   MAIN PAGE
========================= */
export default function FinancialTrends() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("monthly"); // daily | weekly | monthly
  const [chartData, setChartData] = useState([]);

  // fetch analytics on mount
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await getPaymentsAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // compute top performing post (useMemo always called)
  const topPost = useMemo(() => {
    if (!analytics?.revenue_per_post?.length) return null;
    return [...analytics.revenue_per_post].sort((a, b) => b.revenue - a.revenue)[0];
  }, [analytics]);

  // update chart data when range changes
  useEffect(() => {
    if (!analytics) return;
    // assume analytics.transactions_over_time has keys: daily, weekly, monthly
    const filtered = analytics.transactions_over_time[range] || analytics.transactions_over_time;
    setChartData(filtered);
  }, [range, analytics]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-gray-500 text-lg">Loading financial analytics…</span>
      </div>
    );
  }

  if (!analytics) return null;

  const { summary, revenue_per_post, revenue_by_category } = analytics;
  const {
    total_revenue,
    total_transactions,
    active_users,
    arpu,
    success_rate,
    failed_rate,
    status_counts,
  } = summary;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-8 py-10 space-y-12">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Financial Intelligence
            </h1>
            <p className="mt-2 text-gray-500 max-w-xl">
              Deep insight into revenue performance, monetization efficiency,
              and content impact.
            </p>
          </div>

          <TimeRangeToggle value={range} onChange={setRange} />
        </div>

        {/* ================= KPI CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <KpiCard title="Total Revenue" value={`Kshs ${total_revenue}`} gradient />
          <KpiCard title="Transactions" value={total_transactions} />
          <KpiCard title="Active Users" value={active_users} />
          <KpiCard title="ARPU" value={`Kshs ${arpu}`} />
        </div>

        {/* ================= REVENUE TREND ================= */}
        <Card large title={`Revenue Trend (${range.charAt(0).toUpperCase() + range.slice(1)})`}>
          <ResponsiveContainer width="100%" height={360}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(v) => `Kshs ${v}`} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#16a34a"
                strokeWidth={3}
                fill="url(#revGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* ================= BREAKDOWN CARDS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* TOP POST */}
          {topPost && (
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between">
                <span className="uppercase text-xs tracking-widest opacity-80">
                  Top Performing Post
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                  🏆 Leader
                </span>
              </div>
              <h3 className="mt-6 text-2xl font-bold leading-tight">
                {topPost.post__title}
              </h3>
              <p className="mt-3 text-sm opacity-90">Revenue Generated</p>
              <p className="text-2xl font-bold mt-1">
                Kshs {topPost.revenue}
              </p>
            </div>
          )}

          {/* STATUS DONUT */}
          <Card title="Payment Status">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Success", value: status_counts.SUCCESS || 0, color: "#22c55e" },
                    { name: "Failed", value: status_counts.FAILED || 0, color: "#ef4444" },
                    { name: "Pending", value: status_counts.PENDING || 0, color: "#facc15" },
                  ]}
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#ef4444" />
                  <Cell fill="#facc15" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
              <Stat label="Success Rate" value={`${success_rate}%`} accent="text-emerald-600" />
              <Stat label="Failed Rate" value={`${failed_rate}%`} accent="text-red-500" />
            </div>
          </Card>

          {/* CATEGORY BAR */}
          <Card title="Revenue by Category">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenue_by_category} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="post__category" type="category" width={140} />
                <Tooltip formatter={(v) => `Kshs ${v}`} />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[6, 6, 6, 6]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* ================= POSTS ================= */}
        <Card title="Revenue per Post">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={revenue_per_post} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="post__title" type="category" width={200} />
              <Tooltip formatter={(v) => `Kshs ${v}`} />
              <Bar dataKey="revenue" fill="#3b82f6" barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

/* =========================
   REUSABLE UI
========================= */

function TimeRangeToggle({ value, onChange }) {
  const options = ["daily", "weekly", "monthly"];
  return (
    <div className="inline-flex bg-gray-200/70 p-1 rounded-2xl shadow-inner">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
            value === opt
              ? "bg-white shadow text-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {opt.charAt(0).toUpperCase() + opt.slice(1)}
        </button>
      ))}
    </div>
  );
}

function KpiCard({ title, value, gradient }) {
  return (
    <div
      className={`rounded-2xl p-6 shadow-sm hover:shadow-md transition-all ${
        gradient
          ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
          : "bg-white"
      }`}
    >
      <p className={`text-xs uppercase tracking-wide ${gradient ? "opacity-80" : "text-gray-400"}`}>
        {title}
      </p>
      <p className={`mt-3 text-3xl font-extrabold ${gradient ? "" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}

function Card({ title, children, large }) {
  return (
    <div className={`bg-white rounded-3xl shadow-sm p-6 ${large ? "p-8" : ""} hover:shadow-md transition`}>
      {title && (
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div>
      <p className="text-gray-400 text-xs uppercase tracking-wide">{label}</p>
      <p className={`text-lg font-bold ${accent}`}>{value}</p>
    </div>
  );
}
