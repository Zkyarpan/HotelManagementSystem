// server/routes/guests.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const Guest = require('../models/Guest');

// Middleware for admin or staff access
const isAdminOrStaff = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Admin or Staff role required' });
};

// Get current user's guest profile
router.get('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const guest = await Guest.findOne({ user: req.user._id });
    
    if (!guest) {
      return res.status(404).json({ message: 'Guest profile not found' });
    }
    
    res.json(guest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create or update current user's guest profile
router.post('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const {
      fullName,
      phone,
      address,
      identityType,
      identityNumber,
      preferences
    } = req.body;
    
    let guest = await Guest.findOne({ user: req.user._id });
    
    if (guest) {
      // Update existing profile
      guest.fullName = fullName || guest.fullName;
      guest.phone = phone || guest.phone;
      
      if (address) {
        guest.address = {
          ...guest.address,
          ...address
        };
      }
      
      guest.identityType = identityType || guest.identityType;
      guest.identityNumber = identityNumber || guest.identityNumber;
      guest.preferences = preferences || guest.preferences;
      guest.updated = Date.now();
    } else {
      // Create new profile
      guest = new Guest({
        user: req.user._id,
        fullName: fullName || req.user.name,
        email: req.user.email,
        phone,
        address,
        identityType,
        identityNumber,
        preferences
      });
    }
    
    await guest.save();
    
    res.json(guest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin/Staff Routes

// Get all guests - Admin/Staff only
router.get('/', passport.authenticate('jwt', { session: false }), isAdminOrStaff, async (req, res) => {
  try {
    const guests = await Guest.find().populate('user', 'name email role');
    res.json(guests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get specific guest - Admin/Staff only
router.get('/:id', passport.authenticate('jwt', { session: false }), isAdminOrStaff, async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id).populate('user', 'name email role');
    
    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }
    
    res.json(guest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update guest as admin - Admin/Staff only
router.put('/:id', passport.authenticate('jwt', { session: false }), isAdminOrStaff, async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      address,
      identityType,
      identityNumber,
      preferences,
      vip,
      notes
    } = req.body;
    
    const guest = await Guest.findById(req.params.id);
    
    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }
    
    // Update fields
    if (fullName) guest.fullName = fullName;
    if (email) guest.email = email;
    if (phone) guest.phone = phone;
    
    if (address) {
      guest.address = {
        ...guest.address,
        ...address
      };
    }
    
    if (identityType) guest.identityType = identityType;
    if (identityNumber) guest.identityNumber = identityNumber;
    if (preferences) guest.preferences = preferences;
    if (vip !== undefined) guest.vip = vip;
    if (notes) guest.notes = notes;
    
    guest.updated = Date.now();
    
    await guest.save();
    
    res.json(guest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete guest - Admin only
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    // Admin only can delete
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin role required' });
    }
    
    const guest = await Guest.findByIdAndDelete(req.params.id);
    
    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }
    
    res.json({ message: 'Guest deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;