import { Router } from "express";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import KBArticle from "../models/KBArticle.js";
import DraftReply from "../models/DraftReply.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

router.use(protect, adminOnly);

router.get("/stats", async (req, res) => {
  try {
    const [totalTickets, openTickets, resolvedTickets, totalUsers, totalArticles, drafts] =
      await Promise.all([
        Ticket.countDocuments(),
        Ticket.countDocuments({ status: "open" }),
        Ticket.countDocuments({ status: "resolved" }),
        User.countDocuments(),
        KBArticle.countDocuments(),
        DraftReply.find({ status: "sent" }).populate("ticket", "createdAt updatedAt"),
      ]);

    const avgTime = drafts.reduce((sum, d) => {
      if (d.ticket) {
        const diff = new Date(d.updatedAt) - new Date(d.ticket.createdAt);
        return sum + diff;
      }
      return sum;
    }, 0);

    const avgTimeHours = drafts.length ? (avgTime / drafts.length / 3600000).toFixed(1) : null;

    res.json({
      stats: {
        totalTickets,
        openTickets,
        resolvedTickets,
        totalUsers,
        totalArticles,
        totalDraftsSent: drafts.length,
        avgTimeToResolveHours: avgTimeHours,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
