import { useState } from "react";
import { adminLogin } from "../admin/services/adminApi";
import { useNavigate } from "react-router-dom";
import { User, Lock } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(""); // persistent error
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // clear old error

    try {
      const res = await adminLogin(form);

      localStorage.setItem("admin_access", res.data.access);
      localStorage.setItem("admin_refresh", res.data.refresh);

      navigate("/admin/dashboard/overview");
    } catch (err) {
      // Make error persistent
      const detail =
        err.response?.data?.detail ||
        err.message ||
        "Invalid admin credentials. Please check your inputs.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Content Section */}
      <div className="md:w-1/2 bg-blue-50 flex flex-col justify-center p-12">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-4">
          Welcome Back, Admin
        </h1>
        <p className="text-blue-700 mb-6">
          Access the dashboard to manage posts, payments, feedbacks, and more.
          Keep your platform secure and up-to-date.
        </p>

        <ul className="list-disc ml-6 space-y-2 text-blue-700">
          <li>Monitor transactions in real-time</li>
          <li>Approve or manage user feedback</li>
          <li>Update your profile and security settings</li>
          <li>Audit system logs and maintain records</li>
        </ul>

        <p className="mt-6 text-blue-600 text-sm">
          Secure your account and ensure all operations are monitored efficiently.
        </p>
      </div>

      {/* Right Form Section */}
      <div className="md:w-1/2 flex items-center justify-center p-12 bg-white">
        <div className="w-full max-w-md space-y-6">
          {/* Admin icon */}
          <div className="flex justify-center mb-6">
            <User size={56} className="text-gray-700" />
          </div>

          <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">
            Admin Login
          </h2>

          {/* Persistent Error Box */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded relative mb-4">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white rounded-xl font-semibold shadow-lg transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-700 hover:bg-blue-800"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            &copy; 2026 Your Company. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
