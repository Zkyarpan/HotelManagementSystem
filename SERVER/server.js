const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const helmet = require("helmet"); // Add security headers
const rateLimit = require("express-rate-limit"); // Add rate limiting
const morgan = require("morgan"); // Better logging
require("dotenv").config();
const path = require("path");
const fs = require("fs");

// Import routes
const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/rooms");
const bookingRoutes = require("./routes/bookings");
const guestRoutes = require("./routes/guests");

// Initialize Express app
const app = express();

// Import database connection
const connectDB = require("./config/db");

// Connect to MongoDB
connectDB();

// Security: Add Helmet middleware for security headers
app.use(helmet());

// Rate limiting for auth routes to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173", // Your React app's origin
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Important for cookies/authentication
  exposedHeaders: ["Content-Disposition"], // Add if needed for downloads
};

app.use(cors(corsOptions));

app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader(
      "Access-Control-Allow-Origin",
      process.env.CLIENT_URL || "http://localhost:5173"
    );
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "public", "uploads"))
);

app.use(express.static(path.join(__dirname, "public")));

// Middleware
app.use(express.json({ limit: "10mb" })); // Increase payload limit for image uploads
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Request logger middleware - use morgan in development
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());

// Load Passport configurations
require("./config/passport");

// JWT token parser middleware
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7, authHeader.length);
    req.token = token;
    if (process.env.NODE_ENV !== "production") {
      console.log(`[Server] JWT token present in request`);
    }
  }

  next();
});

app.use(express.static(path.join(__dirname, "public")));

const uploadsDir = path.join(__dirname, "public", "uploads", "rooms");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads directory structure");
}

// API Routes with versioning
app.use("/api/auth", authLimiter, authRoutes); // Apply rate limiting to auth routes
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/guests", guestRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    time: new Date(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Hotel Management System API",
    version: "1.0.0",
    documentation: "Access /api-docs for API documentation",
    routes: {
      auth: "/api/auth - Authentication endpoints",
      rooms: "/api/rooms - Room management endpoints",
      bookings: "/api/bookings - Booking management endpoints",
      guests: "/api/guests - Guest management endpoints",
      health: "/health - API health check",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Error handling middleware with more detailed response
app.use((err, req, res, next) => {
  console.error(`[Server] Error: ${err.message}`);

  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  // Determine status code (default to 500)
  const statusCode = err.statusCode || 500;

  // Prepare error response
  const errorResponse = {
    message: err.message || "Something went wrong!",
    status: statusCode,
    error:
      process.env.NODE_ENV === "production" ? "An error occurred" : err.message,
  };

  // Only include stack trace in development
  if (process.env.NODE_ENV !== "production") {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
});

// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  app.close(() => {
    console.log("Process terminated");
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`API available at: http://localhost:${PORT}`);
});

// Export for testing purposes
module.exports = { app, server };
