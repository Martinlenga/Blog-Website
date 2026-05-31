import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Loader } from "lucide-react";
import { requestAdminPasswordReset } from "../../services/adminApi";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      await requestAdminPasswordReset(email);
      setMessage("✅ Password reset link sent! Check your system email inbox.");
    } catch (err) {
      setIsError(true);
      setMessage(
        err.response?.data?.email?.[0] ||
        "❌ Failed to deliver recovery token link. Check address credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#F9FAFB] p-4 font-sans">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 w-full max-w-md space-y-5 shadow-xs">
        
        {/* Identity Branding Bar */}
        <div className="flex items-center gap-2.5 text-indigo-600">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-2xs shrink-0">
             <Mail size={20} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight font-serif">Forgot Password</h1>
        </div>
        
        <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
          Enter your administrative login email credentials below to dispatch a secure password recovery authorization link.
        </p>

        {message && (
          <div className={`px-4 py-2.5 rounded-xl text-xs font-semibold border ${
             isError ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-indigo-50 border-indigo-100 text-indigo-700"
          }`}>
             {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@hooyolabs.com"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-indigo-500 transition-all bg-gray-50/50"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader size={14} className="animate-spin" /> : "Send Reset Link"}
          </button>
        </form>

        <button
          onClick={() => navigate("/admin/login")}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors pt-2 group"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Return to Dashboard Login</span>
        </button>
      </div>
    </div>
  );
}