const express = require("express");

const {
  createComment,
  getTaskComments,
  deleteComment,
} = require("../controllers/commentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// CREATE COMMENT
// POST /api/comments
// =====================================================

router.post("/", protect, createComment);


// =====================================================
// GET COMMENTS FOR TASK
// GET /api/comments/task/:taskID
// =====================================================

router.get("/task/:taskID", protect, getTaskComments);


// =====================================================
// DELETE COMMENT
// DELETE /api/comments/:id
// =====================================================

router.delete("/:id", protect, deleteComment);


module.exports = router;