import { createContext, useContext, useState, useEffect } from "react";
import { getAdminProfile, adminLogin, adminLogout } from "../services/adminApi"; 
import { useNavigate } from "react-router-dom";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const refreshAdmin = async () => {
    try {
      const { data } = await getAdminProfile();
      setAdmin({
        ...data,
        profileImage: data.profile_picture 
          ? `${process.env.REACT_APP_API_URL?.replace('/api', '')}${data.profile_picture}`
          : `https://ui-avatars.com/api/?name=${data.username}&background=0D8ABC&color=fff`
      });
    } catch (error) {
      console.error("Failed to refresh admin data", error);
    }
  };

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("admin_access");
    if (!token) {
      setLoading(false);
      return;
    }
    await refreshAdmin();
    setLoading(false);
  };

  const login = async (credentials) => {
    const { data } = await adminLogin(credentials);
    localStorage.setItem("admin_access", data.access);
    localStorage.setItem("admin_refresh", data.refresh);
    await refreshAdmin(); 
    navigate("/admin/dashboard/overview");
  };

  const logout = async (callApi = true) => {
    if (callApi) {
      const refresh = localStorage.getItem("admin_refresh");
      if (refresh) await adminLogout(refresh).catch(() => {});
    }
    localStorage.removeItem("admin_access");
    localStorage.removeItem("admin_refresh");
    setAdmin(null);
    navigate("/admin/login");
  };

  return (
    <AdminContext.Provider value={{ admin, loading, login, logout, setAdmin, refreshAdmin }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);