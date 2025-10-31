import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  title: { type: String, required: true },
  description: { type: String },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  status: { 
    type: String, 
    enum: ["Proposed", "To Do", "In Progress", "Completed", "Rejected"], 
    default: "Proposed" 
  },
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  startDate: { type: Date },
  dueDate: { type: Date },
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);
