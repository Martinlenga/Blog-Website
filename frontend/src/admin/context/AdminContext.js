import { createContext, useContext, useState, useEffect } from "react";
// 🔹 FIX: Importing the correct names from your adminApi.js
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

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("admin_access");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // 🔹 FIX: Using getAdminProfile() instead of getAdminProfileRequest()
      const { data } = await getAdminProfile();
      
      // Map Django fields to UI fields
      setAdmin({
        ...data,
        profileImage: data.profile_picture 
          ? `${process.env.REACT_APP_API_URL?.replace('/api', '')}${data.profile_picture}`
          : `https://ui-avatars.com/api/?name=${data.username}&background=0D8ABC&color=fff`
      });
    } catch (error) {
      // Token likely expired/invalid
      logout(false); 
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    // 🔹 FIX: Using adminLogin() instead of adminLoginRequest()
    const { data } = await adminLogin(credentials);
    
    localStorage.setItem("admin_access", data.access);
    localStorage.setItem("admin_refresh", data.refresh);
    
    await checkAuthStatus(); // Fetch profile immediately
    navigate("/admin/dashboard/overview");
  };

  const logout = async (callApi = true) => {
    if (callApi) {
      const refresh = localStorage.getItem("admin_refresh");
      // 🔹 FIX: Using adminLogout() instead of adminLogoutRequest()
      if (refresh) await adminLogout(refresh).catch(() => {});
    }
    localStorage.removeItem("admin_access");
    localStorage.removeItem("admin_refresh");
    setAdmin(null);
    navigate("/admin/login");
  };

  return (
    <AdminContext.Provider value={{ admin, loading, login, logout, setAdmin }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);