import { createContext, useContext, useState, useEffect } from "react";
import { getAdminProfile } from "../services/adminApi";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [profile, setProfile] = useState({ username: "", profileImage: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cachedProfile = localStorage.getItem("admin_profile");
    if (cachedProfile) {
      setProfile(JSON.parse(cachedProfile));
      setLoading(false);
    } else {
      getAdminProfile()
        .then((res) => {
          const username = res.data.username;
          const profileImage = res.data.profile_picture
            ? `http://127.0.0.1:8000${res.data.profile_picture}`
            : `https://ui-avatars.com/api/?name=${username}&background=0D8ABC&color=fff`;

          const profileData = { username, profileImage };
          setProfile(profileData);
          localStorage.setItem("admin_profile", JSON.stringify(profileData));
        })
        .catch((err) => {
          console.error("Failed to fetch admin profile:", err);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  return (
    <AdminContext.Provider value={{ profile, loading, setProfile }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
