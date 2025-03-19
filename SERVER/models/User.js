// server/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin", "staff"],
    default: "user",
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

// Method to check if password matches
// This is explicitly defining the method on the schema
UserSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    console.log("Matching password for user:", this.email);
    console.log("Entered password length:", enteredPassword.length);
    console.log("Stored password hash:", this.password);

    // Use bcrypt to compare the entered password with the stored hash
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log("Password match result:", isMatch);
    return isMatch;
  } catch (error) {
    console.error("Error matching password:", error);
    return false;
  }
};

// Pre-save middleware to hash the password
UserSchema.pre("save", async function (next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified("password")) {
    console.log("Password not modified, skipping hash");
    return next();
  }

  try {
    console.log("Hashing password for user:", this.email);
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password along with the new salt
    this.password = await bcrypt.hash(this.password, salt);
    console.log("Password hashed successfully");
    next();
  } catch (error) {
    console.error("Error hashing password:", error);
    next(error);
  }
});

module.exports = mongoose.model("User", UserSchema);
