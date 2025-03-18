// server/models/Room.js
const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Single', 'Double', 'Twin', 'Suite', 'Deluxe']
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  pricePerNight: {
    type: Number,
    required: true,
    min: 0
  },
  amenities: {
    type: [String],
    default: []
  },
  images: {
    type: [String],
    default: []
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  description: {
    type: String
  },
  floor: {
    type: Number
  },
  status: {
    type: String,
    enum: ['Ready', 'Occupied', 'Cleaning', 'Maintenance'],
    default: 'Ready'
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

module.exports = mongoose.model('Room', RoomSchema);