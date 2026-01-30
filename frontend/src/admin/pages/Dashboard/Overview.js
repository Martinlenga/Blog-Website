import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Star, Users, CheckCircle, DollarSign, FileText } from "lucide-react";

import KpiCard from "../../components/KpiCard";
import ChartCard from "../../components/ChartCard";
import Skeleton from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";

import { getDashboardStats } from "../../services/adminApi";
import placeholder from "../../../assets/article-placeholder.jpg";

export default function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    );

  if (!data)
    return <EmptyState description="Failed to load dashboard data." />;

  const { kpis, top_posts, revenue_trend, featured_post } = data;

  return (
    <div className="space-y-10 bg-gray-50 p-4 md:p-8 rounded-xl">

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <KpiCard
          title="Revenue This Month"
          value={`Kshs ${kpis.this_month_revenue.toLocaleString()}`}
          growth={kpis.growth}
          icon={<DollarSign className="text-white" />}
          bgColor="bg-gradient-to-r from-blue-500 to-blue-700"
        />
        <KpiCard
          title="New Customers"
          value={kpis.new_customers}
          icon={<Users className="text-white" />}
          bgColor="bg-gradient-to-r from-green-400 to-green-600"
        />
        <KpiCard
          title="Total Customers"
          value={kpis.total_customers}
          icon={<Users className="text-white" />}
          bgColor="bg-gradient-to-r from-indigo-400 to-indigo-600"
        />
        <KpiCard
          title="Repeat Customers"
          value={kpis.repeat_customers}
          icon={<CheckCircle className="text-white" />}
          bgColor="bg-gradient-to-r from-teal-400 to-teal-600"
        />
        <KpiCard
          title="Feedback Count"
          value={kpis.feedback_count}
          icon={<FileText className="text-white" />}
          bgColor="bg-gradient-to-r from-purple-400 to-purple-600"
        />
        <KpiCard
          title="Last Month Revenue"
          value={`Kshs ${kpis.last_month_revenue.toLocaleString()}`}
          icon={<DollarSign className="text-white" />}
          bgColor="bg-gradient-to-r from-gray-500 to-gray-700"
        />
      </div>

      {/* FEATURED POST */}
      {featured_post && (
        <ChartCard title="Featured Post" className="bg-gradient-to-r from-yellow-50 to-yellow-100 shadow-lg border border-yellow-200">
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4">
            <img
              src={featured_post.banner_image || placeholder}
              alt={featured_post.title}
              className="w-full sm:w-32 h-32 object-cover rounded-lg shadow-md border"
            />
            <div className="flex-1 flex flex-col gap-2">
              <h3 className="text-xl font-bold text-gray-800">{featured_post.title}</h3>
              <p className="text-gray-600 font-semibold">Kshs {featured_post.price.toLocaleString()}</p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-200 text-yellow-800 font-semibold text-sm rounded-full whitespace-nowrap max-w-max">
                <Star size={14} /> Featured
              </span>
            </div>
          </div>
        </ChartCard>
      )}

      {/* REVENUE TREND */}
      <ChartCard title="Monthly Revenue & Sales Trend">
        {revenue_trend.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={revenue_trend} margin={{ top: 20, right: 30, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fill: "#374151", fontWeight: 600 }} />
              <YAxis tick={{ fill: "#374151", fontWeight: 600 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", color: "#fff", borderRadius: "8px", padding: "8px 12px" }}
                formatter={(value, name) =>
                  name === "revenue" ? `Kshs ${value.toLocaleString()}` : value
                }
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ r: 6, stroke: "#1E3A8A", strokeWidth: 2 }}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 6, stroke: "#047857", strokeWidth: 2 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 py-12">No revenue data available</p>
        )}
      </ChartCard>

      {/* TOP POSTS */}
      <ChartCard title="Top Posts by Revenue">
        {(top_posts || []).length > 0 ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {(top_posts || []).map((post, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center p-3 bg-white rounded-lg shadow hover:shadow-lg transition border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-gray-800">{post.post__title}</span>
                    <span className="text-gray-500 text-sm">Kshs {post.revenue.toLocaleString()} ({post.sales} sales)</span>
                  </div>
                </div>
                {post.post__featured && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-200 text-yellow-800 font-semibold text-xs rounded-full whitespace-nowrap max-w-max">
                    <Star size={12} /> Featured
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState description="No top posts yet." />
        )}
      </ChartCard>
    </div>
  );
}
