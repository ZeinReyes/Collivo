import express from "express";
import {
  inviteMember,
  getUserInvites,
  respondToInvite,
  getInviteDetails
} from "../controllers/inviteController.js";
import auth from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Public route (no login required) - used for opening the invite page
router.get("/:inviteId", getInviteDetails);

// ✅ Protected routes
router.get("/", auth, getUserInvites);
router.post("/", auth, inviteMember);

// ❗ CHANGE THIS ROUTE
// Before: router.post("/:inviteId", auth, respondToInvite);
router.post("/:inviteId/respond", auth, respondToInvite);

export default router;
