import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode"; 

const PublicAuthContext = createContext(null);

export const PublicAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [jwt, setJwt] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Centralized Logout Handler (Wrapped in useCallback so we can use it in useEffect)
  const logout = useCallback(() => {
    setJwt(null);
    setRefreshToken(null);
    setUser(null);

    if (typeof window !== "undefined") {
      localStorage.removeItem("jwt");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  }, []);

  // 🔹 Load from localStorage on mount & sync across tabs
  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    const initAuth = () => {
      const storedJwt = localStorage.getItem("jwt");
      const storedRefresh = localStorage.getItem("refreshToken");
      const storedUser = localStorage.getItem("user");

      if (storedJwt && storedUser) {
        try {
          // Just decoding the token verifies it isn't malformed/corrupted garbage.
          // We don't need to manually check expiry dates here because our 
          // publicApi.js interceptor will automatically refresh it on the first failed request.
          jwtDecode(storedJwt); 
          
          setJwt(storedJwt);
          setRefreshToken(storedRefresh);
          setUser(JSON.parse(storedUser));
        } catch (e) {
          // Token is malformed
          logout();
        }
      }
      setLoading(false); // App is ready to render
    };

    initAuth();

    // 🚀 CROSS-TAB & API SYNC FIX: 
    // If publicApi.js wipes localStorage due to an expired refresh token, 
    // or if the user logs out in another tab, this catches it and updates React state instantly.
    const handleStorageChange = (e) => {
      if (e.key === "jwt" && e.newValue === null) {
        logout();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [logout]);

  // 🔹 Login Handler
  const login = (access, userData, refresh) => {
    setJwt(access);
    setRefreshToken(refresh);
    setUser(userData);

    if (typeof window !== "undefined") {
      localStorage.setItem("jwt", access);
      localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("user", JSON.stringify(userData));
    }
  };

  const isLoggedIn = !!jwt;

  return (
    <PublicAuthContext.Provider
      value={{ user, jwt, refreshToken, login, logout, isLoggedIn, loading }}
    >
      {/* Don't render children until we know auth state to prevent UI flashing */}
      {!loading && children} 
    </PublicAuthContext.Provider>
  );
};

export const useAuth = () => useContext(PublicAuthContext);