
import React, { createContext, useState, useContext, useEffect } from "react";
import {api} from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("luxury_user") || "null");
    } catch {
      localStorage.removeItem("luxury_user");
      return null;
    }
  });

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem("luxury_user");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const userData = response.data;

    setUser(userData);
    localStorage.setItem("luxury_user", JSON.stringify(userData));

    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("luxury_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
