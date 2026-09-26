const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    // User who performed the activity
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Type of activity
    action: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional project related to activity
    projectID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    // Optional task related to activity
    taskID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    // Human-readable activity description
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Activity", activitySchema);