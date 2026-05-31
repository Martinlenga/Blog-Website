import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { useAdmin } from "../admin/context/AdminContext";
import { User, Lock, Loader, ArrowRight, ShieldCheck, LayoutDashboard } from "lucide-react";

export default function AdminLogin() {
  const { login } = useAdmin();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const errorTimeoutRef = useRef(null); // Prevents state updates from clashing on repeated clicks

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear previous errors cleanly

    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    try {
      await login(form);
    } catch (err) {
      // 🔹 THE BULLETPROOF SAFETY CHECK:
      // Fallback cleanly to a standard message if the server's error format changes
      let errorMessage = "Invalid credentials. Please try again.";

      if (err.response && err.response.data) {
        // If your backend passes an explicit error object, extract it safely
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.message) {
        // Handle network timeouts or offline errors
        errorMessage = "Network error. Please check your internet connection.";
      }

      setError(errorMessage);
      setLoading(false);

      // Keep the error visible for 6 seconds
      errorTimeoutRef.current = setTimeout(() => {
        setError("");
      }, 6000);
    }
  };

  // Safe memory cleanup if the admin successfully logs in or leaves the page
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] relative overflow-hidden font-sans">
      
      <Helmet>
        <title>Admin Login | JK Ithaguru</title>
      </Helmet>

      {/* BACKGROUND MAGIC */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[100px] animate-float-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-[100px] animate-float-slow delay-2000"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* LOGIN CONTAINER */}
      <div className="relative z-10 w-full max-w-5xl bg-white rounded-[2rem] shadow-[0_40px_100px_-15px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden flex flex-col md:flex-row mx-4 md:mx-0 min-h-[600px]">
        
        {/* LEFT SIDE: Brand & Visuals */}
        <div className="hidden md:flex w-1/2 bg-slate-900 relative flex-col justify-between p-12 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20 -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-[80px] opacity-20 -ml-16 -mb-16"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <LayoutDashboard size={18} className="text-white" />
              </div>
              <span className="font-bold text-lg tracking-wide">JK ADMIN</span>
            </div>
          </div>

          <div className="relative z-10 space-y-6">
            <h1 className="text-4xl font-serif font-bold leading-tight">
              Manage your content <br /> with confidence.
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Securely access your dashboard to track analytics, manage payments, and curate articles.
            </p>
          </div>

          <div className="relative z-10 text-xs text-slate-500 font-medium tracking-wider uppercase">
            © {new Date().getFullYear()} Admin Portal System
          </div>
        </div>

        {/* RIGHT SIDE: The Form */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center bg-white/80 backdrop-blur-sm">
          
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500 text-sm">Please enter your details to sign in.</p>
          </div>

          {/* 🔹 SMOOTH CSS HEIGHT TRANSITION CONTAINER */}
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${error ? "max-h-24 opacity-100 mb-6" : "max-h-0 opacity-0 mb-0"}`}>
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-medium">{error}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Username</label>
              <div className="relative group transition-all duration-300">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                </div>
                <input
                  type="text"
                  required
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all placeholder:text-gray-400 font-medium"
                  placeholder="admin"
                  value={form.username}
                  onChange={(e) => setForm({...form, username: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
              <div className="relative group transition-all duration-300">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                </div>
                <input
                  type="password"
                  required
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all placeholder:text-gray-400 font-medium"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative overflow-hidden bg-gray-900 hover:bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-xl shadow-gray-200/50 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Access Dashboard</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Secure Badge */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium bg-gray-50 py-2 rounded-lg border border-gray-100 w-fit mx-auto px-4">
            <ShieldCheck size={14} className="text-green-500" />
            <span>256-bit SSL Secured Connection</span>
          </div>

        </div>
      </div>
    </div>
  );
}