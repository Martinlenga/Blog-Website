import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock } from "lucide-react";
import { resetAdminPassword } from "../../services/adminApi";

// Password strength component
function PasswordStrengthHint({ password }) {
  const checks = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "Contains a number", valid: /\d/.test(password) },
    { label: "Contains a letter", valid: /[a-zA-Z]/.test(password) },
  ];

  return (
    <div className="mt-2 space-y-1 text-sm">
      {checks.map((check, index) => (
        <div
          key={index}
          className={`flex items-center gap-2 ${
            check.valid ? "text-green-600" : "text-gray-400"
          }`}
        >
          <span>{check.valid ? "✔" : "•"}</span>
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

    // Optional: frontend password check before sending
    if (
      form.new_password.length < 8 ||
      !/\d/.test(form.new_password) ||
      !/[a-zA-Z]/.test(form.new_password)
    ) {
      setMessage("❌ Password does not meet strength requirements.");
      return;
    }

    setSaving(true);
    try {
      await resetAdminPassword({ uid, token, new_password: form.new_password });
      alert("✅ Password reset successfully!");
      navigate("/admin/login");
    } catch (err) {
      setMessage(
        err.response?.data?.detail || "❌ Failed to reset password. Link may be invalid or expired."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md space-y-6">
        <div className="flex items-center gap-3 text-blue-600">
          <Lock size={28} />
          <h1 className="text-2xl font-bold">Reset Password</h1>
        </div>
        <p className="text-gray-500">
          Enter a strong new password to regain access to your admin account.
        </p>

        {message && <div className="bg-red-100 text-red-800 px-4 py-2 rounded">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              name="new_password"
              value={form.new_password}
              onChange={handleChange}
              placeholder="Enter new password"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
            <PasswordStrengthHint password={form.new_password} />
          </div>
          <input
            type="password"
            name="confirm_password"
            value={form.confirm_password}
            onChange={handleChange}
            placeholder="Confirm new password"
            required
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:outline-none"
          />
          <button
            type="submit"
            disabled={saving}
            className={`w-full py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all ${
              saving ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {saving ? "Updating..." : "Reset Password"}
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
