// server/routes/rooms.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const Room = require('../models/Room');

// Middleware for admin access
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Admin role required' });
};

// Get all rooms (public route)
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find({ isAvailable: true });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific room (public route)
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin Routes (protected)

// Get all rooms (including unavailable ones) - Admin only
router.get('/admin/all', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new room - Admin only
router.post('/', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
  try {
    const {
      roomNumber,
      type,
      capacity,
      pricePerNight,
      amenities,
      images,
      isAvailable,
      description,
      floor,
      status
    } = req.body;
    
    // Check if room number already exists
    const roomExists = await Room.findOne({ roomNumber });
    if (roomExists) {
      return res.status(400).json({ message: 'Room number already exists' });
    }
    
    const newRoom = new Room({
      roomNumber,
      type,
      capacity,
      pricePerNight,
      amenities,
      images,
      isAvailable,
      description,
      floor,
      status
    });
    
    const savedRoom = await newRoom.save();
    res.status(201).json(savedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a room - Admin only
router.put('/:id', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
  try {
    const {
      roomNumber,
      type,
      capacity,
      pricePerNight,
      amenities,
      images,
      isAvailable,
      description,
      floor,
      status
    } = req.body;
    
    // If updating room number, check if it already exists
    if (roomNumber) {
      const roomExists = await Room.findOne({ 
        roomNumber, 
        _id: { $ne: req.params.id } 
      });
      
      if (roomExists) {
        return res.status(400).json({ message: 'Room number already exists' });
      }
    }
    
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      {
        roomNumber,
        type,
        capacity,
        pricePerNight,
        amenities,
        images,
        isAvailable,
        description,
        floor,
        status,
        updated: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a room - Admin only
router.delete('/:id', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;