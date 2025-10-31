import Project from "../models/projectModel.js";
import User from "../models/userModel.js";
import Invite from "../models/inviteModel.js";

// ======================
// 📌 Create a new project
// ======================
export const createProject = async (req, res) => {
  try {
    const { name, description, dueDate, members, priority } = req.body;

    if (!name || !dueDate) {
      return res.status(400).json({ message: "Project name and due date are required." });
    }

    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const allMembers = members
      ? [...new Set([...members.map(String), userId.toString()])]
      : [userId.toString()];

    const project = await Project.create({
      name,
      description,
      dueDate,
      priority: priority || "Medium",
      createdBy: userId,
      members: allMembers,
    });

    res.status(201).json({
      message: "Project created successfully.",
      project,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// ===========================
// 📂 Get all projects for user
// ===========================
export const getProjects = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const projects = await Project.find({ members: userId })
      .populate("createdBy", "fullName email")
      .populate("members", "fullName email");

    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// ==========================
// 📁 Get a single project
// ==========================
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "fullName email")
      .populate("members", "fullName email");

    if (!project) return res.status(404).json({ message: "Project not found." });

    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Ensure user is a member
    if (!project.members.some((m) => m._id.toString() === userId.toString())) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// ======================
// ✏️ Update a project
// ======================
export const updateProject = async (req, res) => {
  try {
    const { name, description, dueDate, status, priority, members } = req.body;
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found." });

    // Only creator can update
    if (project.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the creator can update this project." });
    }

    project.name = name || project.name;
    project.description = description || project.description;
    project.dueDate = dueDate || project.dueDate;
    project.status = status || project.status;
    project.priority = priority || project.priority;

    // ✅ Update members if provided
    if (members && Array.isArray(members)) {
      const allMembers = [...new Set([...members.map(String), userId.toString()])];
      project.members = allMembers;
    }

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate("createdBy", "fullName email")
      .populate("members", "fullName email");

    res.status(200).json({
      message: "Project updated successfully.",
      project: populatedProject,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// ======================
// ❌ Delete a project
// ======================
export const deleteProject = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found." });

    if (project.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the creator can delete this project." });
    }

    // Delete all invites related to this project
    await Invite.deleteMany({ project: req.params.id });

    // Delete the project
    await project.deleteOne();
    
    res.status(200).json({ message: "Project and related invites deleted successfully." });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// ======================
// 👥 Add a member
// ======================
export const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found." });

    if (project.createdBy.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: "Only the creator can add members." });
    }

    if (project.members.some((m) => m.toString() === userId.toString())) {
      return res.status(400).json({ message: "User is already a member." });
    }

    project.members.push(userId.toString());
    await project.save();

    const populatedProject = await Project.findById(project._id).populate("members", "fullName email");
    res.status(200).json({ message: "Member added successfully.", project: populatedProject });
  } catch (error) {
    console.error("Error adding member:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// ======================
// 🚫 Remove a member
// ======================
export const removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found." });

    if (project.createdBy.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: "Only the creator can remove members." });
    }

    project.members = project.members.filter((m) => m.toString() !== userId.toString());
    await project.save();

    const populatedProject = await Project.findById(project._id).populate("members", "fullName email");
    res.status(200).json({ message: "Member removed successfully.", project: populatedProject });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ message: "Server error." });
  }
};