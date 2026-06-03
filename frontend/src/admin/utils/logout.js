export const forceLogout = () => {
  // Ensure this only executes on the client-side to prevent Next.js SSR crashes
  if (typeof window !== "undefined") {
    // 🔹 FIX: Target the specific 'admin' tokens we established earlier
    localStorage.removeItem("admin_access");
    localStorage.removeItem("admin_refresh");
    localStorage.removeItem("admin_user"); // Optional: clear any cached user metadata

    // Force redirect to the secure admin login gateway
    window.location.href = "/admin/login";
  }
};