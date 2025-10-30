import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  inviteMember,
  getUserInvites,
  respondToInvite,
} from "../controllers/inviteController.js";

const router = express.Router();

// Send invite
router.post("/", protect, inviteMember);

// Get user's invites
router.get("/", protect, getUserInvites);

// Accept or decline invite
router.post("/:inviteId", protect, respondToInvite);

export default router;
