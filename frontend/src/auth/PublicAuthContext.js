import React, { createContext, useContext, useState, useEffect } from "react";

const PublicAuthContext = createContext(null);

export const PublicAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [jwt, setJwt] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  // 🔹 Load from localStorage on mount
  useEffect(() => {
    const storedJwt = localStorage.getItem("jwt");
    const storedRefresh = localStorage.getItem("refreshToken");
    const storedUser = localStorage.getItem("user");

    if (storedJwt && storedUser) {
      setJwt(storedJwt);
      setRefreshToken(storedRefresh);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 🔹 Save to localStorage whenever login happens
  const login = (access, userData, refresh) => {
    setJwt(access);
    setRefreshToken(refresh);
    setUser(userData);

    localStorage.setItem("jwt", access);
    localStorage.setItem("refreshToken", refresh);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setJwt(null);
    setRefreshToken(null);
    setUser(null);

    localStorage.removeItem("jwt");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  };

  const isLoggedIn = !!jwt;

  return (
    <PublicAuthContext.Provider
      value={{ user, jwt, refreshToken, login, logout, isLoggedIn }}
    >
      {children}
    </PublicAuthContext.Provider>
  );
};

export const useAuth = () => useContext(PublicAuthContext);
