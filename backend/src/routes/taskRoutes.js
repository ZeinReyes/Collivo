import express from "express";
import {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
  approveTask
} from "../controllers/taskController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// CRUD Routes
router.post("/", protect, createTask);
router.get("/", protect, getTasksByProject); // /tasks?projectId=xxx
router.get("/:id", protect, getTaskById);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

// Approval route
router.put("/:id/approve", protect, approveTask);

export default router;