import { useState } from "react";
import { changeAdminPassword } from "../../services/adminApi";
import PasswordStrengthHint from "../../components/PasswordStrengthHint";
import { forceLogout } from "../../utils/logout";

export default function ChangePassword() {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

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
      setErrorMsg("New password and confirmation do not match.");
      return;
    }

    setLoading(true);

    try {
      await changeAdminPassword({
        old_password: form.current_password, // ✅ matches backend
        new_password: form.new_password,
      });

      setSuccess(true);

      // 🔐 Force logout after password change
      setTimeout(() => {
        forceLogout();
      }, 1500);
    } catch (err) {
      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setErrorMsg(detail.join(" "));
      } else {
        setErrorMsg(detail || "Failed to change password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-semibold mb-2">Change Password</h2>
      <p className="text-gray-500 text-sm mb-6">
        For security reasons, you’ll be logged out after updating your password.
      </p>

      {errorMsg && (
        <div className="mb-4 rounded-lg bg-red-100 px-4 py-2 text-red-700 text-sm">
          {errorMsg}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-green-100 px-4 py-2 text-green-700 text-sm">
          Password changed successfully. Logging you out…
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="password"
          name="current_password"
          placeholder="Current password"
          className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none"
          value={form.current_password}
          onChange={handleChange}
          required
        />

        <div>
          <input
            type="password"
            name="new_password"
            placeholder="New password"
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none"
            value={form.new_password}
            onChange={handleChange}
            required
          />
          <PasswordStrengthHint password={form.new_password} />
        </div>

        <input
          type="password"
          name="confirm_password"
          placeholder="Confirm new password"
          className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none"
          value={form.confirm_password}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          disabled={loading || success}
          className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Updating…" : "Change Password"}
        </button>
      </form>
    </div>
  );
}
