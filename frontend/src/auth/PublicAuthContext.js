import React, { createContext, useContext, useState, useEffect } from "react";
// You might need to install this: npm install jwt-decode
import { jwtDecode } from "jwt-decode"; 

const PublicAuthContext = createContext(null);

export const PublicAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [jwt, setJwt] = useState(null); // Access Token
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true); // <--- CRITICAL for UI stability

  // 🔹 Load from localStorage on mount
  useEffect(() => {
    const initAuth = () => {
      const storedJwt = localStorage.getItem("jwt");
      const storedRefresh = localStorage.getItem("refreshToken");
      const storedUser = localStorage.getItem("user");

      if (storedJwt && storedUser) {
        try {
          // Optional: Check if token is expired
          const decoded = jwtDecode(storedJwt);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            // Token expired - let the API handle refresh or logout
            // For now, we assume valid until an API call fails
            setJwt(storedJwt);
            setRefreshToken(storedRefresh);
            setUser(JSON.parse(storedUser));
          } else {
            setJwt(storedJwt);
            setRefreshToken(storedRefresh);
            setUser(JSON.parse(storedUser));
          }
        } catch (e) {
          // Invalid token data
          logout();
        }
      }
      setLoading(false); // App is ready
    };

    initAuth();
  }, []);

  // 🔹 Login Handler
  const login = (access, userData, refresh) => {
    setJwt(access);
    setRefreshToken(refresh);
    setUser(userData);

    localStorage.setItem("jwt", access);
    localStorage.setItem("refreshToken", refresh);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // 🔹 Logout Handler
  const logout = () => {
    setJwt(null);
    setRefreshToken(null);
    setUser(null);

    localStorage.removeItem("jwt");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    // Optional: Redirect to home
    // window.location.href = "/";
  };

  const isLoggedIn = !!jwt;

  return (
    <PublicAuthContext.Provider
      value={{ user, jwt, refreshToken, login, logout, isLoggedIn, loading }}
    >
      {/* Don't render children until we know auth state */}
      {!loading && children} 
    </PublicAuthContext.Provider>
  );
};

export const useAuth = () => useContext(PublicAuthContext);