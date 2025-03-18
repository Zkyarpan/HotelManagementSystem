// server/routes/bookings.js
const express = require("express");
const router = express.Router();
const passport = require("passport");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const Guest = require("../models/Guest");

// Middleware for admin or staff access
const isAdminOrStaff = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "staff")) {
    return next();
  }
  return res
    .status(403)
    .json({ message: "Access denied: Admin or Staff role required" });
};

// Check if room is available for the given dates
const checkRoomAvailability = async (
  roomId,
  checkInDate,
  checkOutDate,
  excludeBookingId = null
) => {
  const query = {
    room: roomId,
    bookingStatus: { $nin: ["Cancelled"] },
    $or: [
      {
        checkInDate: { $lt: checkOutDate },
        checkOutDate: { $gt: checkInDate },
      },
    ],
  };

  // Exclude current booking when updating
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await Booking.findOne(query);
  return !conflictingBooking;
};

// Get user's own bookings
router.get(
  "/my-bookings",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // Find guest record for the current user
      const guest = await Guest.findOne({ user: req.user._id });

      if (!guest) {
        return res.status(404).json({ message: "Guest profile not found" });
      }

      const bookings = await Booking.find({ guest: guest._id })
        .populate("room")
        .sort({ created: -1 });

      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Create a new booking
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const {
        roomId,
        checkInDate,
        checkOutDate,
        adults,
        children,
        specialRequests,
      } = req.body;

      // Find guest profile or create if doesn't exist
      let guest = await Guest.findOne({ user: req.user._id });

      if (!guest) {
        guest = new Guest({
          user: req.user._id,
          fullName: req.user.name,
          email: req.user.email,
        });
        await guest.save();
      }

      // Find the room
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      // Check if room is available
      const isAvailable = await checkRoomAvailability(
        roomId,
        new Date(checkInDate),
        new Date(checkOutDate)
      );

      if (!isAvailable) {
        return res
          .status(400)
          .json({ message: "Room is not available for the selected dates" });
      }

      // Calculate number of nights
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

      // Calculate total amount
      const totalAmount = room.pricePerNight * nights;

      const newBooking = new Booking({
        room: roomId,
        guest: guest._id,
        checkInDate,
        checkOutDate,
        totalAmount,
        adults,
        children,
        specialRequests,
      });

      const savedBooking = await newBooking.save();

      // Populate room details for the response
      await savedBooking.populate("room");

      res.status(201).json(savedBooking);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Cancel a booking
router.patch(
  "/:id/cancel",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // Find guest profile
      const guest = await Guest.findOne({ user: req.user._id });

      if (!guest) {
        return res.status(404).json({ message: "Guest profile not found" });
      }

      // Find booking
      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Check if user owns this booking or is admin/staff
      const isOwner = booking.guest.toString() === guest._id.toString();
      const isAdminUser =
        req.user.role === "admin" || req.user.role === "staff";

      if (!isOwner && !isAdminUser) {
        return res
          .status(403)
          .json({ message: "Not authorized to cancel this booking" });
      }

      // Check if booking can be cancelled
      if (booking.bookingStatus === "Cancelled") {
        return res
          .status(400)
          .json({ message: "Booking is already cancelled" });
      }

      if (["Checked-In", "Checked-Out"].includes(booking.bookingStatus)) {
        return res
          .status(400)
          .json({ message: "Cannot cancel after check-in" });
      }

      // Update booking status
      booking.bookingStatus = "Cancelled";
      booking.updated = Date.now();

      await booking.save();

      res.json({ message: "Booking cancelled successfully", booking });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Admin Routes (protected)

// Get all bookings - Admin/Staff only
router.get(
  "/admin/all",
  passport.authenticate("jwt", { session: false }),
  isAdminOrStaff,
  async (req, res) => {
    try {
      const { status, roomId, fromDate, toDate } = req.query;

      // Build filter
      const filter = {};

      if (status) {
        filter.bookingStatus = status;
      }

      if (roomId) {
        filter.room = roomId;
      }

      // Date range filter
      if (fromDate || toDate) {
        filter.$or = [];

        if (fromDate && toDate) {
          // Bookings overlapping with the date range
          filter.$or.push({
            checkInDate: { $lte: new Date(toDate) },
            checkOutDate: { $gte: new Date(fromDate) },
          });
        } else if (fromDate) {
          // Bookings starting from fromDate
          filter.$or.push({
            checkInDate: { $gte: new Date(fromDate) },
          });
        } else if (toDate) {
          // Bookings until toDate
          filter.$or.push({
            checkOutDate: { $lte: new Date(toDate) },
          });
        }
      }

      const bookings = await Booking.find(filter)
        .populate("room")
        .populate("guest")
        .sort({ created: -1 });

      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Update booking status - Admin/Staff only
router.patch(
  "/:id/status",
  passport.authenticate("jwt", { session: false }),
  isAdminOrStaff,
  async (req, res) => {
    try {
      const { bookingStatus, paymentStatus } = req.body;

      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Update booking
      if (bookingStatus) {
        booking.bookingStatus = bookingStatus;
      }

      if (paymentStatus) {
        booking.paymentStatus = paymentStatus;
      }

      booking.updated = Date.now();

      await booking.save();

      res.json({ message: "Booking updated successfully", booking });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Delete booking - Admin only
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  isAdminOrStaff,
  async (req, res) => {
    try {
      // Admin only can delete
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Access denied: Admin role required" });
      }

      const booking = await Booking.findByIdAndDelete(req.params.id);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.json({ message: "Booking deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

module.exports = router;
