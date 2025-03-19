import { createContext, useState, useEffect } from "react";
import api from "../../components/utils/api";

export const AuthContext = createContext({
  auth: {
    isAuthenticated: false,
    user: null,
    loading: true,
  },
  login: () => {},
  register: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  // Function to set auth token in API headers
  const setAuthToken = (token) => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
      console.log("Auth token set in API headers");
    } else {
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
      console.log("Auth token removed from API headers");
    }
  };

  // Check for token on load
  useEffect(() => {
    const loadUser = async () => {
      console.log("Loading user from token if available");
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("No token found, user not authenticated");
        setAuth({
          isAuthenticated: true,
          user: res.data.user, 
          loading: false,
        });
        return;
      }

      // Make sure token is set in API headers
      setAuthToken(token);

      try {
        // Get user profile
        const res = await api.get("/api/auth/profile");

        console.log("User profile loaded successfully:", res.data);
        setAuth({
          isAuthenticated: true,
          user: res.data.user,
          loading: false,
        });
      } catch (err) {
        console.error("Error loading user profile:", err);

        if (err.response) {
          console.log("Server response status:", err.response.status);
          console.log("Server response data:", err.response.data);
        } else if (err.request) {
          console.log("No response received from server");
        } else {
          console.log("Error setting up request:", err.message);
        }

        // Token might be invalid or expired
        setAuthToken(null);

        setAuth({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      console.log("Attempting login for:", email);

      const res = await api.post("/api/auth/login", { email, password });
      console.log("Login response:", res.data);

      if (res.data && res.data.token) {
        // Set token in headers and localStorage
        setAuthToken(res.data.token);

        setAuth({
          isAuthenticated: true,
          user: res.data.user,
          loading: false,
        });

        return true;
      } else {
        console.error("Login response missing token or user data");
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Login failed:", err);

      if (err.response) {
        console.log("Login error status:", err.response.status);
        console.log("Login error data:", err.response.data);
      }

      throw err;
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      console.log("Registering new user:", email);

      const res = await api.post("/api/auth/register", {
        name,
        email,
        password,
        role: "user", // Default role
      });

      console.log("Registration successful:", res.data);
      return true;
    } catch (err) {
      console.error("Registration failed:", err);

      if (err.response) {
        console.log("Registration error status:", err.response.status);
        console.log("Registration error data:", err.response.data);
      }

      throw err;
    }
  };

  // Logout function
  const logout = () => {
    console.log("Logging out user");
    // Remove token from API headers and localStorage
    setAuthToken(null);

    // Set auth state to not authenticated
    setAuth({
      isAuthenticated: false,
      user: null,
      loading: false,
    });
  };

  // For testing authentication
  const testAuth = async () => {
    try {
      console.log("Testing authentication");
      const token = localStorage.getItem("token");
      console.log("Current token in storage:", token ? "Present" : "None");
      console.log("Current auth state:", auth);

      // Test if token is valid
      if (token) {
        const res = await api.get("/api/auth/test");
        console.log("Auth test response:", res.data);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Auth test failed:", err);
      return false;
    }
  };

  const contextValue = {
    auth,
    login,
    register,
    logout,
    testAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
