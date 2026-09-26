const Activity = require("../models/Activity");

// =====================================================
// GET MY ACTIVITY
// =====================================================

const getMyActivity = async (req, res) => {
  try {
    const activities = await Activity.find({
      userID: req.user.userId,
    })
      .populate("userID", "name email role")
      .populate("projectID", "projectName")
      .populate("taskID", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      activities,
    });
  } catch (error) {
    console.error("Get activity error:", error);

    res.status(500).json({
      message: "Server error while fetching activity",
    });
  }
};


// =====================================================
// CREATE ACTIVITY
// =====================================================

const createActivity = async (req, res) => {
  try {
    const {
      action,
      description,
      projectID,
      taskID,
    } = req.body;

    if (!action || !description) {
      return res.status(400).json({
        message: "Action and description are required",
      });
    }

    const activity = await Activity.create({
      userID: req.user.userId,
      action: action.trim(),
      description: description.trim(),
      projectID: projectID || null,
      taskID: taskID || null,
    });

    const populatedActivity =
      await Activity.findById(activity._id)
        .populate("userID", "name email role")
        .populate("projectID", "projectName")
        .populate("taskID", "title");

    res.status(201).json({
      message: "Activity created successfully",
      activity: populatedActivity,
    });
  } catch (error) {
    console.error("Create activity error:", error);

    res.status(500).json({
      message: "Server error while creating activity",
    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getMyActivity,
  createActivity,
};