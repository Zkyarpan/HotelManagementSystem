// server/models/Booking.js
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest',
    required: true
  },
  checkInDate: {
    type: Date,
    required: true
  },
  checkOutDate: {
    type: Date,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Refunded', 'Failed'],
    default: 'Pending'
  },
  bookingStatus: {
    type: String,
    enum: ['Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled'],
    default: 'Confirmed'
  },
  adults: {
    type: Number,
    required: true,
    min: 1
  },
  children: {
    type: Number,
    default: 0
  },
  specialRequests: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  }
});

// Add validation to ensure check-out date is after check-in date
BookingSchema.pre('validate', function(next) {
  if (this.checkInDate >= this.checkOutDate) {
    this.invalidate('checkOutDate', 'Check-out date must be after check-in date');
  }
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);