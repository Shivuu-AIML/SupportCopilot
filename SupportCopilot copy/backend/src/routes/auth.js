import { Router } from "express";
import User from "../models/User.js";
import { generateToken } from "../utils/token.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

router.post("/register", authLimiter, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }
    const userRole = role === "admin" ? "admin" : "agent";
    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role: userRole,
    });
    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "Account deactivated" });
    }
    const token = generateToken(user);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

router.get("/users", protect, adminOnly, async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ users });
});

router.patch("/users/:id/deactivate", protect, adminOnly, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.isActive = req.body.isActive ?? false;
  await user.save();
  res.json({ user });
});

export default router;
