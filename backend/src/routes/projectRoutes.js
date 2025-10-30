import express from "express";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from "../controllers/projectController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/user", protect, getProjects);
router.route("/")
  .post(protect, createProject)
  .get(protect, getProjects);

router.route("/:id")
  .get(protect, getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

router.route("/:id/members")
  .post(protect, addMember)
  .delete(protect, removeMember);

export default router;
