import { useState } from "react";
import { Helmet } from "react-helmet";
import { changeAdminPassword } from "../../services/adminApi";
import PasswordStrengthHint from "../../components/PasswordStrengthHint";
import { forceLogout } from "../../utils/logout";
import { Lock, Key, CheckCircle, AlertTriangle, Loader } from "lucide-react";

export default function ChangePassword() {
  const [form, setForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (form.new_password !== form.confirm_password) {
      setErrorMsg("New passwords do not match.");
      return;
    }

    loading(true);
    try {
      await changeAdminPassword({
        old_password: form.current_password,
        new_password: form.new_password,
      });
      setSuccess(true);
      setTimeout(() => forceLogout(), 2000);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setErrorMsg(Array.isArray(detail) ? detail.join(" ") : (detail || "Failed to change password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in-up pb-10 max-w-2xl mx-auto px-4 sm:px-6 font-sans">
      <Helmet>
        <title>Security Settings | JK Admin</title>
      </Helmet>
      
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Security Settings</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">Ensure your account authentication layer stays safe.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Visual Header Banner Block */}
        <div className="bg-gray-50/50 p-5 sm:p-6 border-b border-gray-100 flex flex-col items-center">
           <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-3 shadow-2xs">
              <Lock size={20} className="sm:w-6 sm:h-6" />
           </div>
           <h2 className="text-base sm:text-lg font-bold text-gray-900">Change Password</h2>
           <p className="text-[11px] sm:text-xs text-gray-500 max-w-xs text-center mt-1 leading-normal">
             For your security, choose a unique password that you don't use for any other online system service.
           </p>
        </div>

        <div className="p-5 sm:p-8">
          {errorMsg && (
            <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-2xs animate-shake">
               <AlertTriangle size={16} className="shrink-0" /> <span>{errorMsg}</span>
            </div>
          )}

          {success ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-8 rounded-xl text-center">
               <CheckCircle size={32} className="mx-auto mb-3 text-emerald-600 animate-bounce" />
               <h3 className="text-base sm:text-lg font-bold">Password Updated!</h3>
               <p className="text-xs sm:text-sm mt-1 text-emerald-600/90">Logging your session out to re-authenticate configuration links...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Current Password</label>
                <div className="relative">
                   <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                   <input
                     type="password" name="current_password" value={form.current_password} onChange={handleChange} required
                     className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:border-indigo-500 transition-all shadow-2xs"
                     placeholder="Enter current master password"
                   />
                </div>
              </div>

              <div className="pt-1">
                <label className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">New Password</label>
                <div className="relative">
                   <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                   <input
                     type="password" name="new_password" value={form.new_password} onChange={handleChange} required
                     className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:border-indigo-500 transition-all shadow-2xs"
                     placeholder="Enter new master token key"
                   />
                </div>
                {form.new_password && <div className="mt-2"><PasswordStrengthHint password={form.new_password} /></div>}
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                <div className="relative">
                   <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                   <input
                     type="password" name="confirm_password" value={form.confirm_password} onChange={handleChange} required
                     className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:border-indigo-500 transition-all shadow-2xs"
                     placeholder="Repeat new master token key"
                   />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit" disabled={loading}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader size={14} className="animate-spin" /> : "Update Password"}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}