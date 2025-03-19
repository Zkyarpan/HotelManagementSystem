const Booking = require("../models/Booking");
const Room = require("../models/Room");

/**
 * @desc    Get all bookings (with filtering)
 * @route   GET /api/bookings
 * @access  Private/Admin
 */
exports.getBookings = async (req, res) => {
  try {
    // If admin=true query parameter is present, redirect to getAllBookings
    if (req.query.admin === "true") {
      return this.getAllBookings(req, res);
    }

    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from filtering
    const removeFields = ["select", "sort", "page", "limit"];

    // Remove fields from reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    // Finding resource
    query = Booking.find(JSON.parse(queryStr))
      .populate({
        path: "room",
        select: "roomNumber type pricePerNight floor images amenities",
      })
      .populate({
        path: "user",
        select: "name email",
      });

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Booking.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const bookings = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * @desc    Get single booking
 * @route   GET /api/bookings/:id
 * @access  Private
 */
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: "room",
        select: "roomNumber type pricePerNight floor images amenities",
      })
      .populate({
        path: "user",
        select: "name email",
      });

    if (!booking) {
      return res
        .status(404)
        .json({ message: `Booking not found with id of ${req.params.id}` });
    }

    // Make sure user owns booking or is admin
    if (
      booking.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this booking" });
    }

    res.status(200).json(booking);
  } catch (err) {
    console.error("Error fetching booking:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * @desc    Create new booking
 * @route   POST /api/bookings
 * @access  Private
 */
exports.createBooking = async (req, res) => {
  try {
    // Add user ID to req.body
    req.body.user = req.user.id;

    // Check if room exists and is available
    const room = await Room.findById(req.body.roomId);

    if (!room) {
      return res
        .status(404)
        .json({ message: `Room not found with id of ${req.body.roomId}` });
    }

    if (!room.isAvailable) {
      return res
        .status(400)
        .json({ message: "Room is not available for booking" });
    }

    // Check if room is already booked for the requested dates
    const conflictingBooking = await Booking.findOne({
      room: req.body.roomId,
      status: { $in: ["confirmed", "pending"] }, // Only check active bookings
      $or: [
        // New booking starts during an existing booking
        {
          checkInDate: { $lte: new Date(req.body.checkInDate) },
          checkOutDate: { $gt: new Date(req.body.checkInDate) },
        },
        // New booking ends during an existing booking
        {
          checkInDate: { $lt: new Date(req.body.checkOutDate) },
          checkOutDate: { $gte: new Date(req.body.checkOutDate) },
        },
        // New booking contains an existing booking
        {
          checkInDate: { $gte: new Date(req.body.checkInDate) },
          checkOutDate: { $lte: new Date(req.body.checkOutDate) },
        },
      ],
    });

    if (conflictingBooking) {
      return res
        .status(400)
        .json({ message: "Room is already booked for the selected dates" });
    }

    // Format the booking data
    const bookingData = {
      user: req.user.id,
      room: req.body.roomId,
      checkInDate: req.body.checkInDate,
      checkOutDate: req.body.checkOutDate,
      guests: req.body.guests,
      totalPrice: req.body.totalPrice,
      status: "confirmed", // Default status
      specialRequests: req.body.specialRequests,
    };

    // Create booking
    const booking = await Booking.create(bookingData);

    // Update room availability if booking dates include today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(req.body.checkInDate);
    checkIn.setHours(0, 0, 0, 0);
    const checkOut = new Date(req.body.checkOutDate);
    checkOut.setHours(0, 0, 0, 0);

    if (checkIn <= today && checkOut > today) {
      // If the booking period includes today, mark room as unavailable
      await Room.findByIdAndUpdate(req.body.roomId, { isAvailable: false });
    }

    // Return the booking with populated room and user data
    const populatedBooking = await Booking.findById(booking._id)
      .populate({
        path: "room",
        select: "roomNumber type pricePerNight floor images amenities",
      })
      .populate({
        path: "user",
        select: "name email",
      });

    res.status(201).json(populatedBooking);
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * @desc    Update booking
 * @route   PUT /api/bookings/:id
 * @access  Private/Admin
 */
exports.updateBooking = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res
        .status(404)
        .json({ message: `Booking not found with id of ${req.params.id}` });
    }

    // Make sure user is admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can update booking details" });
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate({
        path: "room",
        select: "roomNumber type pricePerNight floor images amenities",
      })
      .populate({
        path: "user",
        select: "name email",
      });

    res.status(200).json(booking);
  } catch (err) {
    console.error("Error updating booking:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * @desc    Delete booking
 * @route   DELETE /api/bookings/:id
 * @access  Private/Admin
 */
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res
        .status(404)
        .json({ message: `Booking not found with id of ${req.params.id}` });
    }

    // Only admin can delete bookings
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can delete bookings" });
    }

    // Update room availability
    await Room.findByIdAndUpdate(booking.room, { isAvailable: true });

    await booking.deleteOne();

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error("Error deleting booking:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * @desc    Update booking status
 * @route   PATCH /api/bookings/:id/status
 * @access  Private/Admin
 */
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Please provide a status" });
    }

    // Validate status
    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res
        .status(404)
        .json({ message: `Booking not found with id of ${req.params.id}` });
    }

    // If status is changing to cancelled or completed, potentially update room availability
    if (
      (status === "cancelled" || status === "completed") &&
      (booking.status === "confirmed" || booking.status === "pending")
    ) {
      await Room.findByIdAndUpdate(booking.room, { isAvailable: true });
    }

    // If status is changing to confirmed, potentially update room availability
    if (status === "confirmed" && booking.status !== "confirmed") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkIn = new Date(booking.checkInDate);
      checkIn.setHours(0, 0, 0, 0);
      const checkOut = new Date(booking.checkOutDate);
      checkOut.setHours(0, 0, 0, 0);

      if (checkIn <= today && checkOut > today) {
        await Room.findByIdAndUpdate(booking.room, { isAvailable: false });
      }
    }

    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
      .populate({
        path: "room",
        select: "roomNumber type pricePerNight floor images amenities",
      })
      .populate({
        path: "user",
        select: "name email",
      });

    res.status(200).json(booking);
  } catch (err) {
    console.error("Error updating booking status:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * @desc    Get logged in user's bookings
 * @route   GET /api/bookings/my-bookings
 * @access  Private
 */
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: "room",
        select: "roomNumber type pricePerNight floor images amenities",
      })
      .sort("-createdAt");

    res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * @desc    Get all bookings (admin)
 * @route   GET /api/bookings/all
 * @access  Private/Admin
 */
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: "room",
        select: "roomNumber type pricePerNight floor images amenities",
      })
      .populate({
        path: "user",
        select: "name email",
      })
      .sort("-createdAt");

    res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching all bookings:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * @desc    Cancel a booking
 * @route   PATCH /api/bookings/:id/cancel
 * @access  Private
 */
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: `Booking not found with id of ${req.params.id}`,
      });
    }

    // Make sure user owns booking or is admin
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not authorized to cancel this booking",
      });
    }

    // Update booking status
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: "cancelled",
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    ).populate({
      path: "room",
      select: "roomNumber type pricePerNight floor images amenities",
    });

    // Update room availability
    await Room.findByIdAndUpdate(booking.room, { isAvailable: true });

    res.status(200).json(updatedBooking);
  } catch (err) {
    console.error("Error cancelling booking:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
