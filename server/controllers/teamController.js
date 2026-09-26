const Team = require("../models/Team");
const User = require("../models/User");

// ==================== CREATE TEAM ====================

const createTeam = async (req, res) => {
  try {
    const { teamName } = req.body;

    // Check team name
    if (!teamName || !teamName.trim()) {
      return res.status(400).json({
        message: "Team name is required",
      });
    }

    // Create team
    const team = await Team.create({
      teamName: teamName.trim(),
      createdBy: req.user.userId,
      members: [req.user.userId],
    });

    // Return populated team
    const populatedTeam = await Team.findById(team._id)
      .populate("createdBy", "name email role")
      .populate("members", "name email role");

    res.status(201).json({
      message: "Team created successfully",
      team: populatedTeam,
    });
  } catch (error) {
    console.error("Create team error:", error.message);

    res.status(500).json({
      message: "Server error while creating team",
    });
  }
};


// ==================== GET MY TEAMS ====================

const getMyTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      members: req.user.userId,
    })
      .populate("createdBy", "name email role")
      .populate("members", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      teams,
    });
  } catch (error) {
    console.error("Get teams error:", error.message);

    res.status(500).json({
      message: "Server error while fetching teams",
    });
  }
};


// ==================== GET SINGLE TEAM ====================

const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("members", "name email role");

    if (!team) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    // Check whether user belongs to the team
    const isMember = team.members.some(
      (member) => member._id.toString() === req.user.userId
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this team",
      });
    }

    res.status(200).json({
      team,
    });
  } catch (error) {
    console.error("Get team error:", error.message);

    res.status(500).json({
      message: "Server error while fetching team",
    });
  }
};


// ==================== ADD MEMBER ====================

const addMember = async (req, res) => {
  try {
    const { email } = req.body;

    // Check email
    if (!email) {
      return res.status(400).json({
        message: "Member email is required",
      });
    }

    // Find team
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    // Only team creator can add members
    if (team.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Only the team creator can add members",
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        message: "User with this email not found",
      });
    }

    // Check if already a member
    if (
      team.members.some(
        (memberId) => memberId.toString() === user._id.toString()
      )
    ) {
      return res.status(409).json({
        message: "User is already a member of this team",
      });
    }

    // Add member
    team.members.push(user._id);

    await team.save();

    const updatedTeam = await Team.findById(team._id)
      .populate("createdBy", "name email role")
      .populate("members", "name email role");

    res.status(200).json({
      message: "Member added successfully",
      team: updatedTeam,
    });
  } catch (error) {
    console.error("Add member error:", error.message);

    res.status(500).json({
      message: "Server error while adding member",
    });
  }
};


module.exports = {
  createTeam,
  getMyTeams,
  getTeamById,
  addMember,
};