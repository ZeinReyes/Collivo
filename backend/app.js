import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());

// ==========================
// 📦 Import route files
// ==========================
import userRoute from "./src/routes/userRoutes.js";
import authRoute from "./src/routes/authRoutes.js";
import contactRoute from "./src/routes/contactRoutes.js";
import projectRoute from "./src/routes/projectRoutes.js"; // ✅ NEW
import inviteRoutes from "./src/routes/inviteRoutes.js";

// ==========================
// 🧭 Use routes
// ==========================
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/contact", contactRoute);
app.use("/api/projects", projectRoute); // ✅ NEW
app.use("/api/invites", inviteRoutes);

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
