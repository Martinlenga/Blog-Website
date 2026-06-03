import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { useAdmin } from "../admin/context/AdminContext";
import { User, Lock, Loader, ArrowRight, ShieldCheck, LayoutDashboard, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const { login } = useAdmin();
  const [form, setForm] = useState({ username: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({ username: "", password: "" });
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const errorTimeoutRef = useRef(null);

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (fieldErrors[field]) {
      setFieldErrors({ ...fieldErrors, [field]: "" });
    }
    if (globalError) {
      setGlobalError("");
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    }
  };

  const validateForm = () => {
    let isValid = true;
    const errors = { username: "", password: "" };

    if (!form.username.trim()) {
      errors.username = "Username is required.";
      isValid = false;
    }
    if (!form.password) {
      errors.password = "Password is required.";
      isValid = false;
    } else if (form.password.length < 8) { // 🔹 Synchronized with Django's 8-char minimum
      errors.password = "Security architecture requires at least 8 characters.";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setGlobalError("");

    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    try {
      await login(form);
    } catch (err) {
      let errorMessage = "Access denied. Please check your credentials and try again.";

      if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.error) {
          errorMessage = data.error;
        }
        
        if (errorMessage.toLowerCase().includes("user") || errorMessage.toLowerCase().includes("account")) {
          setFieldErrors(prev => ({ ...prev, username: "Unknown or deactivated administrative account." }));
        } else if (errorMessage.toLowerCase().includes("password")) {
          setFieldErrors(prev => ({ ...prev, password: "Incorrect password structure." }));
        }
      } else if (err.message) {
        errorMessage = "Network timeout. Check your server connection.";
      }

      setGlobalError(errorMessage);
      setLoading(false);

      errorTimeoutRef.current = setTimeout(() => {
        setGlobalError("");
      }, 5000);
    }
  };

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] relative overflow-hidden font-sans px-4 py-6 sm:px-6 lg:px-8">
      <Helmet>
        <title>Admin Login | JK Ithaguru</title>
      </Helmet>

      {/* BACKGROUND FLOATING EFFECTS */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-indigo-200/40 rounded-full blur-[60px] sm:blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-purple-200/40 rounded-full blur-[60px] sm:blur-[100px]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="relative z-10 w-full max-w-md md:max-w-5xl bg-white rounded-2xl md:rounded-[2rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] md:shadow-[0_40px_100px_-15px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden flex flex-col md:flex-row min-h-[500px] md:min-h-[600px]">
        
        {/* LEFT BRAND SECTION */}
        <div className="hidden md:flex w-1/2 bg-slate-900 relative flex-col justify-between p-12 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20 -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
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
              Securely access your gateway dashboard to track analytics, manage payments, and curate articles.
            </p>
          </div>
          <div className="relative z-10 text-xs text-slate-500 font-medium tracking-wider uppercase">
            © {new Date().getFullYear()} Admin Portal System
          </div>
        </div>

        {/* RIGHT INPUT PANEL */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 md:p-16 flex flex-col justify-center bg-white/80 backdrop-blur-sm">
          
          <div className="flex md:hidden items-center gap-2 mb-6 self-start bg-slate-900/5 px-3 py-1.5 rounded-lg border border-slate-900/10">
            <LayoutDashboard size={16} className="text-indigo-600" />
            <span className="font-bold text-xs tracking-wider text-slate-900">JK ADMIN</span>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2">Welcome Back</h2>
            <p className="text-gray-500 text-xs sm:text-sm">Please enter your credentials to authenticate.</p>
          </div>

          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${globalError ? "max-h-32 opacity-100 mb-4 sm:mb-6" : "max-h-0 opacity-0 mb-0"}`}>
            <div className="p-3 sm:p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 sm:gap-3 shadow-sm">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{globalError}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
            
            {/* USERNAME BLOCK */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label htmlFor="username" className="text-xs sm:text-sm font-semibold text-gray-700 cursor-pointer">Username</label>
                {fieldErrors.username && <span className="text-[11px] sm:text-xs text-red-500 font-medium animate-fade-in">{fieldErrors.username}</span>}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none">
                  <User className={`transition-colors duration-200 ${fieldErrors.username ? "text-red-400" : "text-gray-400 group-focus-within:text-indigo-600"}`} size={18} />
                </div>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  className={`w-full bg-gray-50 border text-gray-900 text-sm sm:text-base rounded-xl py-3 sm:py-3.5 pl-10 sm:pl-12 pr-4 outline-none focus:bg-white focus:ring-4 transition-all placeholder:text-gray-400 font-medium ${
                    fieldErrors.username 
                      ? "border-red-300 focus:ring-red-50" 
                      : "border-gray-200 focus:ring-indigo-50 focus:border-indigo-500"
                  }`}
                  placeholder="Enter admin identifier"
                  value={form.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                />
              </div>
            </div>

            {/* PASSWORD BLOCK */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label htmlFor="password" className="text-xs sm:text-sm font-semibold text-gray-700 cursor-pointer">Password</label>
                {fieldErrors.password && <span className="text-[11px] sm:text-xs text-red-500 font-medium animate-fade-in">{fieldErrors.password}</span>}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none">
                  <Lock className={`transition-colors duration-200 ${fieldErrors.password ? "text-red-400" : "text-gray-400 group-focus-within:text-indigo-600"}`} size={18} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={`w-full bg-gray-50 border text-gray-900 text-sm sm:text-base rounded-xl py-3 sm:py-3.5 pl-10 sm:pl-12 pr-10 sm:pr-12 outline-none focus:bg-white focus:ring-4 transition-all placeholder:text-gray-400 font-medium ${
                    fieldErrors.password 
                      ? "border-red-300 focus:ring-red-50" 
                      : "border-gray-200 focus:ring-indigo-50 focus:border-indigo-500"
                  }`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 sm:pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative overflow-hidden bg-gray-900 hover:bg-indigo-600 text-white font-bold py-3.5 sm:py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              <div className="relative z-10 flex items-center justify-center gap-2 text-sm sm:text-base">
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    <span>Verifying Identity...</span>
                  </>
                ) : (
                  <>
                    <span>Establish Session</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2 text-[10px] sm:text-xs text-gray-400 font-medium bg-gray-50 py-2 sm:py-2.5 rounded-lg border border-gray-100 w-full sm:w-fit mx-auto px-4 text-center">
            <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
            <span>Encrypted Administration Connection Endpoint</span>
          </div>

        </div>
      </div>
    </div>
  );
}