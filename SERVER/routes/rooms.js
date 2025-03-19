const express = require("express");
const router = express.Router();
const passport = require("passport");

// Admin access middleware
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res
    .status(403)
    .json({ message: "Access denied: Admin role required" });
};

// Import controllers
const roomController = require("../controllers/roomController");

// Important: Route order matters! More specific routes should come before generic ones

// Admin only routes - Note these come BEFORE the /:id route to prevent conflicts
router.get(
  "/admin/all", // Changed from /all to /admin/all to avoid route conflicts
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  roomController.getAdminRooms
);

// Public routes - available to all users
router.get("/", roomController.getRooms);
router.get("/all-available", roomController.getRooms); // Alias for frontend

// Status update route - more specific than the generic /:id route
router.patch(
  "/:id/status",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  (req, res) => {
    // Specific route for status updates
    const { status } = req.body;

    // Validate status
    const validStatuses = ["Ready", "Occupied", "Cleaning", "Maintenance"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    // Call existing update method with status
    roomController.updateRoom(req, res);
  }
);

// Availability update route
router.patch(
  "/:id/availability",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  roomController.updateRoomAvailability
);

// Create room with image upload
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  roomController.uploadRoomImages,
  roomController.createRoom
);

// Generic ID routes - these should come AFTER any routes with specific path segments
router.get("/:id", roomController.getRoom);

router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  roomController.uploadRoomImages,
  roomController.updateRoom
);

router.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  roomController.uploadRoomImages,
  roomController.updateRoom
);

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  roomController.deleteRoom
);

module.exports = router;
