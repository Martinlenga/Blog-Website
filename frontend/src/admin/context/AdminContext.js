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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshAdmin = async () => {
    try {
      const { data } = await getAdminProfile();
      
      // Safely determine the base URL (Handles both Vite and CRA environments)
      const baseURL = (process.env.REACT_APP_API_URL || import.meta.env?.VITE_API_URL || "http://localhost:8000").replace(/\/api\/?$/, "");

      // Ensure we don't double-append HTTP if the backend already provided an absolute URL
      const profileImage = data.profile_picture 
        ? (data.profile_picture.startsWith("http") ? data.profile_picture : `${baseURL}${data.profile_picture}`)
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(data.username)}&background=0D8ABC&color=fff`;

      setAdmin({
        ...data,
        profileImage,
      });
    } catch (error) {
      console.error("Failed to refresh admin data", error);
      // If we fail to fetch the profile (e.g., token expired), we should nullify the admin state
      setAdmin(null);
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

  // Update the login function signature to accept 'redirectPath'
  const login = async (credentials, redirectPath = "/admin/dashboard/overview") => {
    try {
      const { data } = await adminLogin(credentials);
      localStorage.setItem("admin_access", data.access);
      localStorage.setItem("admin_refresh", data.refresh);
      
      await refreshAdmin(); 
      
      // Navigate to the dynamic path instead of the hardcoded one!
      navigate(redirectPath, { replace: true }); 
      
    } catch (error) {
      throw error; 
    }
  };

  const logout = async (callApi = true) => {
    if (callApi) {
      const refresh = localStorage.getItem("admin_refresh");
      // Catch errors silently so a failed backend logout doesn't stop the frontend from clearing storage
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