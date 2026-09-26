const express = require("express");

const {
  signup,
  login,
  updateProfile,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// SIGNUP
// POST /api/auth/signup
// =====================================================

router.post("/signup", signup);

// =====================================================
// LOGIN
// POST /api/auth/login
// =====================================================

router.post("/login", login);

// =====================================================
// UPDATE PROFILE
// PUT /api/auth/profile
// =====================================================

router.put("/profile", protect, updateProfile);

module.exports = router;