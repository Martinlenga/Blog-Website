import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, ArrowLeft, Loader } from "lucide-react";
import { resetAdminPassword } from "../../services/adminApi";

function PasswordStrengthHint({ password }) {
  const checks = [
    { label: "At least 8 characters long", valid: password.length >= 8 },
    { label: "Contains numeric integer characters", valid: /\d/.test(password) },
    { label: "Contains structural alphabetic characters", valid: /[a-zA-Z]/.test(password) },
  ];

  return (
    <div className="mt-2 space-y-1 text-xs">
      {checks.map((check, index) => (
        <div
          key={index}
          className={`flex items-center gap-1.5 font-medium transition-colors ${
            check.valid ? "text-emerald-600" : "text-gray-400"
          }`}
        >
          <span className="font-bold">{check.valid ? "✔" : "•"}</span>
          <span>{check.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [form, setForm] = useState({ new_password: "", confirm_password: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (form.new_password !== form.confirm_password) {
      setMessage("❌ Passwords do not match!");
      return;
    }

    if (
      form.new_password.length < 8 ||
      !/\d/.test(form.new_password) ||
      !/[a-zA-Z]/.test(form.new_password)
    ) {
      setMessage("❌ Password token parameters fail encryption baseline limits.");
      return;
    }

    setSaving(true);
    try {
      await resetAdminPassword({ uid, token, new_password: form.new_password });
      alert("✅ Password reset successfully!");
      navigate("/admin/login");
    } catch (err) {
      setMessage(
        err.response?.data?.detail || "❌ Failed to reset authentication token. Verification authorization has expired."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#F9FAFB] p-4 font-sans">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 w-full max-w-md space-y-5 shadow-xs">
        
        {/* Header Metadata branding rows */}
        <div className="flex items-center gap-2.5 text-indigo-600">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-2xs shrink-0">
             <Lock size={20} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight font-serif">Reset Password</h1>
        </div>
        
        <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
          Configure a secure password string configuration to re-establish authorization permissions over this portal access node account.
        </p>

        {message && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2 rounded-xl text-xs font-semibold animate-shake">
             {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <input
              type="password" name="new_password" value={form.new_password} onChange={handleChange}
              placeholder="Configure secure token password" required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-indigo-500 transition-all bg-gray-50/50"
            />
            <PasswordStrengthHint password={form.new_password} />
          </div>
          
          <input
            type="password" name="confirm_password" value={form.confirm_password} onChange={handleChange}
            placeholder="Repeat secure token password" required
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-indigo-500 transition-all bg-gray-50/50"
          />
          
          <button
            type="submit" disabled={saving}
            className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader size={14} className="animate-spin" /> : "Reset Account Password"}
          </button>
        </form>

        <button
          onClick={() => navigate("/admin/login")}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors pt-2 group"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Dashboard Login</span>
        </button>
      </div>
    </div>
  );
}