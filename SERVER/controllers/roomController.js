// const Room = require('../models/Room');

// // @desc   Get all rooms
// // @route  GET /api/rooms
// // @access Public
// exports.getRooms = async (req, res) => {
//   try {
//     let query;

//     // Copy req.query
//     const reqQuery = { ...req.query };

//     // Fields to exclude from filtering
//     const removeFields = ['select', 'sort', 'page', 'limit'];

//     // Remove fields from reqQuery
//     removeFields.forEach(param => delete reqQuery[param]);

//     // Create query string
//     let queryStr = JSON.stringify(reqQuery);

//     // Create operators ($gt, $gte, etc)
//     queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

//     // Finding resource
//     query = Room.find(JSON.parse(queryStr));

//     // Select fields
//     if (req.query.select) {
//       const fields = req.query.select.split(',').join(' ');
//       query = query.select(fields);
//     }

//     // Sort
//     if (req.query.sort) {
//       const sortBy = req.query.sort.split(',').join(' ');
//       query = query.sort(sortBy);
//     } else {
//       query = query.sort('-createdAt');
//     }

//     // Pagination
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 25;
//     const startIndex = (page - 1) * limit;
//     const endIndex = page * limit;
//     const total = await Room.countDocuments(JSON.parse(queryStr));

//     query = query.skip(startIndex).limit(limit);

//     // Execute query
//     const rooms = await query;

//     // Pagination result
//     const pagination = {};

//     if (endIndex < total) {
//       pagination.next = {
//         page: page + 1,
//         limit
//       };
//     }

//     if (startIndex > 0) {
//       pagination.prev = {
//         page: page - 1,
//         limit
//       };
//     }

//     res.status(200).json(rooms);
//   } catch (err) {
//     console.error("Error fetching rooms:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // @desc   Get single room
// // @route  GET /api/rooms/:id
// // @access Public
// exports.getRoom = async (req, res) => {
//   try {
//     const room = await Room.findById(req.params.id);

//     if (!room) {
//       return res.status(404).json({ message: `Room not found with id of ${req.params.id}` });
//     }

//     res.status(200).json(room);
//   } catch (err) {
//     console.error("Error fetching room:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // @desc   Create new room
// // @route  POST /api/rooms
// // @access Private/Admin
// exports.createRoom = async (req, res) => {
//   try {
//     console.log('Creating new room with data:', req.body);

//     // Validation
//     const { roomNumber } = req.body;

//     // Check if room with this number already exists
//     const existingRoom = await Room.findOne({ roomNumber });

//     if (existingRoom) {
//       return res.status(400).json({ message: `Room with number ${roomNumber} already exists` });
//     }

//     // Create room
//     const room = await Room.create(req.body);

//     console.log('Room created successfully:', room);

//     res.status(201).json(room);
//   } catch (err) {
//     console.error("Error creating room:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // @desc   Update room
// // @route  PUT /api/rooms/:id
// // @access Private/Admin
// exports.updateRoom = async (req, res) => {
//   try {
//     let room = await Room.findById(req.params.id);

//     if (!room) {
//       return res.status(404).json({ message: `Room not found with id of ${req.params.id}` });
//     }

//     // If updating room number, check if new number already exists
//     if (req.body.roomNumber && req.body.roomNumber !== room.roomNumber) {
//       const existingRoom = await Room.findOne({ roomNumber: req.body.roomNumber });

//       if (existingRoom) {
//         return res.status(400).json({ message: `Room with number ${req.body.roomNumber} already exists` });
//       }
//     }

//     // Update timestamps
//     req.body.updatedAt = Date.now();

//     room = await Room.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true
//     });

//     res.status(200).json(room);
//   } catch (err) {
//     console.error("Error updating room:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // @desc   Delete room
// // @route  DELETE /api/rooms/:id
// // @access Private/Admin
// exports.deleteRoom = async (req, res) => {
//   try {
//     const room = await Room.findById(req.params.id);

