import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    assignedTo: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["Owner", "Admin", "Member"], default: "Member" },
      },
    ],
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Subject for Approval", "Approved"],
      default: "To Do",
    },
    attachments: [
      {
        filename: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    submissions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        notes: { type: String, default: "" },
        attachments: [
          {
            filename: String,
            url: String,
            uploadedAt: { type: Date, default: Date.now },
          },
        ],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    dueDate: { type: Date },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    completedAt: { type: Date },
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        message: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
