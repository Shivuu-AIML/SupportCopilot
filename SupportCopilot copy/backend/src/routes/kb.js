import { Router } from "express";
import KBArticle from "../models/KBArticle.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    if (req.query.tag) {
      filter.tags = { $in: [req.query.tag.toLowerCase()] };
    }
    const articles = await KBArticle.find(filter)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.json({ articles });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, body, tags } = req.body;
    if (!title || !body) {
      return res.status(400).json({ message: "Title and body are required" });
    }
    const article = await KBArticle.create({
      title,
      body,
      tags: tags || [],
      createdBy: req.user._id,
    });
    res.status(201).json({ article });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const article = await KBArticle.findById(req.params.id).populate("createdBy", "name");
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json({ article });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const allowed = ["title", "body", "tags"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const article = await KBArticle.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate("createdBy", "name");
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json({ article });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const article = await KBArticle.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json({ message: "Article deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