//     if (!room) {
//       return res.status(404).json({ message: `Room not found with id of ${req.params.id}` });
//     }

//     await room.deleteOne();

//     res.status(200).json({ message: 'Room deleted successfully' });
//   } catch (err) {
//     console.error("Error deleting room:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // @desc   Update room availability
// // @route  PATCH /api/rooms/:id/availability
// // @access Private/Admin
// exports.updateRoomAvailability = async (req, res) => {
//   try {
//     const { isAvailable } = req.body;

//     if (typeof isAvailable !== 'boolean') {
//       return res.status(400).json({ message: 'isAvailable must be a boolean value' });
//     }

//     const room = await Room.findByIdAndUpdate(
//       req.params.id,
//       { isAvailable, updatedAt: Date.now() },
//       { new: true, runValidators: true }
//     );

//     if (!room) {
//       return res.status(404).json({ message: `Room not found with id of ${req.params.id}` });
//     }

//     res.status(200).json(room);
//   } catch (err) {
//     console.error("Error updating room availability:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // @desc   Get admin rooms (includes all data including unavailable)
// // @route  GET /api/rooms/all
// // @access Private/Admin
// exports.getAdminRooms = async (req, res) => {
//   try {
//     const rooms = await Room.find().sort('-createdAt');

//     res.status(200).json(rooms);
//   } catch (err) {
//     console.error("Error fetching admin rooms:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

const Room = require("../models/Room");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "public/uploads/rooms";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "room-" + uniqueSuffix + ext);
  },
});

// Set up file filter
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

// Initialize multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: fileFilter,
}).array("images", 10); // Allow up to 10 images

// Middleware to handle file uploads
exports.uploadRoomImages = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred
      return res.status(500).json({ message: `Server error: ${err.message}` });
    }

    // Process the uploaded files and form data
    if (req.files && req.files.length > 0) {
      // Add image paths to req.body
      const imagePaths = req.files.map(
        (file) => `/uploads/rooms/${file.filename}`
      );

      // If body is already parsed as JSON
      if (typeof req.body === "object") {
        // Handle existing images if they were passed as a JSON string
        if (req.body.existingImages) {
          try {
            const existingImages = JSON.parse(req.body.existingImages);
            req.body.images = [...existingImages, ...imagePaths];
          } catch (e) {
            req.body.images = imagePaths;
          }
        } else {
          req.body.images = imagePaths;
        }
      }

      // Handle amenities if they were passed as a JSON string
      if (req.body.amenities && typeof req.body.amenities === "string") {
        try {
          req.body.amenities = JSON.parse(req.body.amenities);
        } catch (e) {
          console.error("Error parsing amenities:", e);
        }
      }
    }

    next();
  });
};

// Helper function to delete image files
const deleteImageFiles = (imagePaths) => {
  if (!imagePaths || !Array.isArray(imagePaths)) return;

  imagePaths.forEach((imagePath) => {
    // Only delete if it's in our uploads folder (security check)
    if (imagePath && imagePath.startsWith("/uploads/rooms/")) {
      const fullPath = path.join(__dirname, "../public", imagePath);

      fs.access(fullPath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(fullPath, (unlinkErr) => {
            if (unlinkErr) {
              console.error(`Error deleting image ${fullPath}:`, unlinkErr);
            }
          });
        }
      });
    }
  });
};

