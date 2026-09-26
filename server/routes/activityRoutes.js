const express = require("express");

const {
  getMyActivity,
  createActivity,
} = require("../controllers/activityController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// GET MY ACTIVITY
// GET /api/activity
// =====================================================

router.get("/", protect, getMyActivity);


// =====================================================
// CREATE ACTIVITY
// POST /api/activity
// =====================================================

router.post("/", protect, createActivity);


module.exports = router;