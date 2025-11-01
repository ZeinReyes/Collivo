import Task from "../models/taskModel.js";
import Project from "../models/projectModel.js";
import User from "../models/userModel.js";

// ======================
// 📌 Create a task
// ======================
export const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, dueDate, priority } = req.body;
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found." });

    // Only Owner/Admin can create tasks
    const currentUserMember = project.members.find((m) => m.user.toString() === userId.toString());
    if (!currentUserMember || !["Owner", "Admin"].includes(currentUserMember.role)) {
      return res.status(403).json({ message: "Only Owner/Admin can create tasks." });
    }

    // Normalize assignedTo: ensure user IDs are ObjectId strings
    const taskAssignedTo = (assignedTo || []).map((u) => {
      if (typeof u === "string") return { user: u, role: "Member" };
      if (u.userId) return { user: u.userId, role: u.role || "Member" };
      if (u.user) return { user: u.user, role: u.role || "Member" };
      return null;
    }).filter(Boolean);

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: taskAssignedTo,
      dueDate,
      priority: priority || "Medium",
      createdBy: userId,
    });

    await task.populate("assignedTo.user", "fullName email username");

    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// ======================
// 📂 Get tasks for a project
// ======================
export const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found." });

    if (!project.members.some((m) => m.user.toString() === userId.toString())) {
      return res.status(403).json({ message: "Access denied." });
    }

    const tasks = await Task.find({ project: projectId })
      .populate("assignedTo.user", "fullName email username")
      .populate("submissions.user", "fullName email username"); // ✅ ADD THIS

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// ======================
// ✏️ Update a task
// ======================
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params; // taskId
    const { title, description, assignedTo, dueDate, priority, status } = req.body;
    const userId = req.user?._id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found." });

    const project = await Project.findById(task.project);
    const currentUserMember = project.members.find((m) => m.user.toString() === userId.toString());

    // Role permissions
    const isOwner = currentUserMember?.role === "Owner";
    const isAdmin = currentUserMember?.role === "Admin";
    const isAssignedMember = task.assignedTo.some((a) => a.user.toString() === userId.toString());

    if (!isOwner && !isAdmin && !isAssignedMember) {
      return res.status(403).json({ message: "Not authorized to update task." });
    }

    if (title) task.title = title;
    if (description) task.description = description;
    if (dueDate) task.dueDate = dueDate;
    if (priority) task.priority = priority;

    // Only Owner/Admin can update assigned members
    if (assignedTo && (isOwner || isAdmin)) {
      const taskAssignedTo = assignedTo.map((u) => {
        if (typeof u === "string") return { user: u, role: "Member" };
        if (u.userId) return { user: u.userId, role: u.role || "Member" };
        if (u.user) return { user: u.user, role: u.role || "Member" };
        return null;
      }).filter(Boolean);
      task.assignedTo = taskAssignedTo;
    }

    // Status updates
    if (status) {
      if (isAssignedMember || isOwner || isAdmin) {
        if (["To Do", "In Progress", "Subject for Approval"].includes(status)) {
          task.status = status;
          if (status === "Subject for Approval") task.completedAt = new Date();
        }
      }
    }

    await task.save();
    await task.populate("assignedTo.user", "fullName email username");

    res.status(200).json({ message: "Task updated successfully", task });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// ======================
// ❌ Delete task
// ======================
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found." });

    const project = await Project.findById(task.project);
    const currentUserMember = project.members.find((m) => m.user.toString() === userId.toString());

    if (!currentUserMember || currentUserMember.role !== "Owner") {
      return res.status(403).json({ message: "Only Owner can delete tasks." });
    }

    await task.deleteOne();
    res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const submitTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found." });

    const isAssignedMember = task.assignedTo.some(
      (a) => a.user.toString() === userId.toString()
    );
    if (!isAssignedMember)
      return res
        .status(403)
        .json({ message: "Only assigned members can submit." });

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one attachment is required." });
    }

    // Format uploaded files
    const uploadedFiles = req.files.map((file) => ({
      filename: file.originalname,
      url: `/uploads/${file.filename}`,
      uploadedAt: new Date(),
    }));

    // Push new submission to submissions array
    task.submissions.push({
      user: userId,
      notes: req.body.notes || "",
      attachments: uploadedFiles,
      createdAt: new Date(),
    });

    // Update task status
    task.status = "Subject for Approval";
    task.completedAt = new Date();

    await task.save();
    
    // Populate both assignedTo AND submissions
    await task.populate("assignedTo.user", "fullName email username");
    await task.populate("submissions.user", "fullName email username"); // ✅ ADD THIS

    res
      .status(200)
      .json({ message: "Task submitted successfully.", task });
  } catch (error) {
    console.error("Error submitting task:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// ======================
// ✅ Approve task
// ======================
export const approveTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found." });

    const project = await Project.findById(task.project);
    const currentUserMember = project.members.find(
      (m) => m.user.toString() === userId.toString()
    );
    const isOwner = currentUserMember?.role === "Owner";
    const isAdmin = currentUserMember?.role === "Admin";

    // ✅ FIXED CONDITION
    if (!isOwner && !isAdmin)
      return res.status(403).json({ message: "Only Owner or Admin can approve tasks." });

    task.status = "Approved";
    task.approvedBy = userId;

    await task.save();
    await task.populate("assignedTo.user", "fullName email username");
    await task.populate("submissions.user", "fullName email username");
    await task.populate("comments.user", "fullName email username");

    res.status(200).json({ message: "Task approved successfully.", task });
  } catch (error) {
    console.error("Error approving task:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// ======================
// 💬 Add comment
// ======================
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user?._id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found." });

    task.comments.push({ user: userId, message });
    await task.save();

    await task.populate("assignedTo.user", "fullName email username");
    await task.populate("comments.user", "fullName email username"); // ✅ ADD THIS
    await task.populate("submissions.user", "fullName email username"); // ✅ ADD THIS
    
    res.status(200).json({ message: "Comment added successfully", task });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Server error." });
  }
};