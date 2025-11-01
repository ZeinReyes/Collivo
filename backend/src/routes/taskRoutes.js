import express from "express";
import {
  createTask,
  getTasksByProject,
  updateTask,
  deleteTask,
  submitTask,
  approveTask,
  addComment,
} from "../controllers/taskController.js";
import { protect } from "../middlewares/authMiddleware.js"; // your auth middleware
import { upload } from "../middlewares/upload.js"; // Multer middleware

const router = express.Router();

// ======================
// Routes for tasks
// ======================

// Create a task (Owner/Admin)
router.post("/", protect, createTask);

// Get all tasks for a project
router.get("/project/:projectId", protect, getTasksByProject);

// Update a task (Owner/Admin can edit details, assigned member can update status)
router.put("/:id", protect, updateTask);

// Delete a task (Owner only)
router.delete("/:id", protect, deleteTask);

// Submit a task (assigned member) with attachments
// Accept multiple files under field name 'attachments', max 5 files
router.post(
  "/submit/:id",
  protect,
  upload.array("attachments", 5),
  submitTask
);

// Approve a task (Owner only)
router.post("/approve/:id", protect, approveTask);

// Add a comment to a task (any member of project)
router.post("/comment/:id", protect, addComment);

export default router;
