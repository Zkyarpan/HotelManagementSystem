import axios from "axios";

// Create base axios instance with correct backend URL
const api = axios.create({
  baseURL: "http://localhost:5000", // <-- Change this to your backend server URL
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies/sessions if needed
});

// Request interceptor - runs before every request
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // If token exists, add it to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("API Request:", {
      url: config.url,
      method: config.method,
      data: config.data
        ? JSON.stringify(config.data).substring(0, 500)
        : "No data",
    });

    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - runs after every response
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", {
      status: response.status,
      url: response.config.url,
      data: response.data
        ? JSON.stringify(response.data).substring(0, 500)
        : "No data",
    });

    return response;
  },
  (error) => {
    console.error(
      "Response error:",
      error.response
        ? {
            status: error.response.status,
            url: error.config.url,
            data: error.response.data,
          }
        : error.message
    );

    return Promise.reject(error);
  }
);

export default api;
