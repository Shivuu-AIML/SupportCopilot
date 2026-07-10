import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { apiLimiter } from "./middleware/rateLimit.js";
import authRoutes from "./routes/auth.js";
import ticketRoutes from "./routes/tickets.js";
import kbRoutes from "./routes/kb.js";
import draftRoutes from "./routes/drafts.js";
import adminRoutes from "./routes/admin.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/kb", kbRoutes);
app.use("/api/drafts", draftRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
}

start();
