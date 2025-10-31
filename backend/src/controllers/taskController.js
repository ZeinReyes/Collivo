import Task from "../models/taskModel.js";
import Project from "../models/projectModel.js";

// CREATE TASK (any member can propose)
export const createTask = async (req, res) => {
  try {
    const { projectId, title, description, priority, assignees, startDate, dueDate } = req.body;
    const userId = req.user._id;

    const newTask = new Task({
      projectId,
      title,
      description,
      priority,
      assignees,
      startDate,
      dueDate,
      createdBy: userId,
      status: "Proposed", // always start as Proposed
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ message: "Failed to create task" });
  }
};

// GET TASKS BY PROJECT
export const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ message: "projectId is required" });

    const tasks = await Task.find({ projectId })
      .populate("createdBy", "fullName email")
      .populate("assignees", "fullName email")
      .populate("approvedBy", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

// GET SINGLE TASK
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("createdBy", "fullName email")
      .populate("assignees", "fullName email")
      .populate("approvedBy", "fullName email");

    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json(task);
  } catch (err) {
    console.error("Error fetching task:", err);
    res.status(500).json({ message: "Failed to fetch task" });
  }
};

// UPDATE TASK (members can update proposed tasks; owner/admin can update any)
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const userId = req.user._id;
    const project = await Project.findById(task.projectId);

    const isOwnerOrAdmin =
      project.createdBy.toString() === userId.toString() ||
      project.members.some((m) => m.user.toString() === userId.toString() && ["Admin"].includes(m.role));

    // Members can only update tasks they created if still Proposed
    if (!isOwnerOrAdmin && task.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to update this task" });
    }

    const { title, description, priority, assignees, startDate, dueDate, status } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (assignees !== undefined) task.assignees = assignees;
    if (startDate !== undefined) task.startDate = startDate;
    if (dueDate !== undefined) task.dueDate = dueDate;

    // Only owner/admin can approve/reject
    if (status && isOwnerOrAdmin) {
      task.status = status;
      if (["To Do", "In Progress", "Completed"].includes(status)) {
        task.approvedBy = userId;
      }
    }

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ message: "Failed to update task" });
  }
};

// DELETE TASK
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const userId = req.user._id;
    const project = await Project.findById(task.projectId);

    const isOwner =
      project.createdBy.toString() === userId.toString();

    if (!isOwner) return res.status(403).json({ message: "Only owner can delete task" });

    await task.remove();
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ message: "Failed to delete task" });
  }
};

// APPROVE / REJECT TASK (Owner/Admin)
export const approveTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const { status } = req.body; // To Do / In Progress / Completed / Rejected
    const userId = req.user._id;
    const project = await Project.findById(task.projectId);

    const isOwnerOrAdmin =
      project.createdBy.toString() === userId.toString() ||
      project.members.some((m) => m.user.toString() === userId.toString() && ["Admin"].includes(m.role));

    if (!isOwnerOrAdmin) return res.status(403).json({ message: "Not authorized to approve/reject task" });

    if (!["To Do", "In Progress", "Completed", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    task.status = status;
    task.approvedBy = userId;

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (err) {
    console.error("Error approving task:", err);
    res.status(500).json({ message: "Failed to approve task" });
  }
};
