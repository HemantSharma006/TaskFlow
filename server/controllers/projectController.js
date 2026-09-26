const Project = require("../models/Project");
const Team = require("../models/Team");

// ==================== CREATE PROJECT ====================

const createProject = async (req, res) => {
  try {
    const {
      projectName,
      teamID,
      description,
      deadline,
    } = req.body;

    // Check required fields
    if (!projectName || !teamID || !deadline) {
      return res.status(400).json({
        message: "Project name, team and deadline are required",
      });
    }

    // Check whether team exists
    const team = await Team.findById(teamID);

    if (!team) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    // Check whether user belongs to the team
    const isMember = team.members.some(
      (memberId) => memberId.toString() === req.user.userId
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this team",
      });
    }

    // Create project
    const project = await Project.create({
      projectName: projectName.trim(),
      teamID,
      description: description ? description.trim() : "",
      deadline,
      createdBy: req.user.userId,
    });

    // Return populated project
    const populatedProject = await Project.findById(project._id)
      .populate("teamID", "teamName")
      .populate("createdBy", "name email role");

    res.status(201).json({
      message: "Project created successfully",
      project: populatedProject,
    });
  } catch (error) {
    console.error("Create project error:", error.message);

    res.status(500).json({
      message: "Server error while creating project",
    });
  }
};


// ==================== GET MY PROJECTS ====================

const getMyProjects = async (req, res) => {
  try {
    // Find teams where current user is a member
    const teams = await Team.find({
      members: req.user.userId,
    }).select("_id");

    const teamIds = teams.map((team) => team._id);

    // Find projects belonging to those teams
    const projects = await Project.find({
      teamID: { $in: teamIds },
    })
      .populate("teamID", "teamName")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error.message);

    res.status(500).json({
      message: "Server error while fetching projects",
    });
  }
};


// ==================== GET SINGLE PROJECT ====================

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("teamID", "teamName")
      .populate("createdBy", "name email role");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Check team membership
    const team = await Team.findById(project.teamID._id);

    if (!team) {
      return res.status(404).json({
        message: "Associated team not found",
      });
    }

    const isMember = team.members.some(
      (memberId) => memberId.toString() === req.user.userId
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project's team",
      });
    }

    res.status(200).json({
      project,
    });
  } catch (error) {
    console.error("Get project error:", error.message);

    res.status(500).json({
      message: "Server error while fetching project",
    });
  }
};


// ==================== UPDATE PROJECT ====================

const updateProject = async (req, res) => {
  try {
    const {
      projectName,
      description,
      deadline,
    } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Check team
    const team = await Team.findById(project.teamID);

    if (!team) {
      return res.status(404).json({
        message: "Associated team not found",
      });
    }

    // Check membership
    const isMember = team.members.some(
      (memberId) => memberId.toString() === req.user.userId
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this team",
      });
    }

    // Update only supplied fields
    if (projectName !== undefined) {
      if (!projectName.trim()) {
        return res.status(400).json({
          message: "Project name cannot be empty",
        });
      }

      project.projectName = projectName.trim();
    }

    if (description !== undefined) {
      project.description = description.trim();
    }

    if (deadline !== undefined) {
      project.deadline = deadline;
    }

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate("teamID", "teamName")
      .populate("createdBy", "name email role");

    res.status(200).json({
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Update project error:", error.message);

    res.status(500).json({
      message: "Server error while updating project",
    });
  }
};


// ==================== DELETE PROJECT ====================

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Check team
    const team = await Team.findById(project.teamID);

    if (!team) {
      return res.status(404).json({
        message: "Associated team not found",
      });
    }

    // Only project creator can delete it
    if (project.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Only the project creator can delete this project",
      });
    }

    await Project.findByIdAndDelete(project._id);

    res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error.message);

    res.status(500).json({
      message: "Server error while deleting project",
    });
  }
};


module.exports = {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
};