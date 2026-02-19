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

    setLoading(true);
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
    <div className="animate-fade-in-up pb-10 max-w-2xl mx-auto">

      <Helmet>
        <title>Security Settings | JK Admin</title>
      </Helmet>
      
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="font-serif text-3xl font-bold text-gray-900">Security Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Ensure your account stays safe.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Visual Header */}
        <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex flex-col items-center">
           <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-3">
              <Lock size={24} />
           </div>
           <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
           <p className="text-xs text-gray-500 max-w-xs text-center mt-1">
             For your security, we highly recommend choosing a unique password that you don't use for any other online account.
           </p>
        </div>

        <div className="p-8">
          {errorMsg && (
            <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
               <AlertTriangle size={16} /> {errorMsg}
            </div>
          )}

          {success ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-8 rounded-xl text-center">
               <CheckCircle size={32} className="mx-auto mb-3 text-emerald-600" />
               <h3 className="text-lg font-bold">Password Updated!</h3>
               <p className="text-sm mt-1">Logging you out to re-authenticate...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Current Password</label>
                <div className="relative">
                   <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                   <input
                     type="password" name="current_password" value={form.current_password} onChange={handleChange} required
                     className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                     placeholder="Enter your current password"
                   />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">New Password</label>
                <div className="relative">
                   <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                   <input
                     type="password" name="new_password" value={form.new_password} onChange={handleChange} required
                     className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                     placeholder="Enter new password"
                   />
                </div>
                {form.new_password && <div className="mt-2"><PasswordStrengthHint password={form.new_password} /></div>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                <div className="relative">
                   <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                   <input
                     type="password" name="confirm_password" value={form.confirm_password} onChange={handleChange} required
                     className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                     placeholder="Repeat new password"
                   />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit" disabled={loading}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader size={16} className="animate-spin" /> : "Update Password"}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}