const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Room type is required'],
    enum: ['Single', 'Double', 'Twin', 'Suite', 'Deluxe', 'Standard'],
    default: 'Standard'
  },
  capacity: {
    type: Number,
    required: [true, 'Room capacity is required'],
    min: 1,
    max: 10,
    default: 1
  },
  pricePerNight: {
    type: Number,
    required: [true, 'Price per night is required'],
    min: 0,
    default: 0
  },
  floor: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  amenities: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  images: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['Ready', 'Occupied', 'Cleaning', 'Maintenance'],
    default: 'Ready'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add index for faster queries
RoomSchema.index({ roomNumber: 1 });
RoomSchema.index({ type: 1 });
RoomSchema.index({ status: 1 });
RoomSchema.index({ isAvailable: 1 });
RoomSchema.index({ pricePerNight: 1 });

// Virtual for bookings associated with this room
RoomSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'room',
  justOne: false
});

module.exports = mongoose.model('Room', RoomSchema);