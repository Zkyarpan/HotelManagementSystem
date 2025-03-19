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

// Booking service functions
export const bookingService = {
  // Get all bookings for current user
  getUserBookings: async () => {
    try {
      const response = await api.get("/api/bookings/my-bookings");
      return response.data;
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      throw error;
    }
  },

  // Get a specific booking by ID
  getBookingById: async (bookingId) => {
    try {
      const response = await api.get(`/api/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching booking ${bookingId}:`, error);
      throw error;
    }
  },

  // Create a new booking
  createBooking: async (bookingData) => {
    try {
      const response = await api.post("/api/bookings", bookingData);
      return response.data;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  },

  // Cancel a booking
  cancelBooking: async (bookingId) => {
    try {
      const response = await api.patch(`/api/bookings/${bookingId}/cancel`, {});
      return response.data;
    } catch (error) {
      console.error(`Error cancelling booking ${bookingId}:`, error);
      throw error;
    }
  },

  // Admin: Get all bookings - FIXED to use the correct endpoint
  getAllBookings: async () => {
    try {
      // Use the correct endpoint "/api/bookings/all" as defined in your Express router
      const response = await api.get("/api/bookings/all");
      return response.data;
    } catch (error) {
      console.error("Error fetching all bookings:", error);
      throw error;
    }
  },

  // Admin: Update booking status
  updateBookingStatus: async (bookingId, status) => {
    try {
      const response = await api.patch(`/api/bookings/${bookingId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating status for booking ${bookingId}:`, error);
      throw error;
    }
  },
};

// Room service functions
export const roomService = {
  getAllRooms: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();

      // Add all filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          queryParams.append(key, value);
        }
      });

      const response = await api.get(`/api/rooms?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getRoomById: async (roomId) => {
    try {
      const response = await api.get(`/api/rooms/${roomId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin functions
  createRoom: async (roomData) => {
    try {
      const response = await api.post("/api/rooms", roomData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateRoom: async (roomId, roomData) => {
    try {
      const response = await api.put(`/api/rooms/${roomId}`, roomData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteRoom: async (roomId) => {
    try {
      const response = await api.delete(`/api/rooms/${roomId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Auth service functions
export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post("/api/auth/login", credentials);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post("/api/auth/register", userData);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get("/api/auth/me");
      return response.data;
    } catch (error) {
      console.error("Error fetching current user:", error);
      throw error;
    }
  },
};

export default api;
