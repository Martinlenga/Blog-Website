import { useEffect, useState } from "react";
import { getAdminFeedback } from "../../services/adminApi";
import Skeleton from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";

export default function FeedbackAnalytics() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminFeedback({ page: 1, pageSize: 100 });
      setFeedbacks(data.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Skeleton rows={10} />;
  if (!feedbacks.length) return <EmptyState description="No feedback yet" />;

  // Prepare data for charts
  const avgByDay = [];
  const ratingDist = [0, 0, 0, 0, 0]; // 1-5

  feedbacks.forEach(f => {
    const day = new Date(f.created_at).toLocaleDateString();
    const existing = avgByDay.find(d => d.date === day);
    if (existing) {
      existing.total += f.rating;
      existing.count += 1;
      existing.avg = existing.total / existing.count;
    } else {
      avgByDay.push({ date: day, total: f.rating, count: 1, avg: f.rating });
    }
    ratingDist[f.rating - 1] += 1;
  });

  const ratingColors = ["#08eadfff","#ef4444", "#f59e0b", "#10b981", "#3b82f6"];
  const ratingDistData = ratingDist.map((count, idx) => ({
    rating: `${idx + 1}`,
    count,
    fill: ratingColors[idx],
  }));

  const totalFeedback = feedbacks.length;
  const avgRating = (feedbacks.reduce((a, f) => a + f.rating, 0) / totalFeedback).toFixed(2);
  const fiveStarCount = feedbacks.filter(f => f.rating === 5).length;

  return (
    <div className="bg-gray-100 min-h-screen p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Feedback Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition-shadow">
          <div className="text-gray-500 font-medium uppercase text-sm mb-2">Total Feedback</div>
          <div className="text-3xl font-bold text-indigo-600">{totalFeedback}</div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition-shadow">
          <div className="text-gray-500 font-medium uppercase text-sm mb-2">Average Rating</div>
          <div className="text-3xl font-bold text-green-600">{avgRating}</div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition-shadow">
          <div className="text-gray-500 font-medium uppercase text-sm mb-2">5-Star Reviews</div>
          <div className="text-3xl font-bold text-blue-600">{fiveStarCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Average Rating Over Time */}
        <div className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Average Rating Over Time</h2>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={avgByDay} margin={{ top: 10, right: 30, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  label={{ value: "Date", position: "insideBottom", offset: 0, fill: "#374151" }}
                  tick={{ fill: "#374151", textAnchor: "middle" }}
                />
                <YAxis
                  domain={[0, 5]}
                  label={{ value: "Rating", angle: -90, position: "insideLeft", fill: "#374151" }}
                  tick={{ fill: "#374151" }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#f9fafb", borderRadius: "0.5rem" }}
                  cursor={{ stroke: "#d1d5db", strokeWidth: 1 }}
                />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="avg"
                  name="Average Rating"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#10b981", stroke: "#059669", strokeWidth: 1 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feedback Distribution by Rating */}
        <div className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition-shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Feedback Distribution by Rating</h2>
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={ratingDistData}
                margin={{ top: 10, right: 30, bottom: 20, left: 0 }}
                barCategoryGap="20%"
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                dataKey="rating"
                label={{ value: "Rating Stars", position: "insideBottom", offset: 0, fill: "#374151" }}
                tick={{ fill: "#374151", textAnchor: "middle" }}
                />
                <YAxis
                label={{ value: "Count", angle: -90, position: "insideLeft", fill: "#374151" }}
                tick={{ fill: "#374151" }}
                allowDecimals={false}
                domain={[0, Math.max(...ratingDist.map(c => c)) + 1]} // <--- dynamically set Y max
                />
                <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", borderRadius: "0.5rem" }} />
                <Legend verticalAlign="top" height={36} />
                {ratingDistData.map((entry, idx) => (
                <Bar
                    key={idx}
                    dataKey="count"
                    fill={entry.fill}
                    radius={[6, 6, 0, 0]}
                    name={`${entry.rating} Star`}
                >
                    <LabelList dataKey="count" position="top" fill={entry.fill} fontWeight="bold" />
                </Bar>
                ))}
            </BarChart>
            </ResponsiveContainer>
        </div>
        </div>
      </div>
    </div>
  );
}
