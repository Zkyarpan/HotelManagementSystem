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
} = require("../controllers/bookingController");

// User routes
router.get("/my-bookings", protect, getUserBookings);
router.post("/", protect, createBooking);
router.get("/:id", protect, getBooking);

// Admin routes
router.get("/all", protect, authorize("admin"), getAllBookings);
router.put("/:id", protect, authorize("admin"), updateBooking);
router.delete("/:id", protect, authorize("admin"), deleteBooking);
router.patch("/:id/status", protect, authorize("admin"), updateBookingStatus);

module.exports = router;
