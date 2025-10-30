import Invite from "../models/inviteModel.js";
import Project from "../models/projectModel.js";
import User from "../models/userModel.js";
import nodemailer from "nodemailer";

// ---------------- Send Project Invite ----------------
export const inviteMember = async (req, res) => {
  try {
    const { projectId, recipientEmail } = req.body;
    const senderId = req.user?._id;

    if (!senderId) return res.status(401).json({ message: "Unauthorized" });
    if (!projectId || !recipientEmail)
      return res.status(400).json({ message: "Project ID and recipient email are required." });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.createdBy.toString() !== senderId.toString())
      return res.status(403).json({ message: "Only the creator can send invites" });

    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) return res.status(404).json({ message: "Recipient not found" });

    const existingInvite = await Invite.findOne({
      project: projectId,
      recipient: recipient._id,
      status: "Pending",
    });
    if (existingInvite)
      return res.status(400).json({ message: "User already invited" });

    const invite = await Invite.create({
      project: projectId,
      sender: senderId,
      recipient: recipient._id,
      status: "Pending",
    });

    // Send email safely with Accept and Decline links
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const inviteLink = `${process.env.FRONTEND_URL}/project-management/invites/${invite._id}`;

      await transporter.sendMail({
        from: `"Project Invite" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: `You're invited to join project "${project.name}"`,
        html: `
          <h3>You’ve been invited to join "${project.name}"</h3>
          <p>${req.user?.fullName || "Someone"} has invited you to collaborate on this project.</p>
          <p>
            <a href="${inviteLink}" style="padding: 10px 15px; background: #28a745; color: white; text-decoration: none; margin-right: 10px;">
              Accept Invite
            </a>
          </p>
        `,
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Continue without failing the request
    }

    res.status(201).json({ message: "Invite sent successfully", invite });
  } catch (error) {
    console.error("Error sending invite:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Get Invites for Logged-in User ----------------
export const getUserInvites = async (req, res) => {
  try {
    const userId = req.user?._id;
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
    const userId = req.user?._id;

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
      if (!project.members.some((m) => m.toString() === userId.toString())) {
        project.members.push(userId);
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
