import { Router } from "express";
import Ticket from "../models/Ticket.js";
import DraftReply from "../models/DraftReply.js";
import { protect } from "../middleware/auth.js";
import { searchRelevantArticles } from "../utils/searchKB.js";
import { generateDraft } from "../utils/aiDraft.js";

const fallbackMessage = "No matching knowledge-base articles were found for this question. Please draft a reply manually.";

const router = Router();

router.use(protect);

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    const tickets = await Ticket.find(filter)
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { customerName, customerEmail, subject, message, assignedTo } = req.body;
    if (!customerName || !customerEmail || !subject || !message) {
      return res.status(400).json({ message: "customerName, customerEmail, subject, and message are required" });
    }
    const ticket = await Ticket.create({ customerName, customerEmail, subject, message, assignedTo });
    res.status(201).json({ ticket });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate("assignedTo", "name email");
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    const draft = await DraftReply.findOne({ ticket: ticket._id }).populate("sourceArticles");
    res.json({ ticket, draft });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const allowed = ["status", "assignedTo"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate("assignedTo", "name email");
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json({ ticket });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/draft", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const query = `${ticket.subject} ${ticket.message}`;
    const truncated = query.length > 2000 ? query.slice(0, 2000) : query;

    const articles = await searchRelevantArticles(truncated);
    const result = articles.length
      ? await generateDraft(truncated, articles)
      : { text: fallbackMessage, sourceIds: [] };

    const draft = await DraftReply.findOneAndUpdate(
      { ticket: ticket._id },
      {
        ticket: ticket._id,
        generatedText: result.text,
        editedText: result.text,
        sourceArticles: result.sourceIds,
        createdBy: req.user._id,
        status: "draft",
      },
      { upsert: true, new: true }
    ).populate("sourceArticles");

    res.json({ draft });
  } catch (err) {
    console.error("Draft error:", err);
    res.status(500).json({ message: "AI draft generation failed. Please try again." });
  }
});

router.post("/:id/manual-draft", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Reply text is required" });

    const draft = await DraftReply.findOneAndUpdate(
      { ticket: ticket._id },
      {
        ticket: ticket._id,
        generatedText: "",
        editedText: text,
        sourceArticles: [],
        createdBy: req.user._id,
        status: "draft",
      },
      { upsert: true, new: true }
    );

    res.json({ draft });
  } catch (err) {
    console.error("Manual draft error:", err);
    res.status(500).json({ message: "Failed to save reply" });
  }
});

export default router;
