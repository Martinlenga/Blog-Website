import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { requestAdminPasswordReset } from "../../services/adminApi";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await requestAdminPasswordReset(email);
      setMessage("✅ Password reset link sent! Check your email.");
    } catch (err) {
      setMessage(
        err.response?.data?.email?.[0] ||
        "❌ Failed to send reset link. Check your email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md space-y-6">
        <div className="flex items-center gap-3 text-blue-600">
          <Mail size={28} />
          <h1 className="text-2xl font-bold">Forgot Password</h1>
        </div>
        <p className="text-gray-500">
          Enter your admin email to receive a password reset link.
        </p>

        {message && <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <button
          onClick={() => navigate("/admin/login")}
          className="w-full text-center text-blue-600 hover:text-blue-800 underline font-semibold"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
