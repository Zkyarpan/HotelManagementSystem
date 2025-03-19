const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  updateBookingStatus,
  getUserBookings,
  getAllBookings,
  cancelBooking,
} = require("../controllers/bookingController");

// User routes
router.get("/my-bookings", protect, getUserBookings);
router.post("/", protect, createBooking);
router.patch("/:id/cancel", protect, cancelBooking);

// Admin routes
router.get("/all", protect, authorize("admin"), getAllBookings);

// Route for both admin and user with query parameter
router.get("/", protect, getBookings);

// Get specific booking - ensure this comes after other GET routes to prevent conflicts
router.get("/:id", protect, getBooking);

// Admin-only routes
router.put("/:id", protect, authorize("admin"), updateBooking);
router.delete("/:id", protect, authorize("admin"), deleteBooking);
router.patch("/:id/status", protect, authorize("admin"), updateBookingStatus);

module.exports = router;
