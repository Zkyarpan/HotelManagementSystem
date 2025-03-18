// client/src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  // Check for token on load
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setAuth({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
        return;
      }

      // Set auth header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      try {
        const res = await axios.get("/api/auth/profile");

        setAuth({
          isAuthenticated: true,
          user: res.data.user,
          loading: false,
        });
      } catch (err) {
        // Token might be invalid or expired
        localStorage.removeItem("token");
        setAuth({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
      }
    };

    loadUser();
  }, []);

  // Logout function
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");

    // Remove auth header
    delete axios.defaults.headers.common["Authorization"];

    // Set auth state to not authenticated
    setAuth({
      isAuthenticated: false,
      user: null,
      loading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
