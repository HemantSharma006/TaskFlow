const Task = require("../models/Task");
const Project = require("../models/Project");
const Activity = require("../models/Activity");

// =====================================================
// CREATE TASK
// =====================================================

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      projectID,
      assignedTo,
      priority,
      dueDate,
      status,
    } = req.body;

    // Check required fields
    if (!title || !projectID) {
      return res.status(400).json({
        message: "Task title and project are required",
      });
    }

    // Check project exists
    const project = await Project.findById(projectID);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // The logged-in user must be assigned by default
    const taskAssignedTo =
      assignedTo || req.user.userId;

    // Create task
    const task = await Task.create({
      title: title.trim(),
      description: description
        ? description.trim()
        : "",
      projectID,
      assignedTo: taskAssignedTo,
      priority: priority || "Medium",
      dueDate: dueDate || null,
      status: status || "To Do",
    });

    // =================================================
    // CREATE ACTIVITY
    // =================================================

    try {
      await Activity.create({
        userID: req.user.userId,
        action: "Task Created",
        description: `Created task "${task.title}"`,
        projectID: task.projectID,
        taskID: task._id,
      });
    } catch (activityError) {
      console.error(
        "Activity logging error:",
        activityError.message
      );
    }

    // Populate related information
    const populatedTask = await Task.findById(task._id)
      .populate(
        "assignedTo",
        "name email role"
      )
      .populate(
        "projectID",
        "projectName description deadline"
      );

    res.status(201).json({
      message: "Task created successfully",
      task: populatedTask,
    });
  } catch (error) {
    console.error(
      "Create task error:",
      error.message
    );

    res.status(500).json({
      message: "Server error while creating task",
    });
  }
};


// =====================================================
// GET MY TASKS
// =====================================================

const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user.userId,
    })
      .populate(
        "assignedTo",
        "name email role"
      )
      .populate(
        "projectID",
        "projectName description deadline"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      tasks,
    });
  } catch (error) {
    console.error(
      "Get tasks error:",
      error.message
    );

    res.status(500).json({
      message: "Server error while fetching tasks",
    });
  }
};


// =====================================================
// GET SINGLE TASK
// =====================================================

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate(
        "assignedTo",
        "name email role"
      )
      .populate(
        "projectID",
        "projectName description deadline"
      );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Only assigned user can view task
    if (
      task.assignedTo._id.toString() !==
      req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to view this task",
      });
    }

    res.status(200).json({
      task,
    });
  } catch (error) {
    console.error(
      "Get task error:",
      error.message
    );

    res.status(500).json({
      message: "Server error while fetching task",
    });
  }
};


// =====================================================
// UPDATE TASK
// =====================================================

const updateTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      status,
    } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Only assigned user can update task
    if (
      task.assignedTo.toString() !==
      req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to update this task",
      });
    }

    // Remember old status
    const oldStatus = task.status;

    // =================================================
    // UPDATE SUPPLIED FIELDS ONLY
    // =================================================

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          message:
            "Task title cannot be empty",
        });
      }

      task.title = title.trim();
    }

    if (description !== undefined) {
      task.description = description.trim();
    }

    if (priority !== undefined) {
      task.priority = priority;
    }

    if (dueDate !== undefined) {
      task.dueDate = dueDate || null;
    }

    if (status !== undefined) {
      task.status = status;
    }

    await task.save();

    // =================================================
    // CREATE ACTIVITY
    // =================================================

    try {
      let action = "Task Updated";
      let descriptionText =
        `Updated task "${task.title}"`;

      // If task changed to Done
      if (
        status === "Done" &&
        oldStatus !== "Done"
      ) {
        action = "Task Completed";

        descriptionText =
          `Completed task "${task.title}"`;
      }

      await Activity.create({
        userID: req.user.userId,
        action,
        description: descriptionText,
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
    // POPULATE UPDATED TASK
    // =================================================

    const updatedTask =
      await Task.findById(task._id)
        .populate(
          "assignedTo",
          "name email role"
        )
        .populate(
          "projectID",
          "projectName description deadline"
        );

    res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error(
      "Update task error:",
      error.message
    );

    res.status(500).json({
      message: "Server error while updating task",
    });
  }
};


// =====================================================
// DELETE TASK
// =====================================================

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Only assigned user can delete task
    if (
      task.assignedTo.toString() !==
      req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to delete this task",
      });
    }

    // Save information before deleting
    const taskTitle = task.title;
    const taskProjectID = task.projectID;
    const taskID = task._id;

    // Delete task
    await Task.findByIdAndDelete(task._id);

    // =================================================
    // CREATE ACTIVITY
    // =================================================

    try {
      await Activity.create({
        userID: req.user.userId,
        action: "Task Deleted",
        description:
          `Deleted task "${taskTitle}"`,
        projectID: taskProjectID,
        taskID: taskID,
      });
    } catch (activityError) {
      console.error(
        "Activity logging error:",
        activityError.message
      );
    }

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete task error:",
      error.message
    );

    res.status(500).json({
      message: "Server error while deleting task",
    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createTask,
  getMyTasks,
  getTaskById,
  updateTask,
  deleteTask,
};