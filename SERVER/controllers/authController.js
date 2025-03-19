const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { email, password, name, role } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new ErrorResponse('User already exists', 400));
  }

  // Create new user
  const newUser = new User({
    email,
    password, // Model's pre-save hook will hash it
    name,
    role: role || 'user', // Default role is 'user'
    created: new Date(),
  });

  await newUser.save();

  res.status(201).json({ 
    success: true,
    message: 'User registered successfully' 
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return next(new ErrorResponse('Authentication error', 500));
    }

    if (!user) {
      return next(new ErrorResponse(info?.message || 'Authentication failed', 401));
    }

    // Create token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'aksjdaklsdjioqiwue[pqiewj',
      { expiresIn: '1d' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  })(req, res, next);
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
exports.getProfile = asyncHandler(async (req, res, next) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

/**
 * @desc    Admin only route
 * @route   GET /api/auth/admin
 * @access  Private/Admin
 */
exports.getAdminAccess = asyncHandler(async (req, res, next) => {
  res.json({ 
    success: true,
    message: 'Admin access granted' 
  });
});

/**
 * @desc    Check if JWT token is valid
 * @route   GET /api/auth/test
 * @access  Private
 */
exports.testToken = asyncHandler(async (req, res, next) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});