// @desc   Get all rooms
// @route  GET /api/rooms
// @access Public
exports.getRooms = async (req, res) => {
  try {
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
    query = Room.find(JSON.parse(queryStr));

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
    const total = await Room.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const rooms = await query;

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

    res.status(200).json({
      success: true,
      count: rooms.length,
      pagination,
      data: rooms,
    });
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc   Get single room
// @route  GET /api/rooms/:id
// @access Public
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res
        .status(404)
        .json({ message: `Room not found with id of ${req.params.id}` });
    }

    res.status(200).json(room);
  } catch (err) {
    console.error("Error fetching room:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc   Create new room
// @route  POST /api/rooms
// @access Private/Admin
exports.createRoom = async (req, res) => {
  try {
    console.log("Creating new room with data:", req.body);

    // Validation
    const { roomNumber } = req.body;

    // Check if room with this number already exists
    const existingRoom = await Room.findOne({ roomNumber });

    if (existingRoom) {
      // Clean up any uploaded images
      if (req.body.images && Array.isArray(req.body.images)) {
        deleteImageFiles(req.body.images);
      }
      return res
        .status(400)
        .json({ message: `Room with number ${roomNumber} already exists` });
    }

    // Create room
    const room = await Room.create(req.body);

    console.log("Room created successfully:", room);

    res.status(201).json({
      success: true,
      data: room,
    });
  } catch (err) {
    console.error("Error creating room:", err);

    // Clean up any uploaded images on error
    if (req.body.images && Array.isArray(req.body.images)) {
      deleteImageFiles(req.body.images);
    }

    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc   Update room
// @route  PUT /api/rooms/:id
// @access Private/Admin
exports.updateRoom = async (req, res) => {
  try {
    let room = await Room.findById(req.params.id);

    if (!room) {
      // Clean up any uploaded images
      if (req.body.images && Array.isArray(req.body.images)) {
        // Only delete the newly uploaded images, not the existing ones
        const existingImages = req.body.existingImages
          ? JSON.parse(req.body.existingImages)
          : [];
        const newImages = req.body.images.filter(
          (img) => !existingImages.includes(img)
        );
        deleteImageFiles(newImages);
      }
      return res
        .status(404)
        .json({ message: `Room not found with id of ${req.params.id}` });
    }

    // If updating room number, check if new number already exists
    if (req.body.roomNumber && req.body.roomNumber !== room.roomNumber) {
      const existingRoom = await Room.findOne({
        roomNumber: req.body.roomNumber,
      });

      if (existingRoom) {
        // Clean up any uploaded images
        if (req.body.images && Array.isArray(req.body.images)) {
          // Only delete the newly uploaded images, not the existing ones
          const existingImages = req.body.existingImages
            ? JSON.parse(req.body.existingImages)
            : [];
          const newImages = req.body.images.filter(
            (img) => !existingImages.includes(img)
          );
          deleteImageFiles(newImages);
        }
        return res
          .status(400)
          .json({
            message: `Room with number ${req.body.roomNumber} already exists`,
          });
      }
    }

    // Process images to identify deleted images that need to be removed from the file system
    const currentImages = room.images || [];
    const keepImages = req.body.existingImages
      ? JSON.parse(req.body.existingImages)
      : [];

    // Find images that were deleted in this update
    const imagesToDelete = currentImages.filter(
      (img) => !keepImages.includes(img)
    );

    // Delete removed image files
    if (imagesToDelete.length > 0) {
      deleteImageFiles(imagesToDelete);
    }

    // Update timestamps
    req.body.updatedAt = Date.now();

    // Update the room
    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (err) {
    console.error("Error updating room:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc   Delete room
// @route  DELETE /api/rooms/:id
// @access Private/Admin
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res
        .status(404)
        .json({ message: `Room not found with id of ${req.params.id}` });
    }

    // Delete associated image files
    if (room.images && Array.isArray(room.images)) {
      deleteImageFiles(room.images);
    }

    // Delete the room
    await room.deleteOne();

    res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting room:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc   Update room availability
// @route  PATCH /api/rooms/:id/availability
// @access Private/Admin
exports.updateRoomAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    if (typeof isAvailable !== "boolean") {
      return res
        .status(400)
        .json({ message: "isAvailable must be a boolean value" });
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { isAvailable, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!room) {
      return res
        .status(404)
        .json({ message: `Room not found with id of ${req.params.id}` });
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (err) {
    console.error("Error updating room availability:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc   Get admin rooms (includes all data including unavailable)
// @route  GET /api/rooms/all
// @access Private/Admin
exports.getAdminRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort("-createdAt");

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (err) {
    console.error("Error fetching admin rooms:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
