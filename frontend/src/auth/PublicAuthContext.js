import React, { createContext, useContext, useEffect, useState } from "react";

const PublicAuthContext = createContext(null);

export const PublicAuthProvider = ({ children }) => {
  const [jwt, setJwt] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on first render
  useEffect(() => {
    const storedJwt = localStorage.getItem("public_jwt");
    const storedUser = localStorage.getItem("public_user");

    if (storedJwt) {
      setJwt(storedJwt);
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }

    setLoading(false);
  }, []);

  // ✅ LOGIN (JWT + USER)
  const login = (token, userData = null) => {
    setJwt(token);
    setUser(userData);

    localStorage.setItem("public_jwt", token);

    if (userData) {
      localStorage.setItem("public_user", JSON.stringify(userData));
    }
  };

  // ✅ LOGOUT
  const logout = () => {
    setJwt(null);
    setUser(null);

    localStorage.removeItem("public_jwt");
    localStorage.removeItem("public_user");
  };

  const value = {
    jwt,
    user,
    isLoggedIn: !!jwt,
    login,
    logout,
    loading,
  };

  return (
    <PublicAuthContext.Provider value={value}>
      {!loading && children}
    </PublicAuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(PublicAuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside PublicAuthProvider");
  }
  return ctx;
};
