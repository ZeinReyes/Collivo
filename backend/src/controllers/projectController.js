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

    // Creator is always Owner
    const projectMembers = [
      {
        user: userId,
        role: "Owner",
      }
    ];

    // Add other members if provided
    if (members && Array.isArray(members)) {
      members.forEach(member => {
        // Don't add creator twice
        if (member.userId?.toString() !== userId.toString()) {
          projectMembers.push({
            user: member.userId || member.user,
            role: member.role || "Member",
          });
        }
      });
    }

    const project = await Project.create({
      name,
      description,
      dueDate,
      priority: priority || "Medium",
      createdBy: userId,
      members: projectMembers,
    });

    await project.populate("members.user", "fullName email username");

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

    const projects = await Project.find({ "members.user": userId })
      .populate("createdBy", "fullName email username")
      .populate("members.user", "fullName email username");

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
      .populate("createdBy", "fullName email username")
      .populate("members.user", "fullName email username");

    if (!project) return res.status(404).json({ message: "Project not found." });

    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Ensure user is a member
    if (!project.members.some((m) => m.user._id.toString() === userId.toString())) {
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

    // Only creator or Admin can update
    const userMember = project.members.find(m => m.user.toString() === userId.toString());
    if (!userMember || (userMember.role !== "Owner" && userMember.role !== "Admin")) {
      return res.status(403).json({ message: "Only Owner or Admin can update this project." });
    }

    project.name = name || project.name;
    project.description = description || project.description;
    project.dueDate = dueDate || project.dueDate;
    project.status = status || project.status;
    project.priority = priority || project.priority;

    // ✅ Update members if provided (only Owner can do this)
    if (members && Array.isArray(members)) {
      if (userMember.role !== "Owner") {
        return res.status(403).json({ message: "Only Owner can modify members." });
      }

      const updatedMembers = members.map(member => ({
        user: member.userId || member.user,
        role: member.role || "Member",
      }));

      // Ensure creator stays as Owner
      const ownerExists = updatedMembers.some(m => m.user.toString() === userId.toString());
      if (!ownerExists) {
        updatedMembers.push({
          user: userId,
          role: "Owner",
        });
      }

      project.members = updatedMembers;
    }

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate("createdBy", "fullName email username")
      .populate("members.user", "fullName email username");

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
    const { userId: newUserId, role } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found." });

    const currentUserId = req.user?._id;
    const userMember = project.members.find(m => m.user.toString() === currentUserId.toString());

    // Only Owner or Admin can add members
    if (!userMember || (userMember.role !== "Owner" && userMember.role !== "Admin")) {
      return res.status(403).json({ message: "Only Owner or Admin can add members." });
    }

    if (project.members.some((m) => m.user.toString() === newUserId.toString())) {
      return res.status(400).json({ message: "User is already a member." });
    }

    project.members.push({
      user: newUserId.toString(),
      role: role || "Member",
    });
    
    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate("members.user", "fullName email username");
    
    res.status(200).json({ 
      message: "Member added successfully.", 
      project: populatedProject 
    });
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
    const { userId: removeUserId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found." });

    const currentUserId = req.user?._id;
    const userMember = project.members.find(m => m.user.toString() === currentUserId.toString());

    // Only Owner or Admin can remove members
    if (!userMember || (userMember.role !== "Owner" && userMember.role !== "Admin")) {
      return res.status(403).json({ message: "Only Owner or Admin can remove members." });
    }

    // Cannot remove the Owner
    const memberToRemove = project.members.find(m => m.user.toString() === removeUserId.toString());
    if (memberToRemove?.role === "Owner") {
      return res.status(400).json({ message: "Cannot remove the Owner." });
    }

    project.members = project.members.filter((m) => m.user.toString() !== removeUserId.toString());
    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate("members.user", "fullName email username");
    
    res.status(200).json({ 
      message: "Member removed successfully.", 
      project: populatedProject 
    });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const updateMemberRole = async (req, res) => {
  try {
    const { id } = req.params; // projectId
    const { memberId, role } = req.body;
    const userId = req.user._id || req.user.id;

    console.log("📘 updateMemberRole request received:");
    console.log("➡ projectId:", id);
    console.log("➡ memberId:", memberId);
    console.log("➡ new role:", role);
    console.log("➡ current user:", userId);

    const project = await Project.findById(id).populate("members.user", "email fullName");
    if (!project) return res.status(404).json({ message: "Project not found" });
    console.log("✅ Found project:", project.title || "N/A");

    // 🧠 Detect owner
    const ownerId =
      project.owner?._id ||
      project.owner ||
      project.createdBy?._id ||
      project.createdBy ||
      (project.members.find((m) => (m.role || "").toLowerCase() === "owner")?.user?._id ??
        project.members.find((m) => (m.role || "").toLowerCase() === "owner")?.user);

    console.log("👑 Project owner:", ownerId);

    // 🔍 Determine current user’s role
    const currentUserMember = project.members.find(
      (m) => String(m.user?._id || m.user) === String(userId)
    );
    const currentUserRole =
      String(ownerId) === String(userId)
        ? "Owner"
        : currentUserMember?.role || "Member";

    console.log("🧩 Current user role:", currentUserRole);

    // 🔒 Permission check
    if (currentUserRole !== "Owner" && currentUserRole !== "Admin") {
      console.log("🚫 Unauthorized: Only Owner or Admin can update roles");
      return res.status(403).json({ message: "Only Owner or Admin can update roles" });
    }

    // 🛠 Update target member
    const memberToUpdate = project.members.find(
      (m) => String(m.user?._id || m.user) === String(memberId)
    );
    if (!memberToUpdate) {
      return res.status(404).json({ message: "Member not found in project" });
    }

    memberToUpdate.role = role;
    await project.save();

    console.log("✅ Role updated successfully");
    res.json({ message: "Role updated successfully", project });
  } catch (error) {
    console.error("❌ Error in updateMemberRole:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};