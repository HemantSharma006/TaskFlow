const express = require("express");

const {
  createTask,
  getMyTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create task
router.post("/", protect, createTask);

// Get all tasks assigned to logged-in user
router.get("/", protect, getMyTasks);

// Get single task
router.get("/:id", protect, getTaskById);

// Update task
router.put("/:id", protect, updateTask);

// Delete task
router.delete("/:id", protect, deleteTask);

module.exports = router;