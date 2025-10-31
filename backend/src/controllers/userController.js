import User from "../models/userModel.js";
import Project from "../models/projectModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// CREATE USER
export const createUser = async (req, res) => {
    try {
        const { fullName, username, email, password } = req.body;

        if (!fullName || !username || !email || !password) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) return res.status(400).json({ error: "Email already exists!" });

        const existingUsername = await User.findOne({ username });
        if (existingUsername) return res.status(400).json({ error: "Username already exists!" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullName,
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        const token = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
            },
            token,
        });
    } catch (err) {
        console.error("Failed creating account:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// UPDATE USER
export const updateUser = async (req, res) => {
    try {
        const { fullName, username, email, password, role } = req.body;
        const { id } = req.params;

        if (!id) return res.status(400).json({ error: "User ID is required" });

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Password hashing (avoid double-hashing)
        if (password && password.trim() !== "") {
            const isAlreadyHashed = password.startsWith("$2b$") || password.startsWith("$2a$");
            user.password = isAlreadyHashed ? password : await bcrypt.hash(password, 10);
        }

        user.fullName = fullName || user.fullName;
        user.username = username || user.username;
        user.email = email || user.email;
        user.role = role || user.role;

        await user.save();

        res.json({ message: "User updated successfully!" });
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// DELETE USER
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: "User ID is required" });

        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ error: "User not found!" });

        res.json({ message: "User deleted successfully!" });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// GET ALL USERS
export const getAllUser = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// GET USER BY ID
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: "User ID is required" });

        const user = await User.findById(id).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json(user);
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ error: "Server error" });
    }
};

export const searchUsers = async (req, res) => {
  try {
    const { query, projectId } = req.query;

    if (!query) return res.status(200).json([]);

    let excludedUserIds = [];

    // 🧩 Exclude members & creator of the project if projectId is provided
    if (projectId) {
      const project = await Project.findById(projectId).select("members createdBy");
      if (project) {
        excludedUserIds = [
          project.createdBy.toString(),
          ...project.members.map((id) => id.toString()),
        ];
      }
    }

    // 🔍 Search users not in excludedUserIds
    const users = await User.find({
      _id: { $nin: excludedUserIds },
      $or: [
        { fullName: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    })
      .limit(10)
      .select("fullName username email");

    res.status(200).json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};