import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getAdminProfile } from "../services/adminApi";

export default function AdminProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_access");
    if (!token) {
      setLoading(false);
      return setAuthorized(false);
    }

    getAdminProfile()
      .then(() => setAuthorized(true))
      .catch(() => {
        localStorage.removeItem("admin_access");
        localStorage.removeItem("admin_refresh");
        setAuthorized(false);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );

  if (!authorized) return <Navigate to="/admin/login" replace />;

  return children;
}
