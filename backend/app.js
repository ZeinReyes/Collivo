import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
const uploadDir = path.join(process.cwd(), "src", "uploads");
app.use("/uploads", express.static(uploadDir));

// ==========================
// 📦 Import route files
// ==========================
import userRoute from "./src/routes/userRoutes.js";
import authRoute from "./src/routes/authRoutes.js";
import contactRoute from "./src/routes/contactRoutes.js";
import projectRoute from "./src/routes/projectRoutes.js";
import inviteRoutes from "./src/routes/inviteRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js"; // ✅ ADD THIS

// ==========================
// 🧭 Use routes
// ==========================
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/contact", contactRoute);
app.use("/api/projects", projectRoute);
app.use("/api/invites", inviteRoutes);
app.use("/api/tasks", taskRoutes); // ✅ ADD THIS

// ==========================
// 🗄️ Connect MongoDB
// ==========================
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ==========================
// 🚀 Start server
// ==========================
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
