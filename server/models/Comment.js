const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    // Task this comment belongs to
    taskID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    // User who created the comment
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Comment content
    commentText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Comment", commentSchema);