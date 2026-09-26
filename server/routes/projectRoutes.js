const express = require("express");

const {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create project
router.post("/", protect, createProject);

// Get all projects available to logged-in user
router.get("/", protect, getMyProjects);

// Get single project
router.get("/:id", protect, getProjectById);

// Update project
router.put("/:id", protect, updateProject);

// Delete project
router.delete("/:id", protect, deleteProject);

module.exports = router;