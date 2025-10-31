import Invite from "../models/inviteModel.js";
import Project from "../models/projectModel.js";
import User from "../models/userModel.js";
import nodemailer from "nodemailer";

// ---------------- Send Project Invite ----------------
export const inviteMember = async (req, res) => {
  try {
    const { projectId, recipientEmail, role } = req.body;
    const senderId = req.user?._id || req.user?.id;

    if (!senderId) return res.status(401).json({ message: "Unauthorized" });
    if (!projectId || !recipientEmail)
      return res.status(400).json({ message: "Project ID and email required." });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.createdBy.toString() !== senderId.toString())
      return res.status(403).json({ message: "Only project owner can invite." });

    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) return res.status(404).json({ message: "User not found" });

    const invite = await Invite.create({
      project: projectId,
      sender: senderId,
      recipient: recipient._id,
      role: role || "Member",
      status: "Pending",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const inviteLink = `${process.env.FRONTEND_URL}/project-management/invites/${invite._id}`;

    await transporter.sendMail({
      from: `"Project Invite" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `You're invited to join "${project.name}" as ${role}`,
      html: `
        <h3>You've been invited to join <strong>${project.name}</strong></h3>
        <p>You are invited as a <strong>${role}</strong>.</p>
        <a href="${inviteLink}" style="padding: 10px 15px; background: #28a745; color: white; text-decoration: none;">
          View Invitation
        </a>
      `,
    });

    res.status(201).json({ message: "Invite sent", invite });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Get Invites for Logged-in User ----------------
export const getUserInvites = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const invites = await Invite.find({ recipient: userId })
      .populate("project", "name description createdBy")
      .populate("sender", "fullName email");

    res.status(200).json(invites);
  } catch (error) {
    console.error("Error fetching invites:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Accept or Decline Invite ----------------
export const respondToInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const { action } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!["accept", "decline"].includes(action))
      return res.status(400).json({ message: "Action must be 'accept' or 'decline'" });

    const invite = await Invite.findById(inviteId).populate("project");
    if (!invite) return res.status(404).json({ message: "Invite not found" });

    if (invite.recipient.toString() !== userId.toString())
      return res.status(403).json({ message: "You can only respond to your own invites" });

    // Update status
    invite.status = action === "accept" ? "Accepted" : "Declined";
    await invite.save();

    if (action === "accept") {
      const project = await Project.findById(invite.project._id);

      // Check if user is already a member
      const alreadyMember = project.members.some(
        (m) => m.user.toString() === userId.toString()
      );

      if (!alreadyMember) {
        project.members.push({
          user: userId,
          role: invite.role || "Member",
          addedAt: new Date(),
        });

        await project.save();
      }

      return res.status(200).json({ message: "Invite accepted", project });
    }


    return res.status(200).json({ message: "Invite declined" });
  } catch (error) {
    console.error("Error responding to invite:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getInviteDetails = async (req, res) => {
  try {
    const { inviteId } = req.params;

    const invite = await Invite.findById(inviteId)
      .populate("project", "name")
      .populate("sender", "fullName email")
      .populate("recipient", "fullName email");

    if (!invite) return res.status(404).json({ message: "Invite not found" });

    return res.status(200).json({
      projectName: invite.project?.name,
      role: invite.role,
      senderName: invite.sender?.fullName,
      recipientName: invite.recipient?.fullName,
      status: invite.status,
    });
  } catch (error) {
    console.error("Error fetching invite:", error);
    res.status(500).json({ message: "Server error" });
  }
};