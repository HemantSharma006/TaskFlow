const Comment = require("../models/Comment");
const Task = require("../models/Task");
const Activity = require("../models/Activity");

// =====================================================
// CREATE COMMENT
// =====================================================

const createComment = async (req, res) => {
  try {
    const { taskID, commentText } = req.body;

    // Check required fields
    if (!taskID || !commentText || !commentText.trim()) {
      return res.status(400).json({
        message: "Task ID and comment are required",
      });
    }

    // Check whether task exists
    const task = await Task.findById(taskID);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Only the user assigned to the task can comment
    if (task.assignedTo.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not authorized to comment on this task",
      });
    }

    // =================================================
    // CREATE COMMENT
    // =================================================

    const comment = await Comment.create({
      taskID,
      userID: req.user.userId,
      commentText: commentText.trim(),
    });

    // =================================================
    // CREATE ACTIVITY
    // =================================================

    try {
      await Activity.create({
        userID: req.user.userId,
        action: "Comment Added",
        description: `Added a comment to task "${task.title}"`,
        projectID: task.projectID,
        taskID: task._id,
      });
    } catch (activityError) {
      console.error(
        "Activity logging error:",
        activityError.message
      );
    }

    // =================================================
    // POPULATE COMMENT INFORMATION
    // =================================================

    const populatedComment = await Comment.findById(comment._id)
      .populate("userID", "name email role")
      .populate("taskID", "title");

    res.status(201).json({
      message: "Comment added successfully",
      comment: populatedComment,
    });

  } catch (error) {
    console.error("Create comment error:", error);

    res.status(500).json({
      message: "Server error while creating comment",
    });
  }
};


// =====================================================
// GET COMMENTS FOR A TASK
// =====================================================

const getTaskComments = async (req, res) => {
  try {
    const { taskID } = req.params;

    // Check task exists
    const task = await Task.findById(taskID);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Only assigned user can view comments
    if (task.assignedTo.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not authorized to view these comments",
      });
    }

    // Get comments
    const comments = await Comment.find({
      taskID,
    })
      .populate("userID", "name email role")
      .sort({ createdAt: 1 });

    res.status(200).json({
      comments,
    });

  } catch (error) {
    console.error("Get comments error:", error);

    res.status(500).json({
      message: "Server error while fetching comments",
    });
  }
};


// =====================================================
// DELETE COMMENT
// =====================================================

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    // Only the person who created the comment can delete it
    if (comment.userID.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not authorized to delete this comment",
      });
    }

    // Get task information before deleting comment
    const task = await Task.findById(comment.taskID);

    // Delete comment
    await Comment.findByIdAndDelete(comment._id);

    // =================================================
    // CREATE ACTIVITY
    // =================================================

    try {
      await Activity.create({
        userID: req.user.userId,
        action: "Comment Deleted",
        description: `Deleted a comment from task "${
          task ? task.title : "Unknown"
        }"`,
        projectID: task ? task.projectID : null,
        taskID: comment.taskID,
      });
    } catch (activityError) {
      console.error(
        "Activity logging error:",
        activityError.message
      );
    }

    res.status(200).json({
      message: "Comment deleted successfully",
    });

  } catch (error) {
    console.error("Delete comment error:", error);

    res.status(500).json({
      message: "Server error while deleting comment",
    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createComment,
  getTaskComments,
  deleteComment,
};