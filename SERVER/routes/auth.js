const express = require("express");
const router = express.Router();
const passport = require("passport");
const { protect, authorize } = require("../middleware/auth");
const {
  register,
  login,
  getProfile,
  getAdminAccess,
  testToken,
} = require("../controllers/authController");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes - requires authentication
router.get("/profile", protect, getProfile);
router.get("/test", protect, testToken);

// Admin only routes
router.get("/admin", protect, authorize("admin"), getAdminAccess);

module.exports = router;
