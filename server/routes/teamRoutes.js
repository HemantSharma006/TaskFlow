const express = require("express");

const {
  createTeam,
  getMyTeams,
  getTeamById,
  addMember,
} = require("../controllers/teamController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create a team
router.post("/", protect, createTeam);

// Get teams of logged-in user
router.get("/", protect, getMyTeams);

// Get a specific team
router.get("/:id", protect, getTeamById);

// Add member to a team
router.post("/:id/members", protect, addMember);

module.exports = router;