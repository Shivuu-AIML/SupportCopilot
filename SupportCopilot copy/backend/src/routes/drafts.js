import { Router } from "express";
import DraftReply from "../models/DraftReply.js";
import Ticket from "../models/Ticket.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.patch("/:id", async (req, res) => {
  try {
    const { editedText, status } = req.body;
    const draft = await DraftReply.findById(req.params.id);
    if (!draft) return res.status(404).json({ message: "Draft not found" });

    if (editedText !== undefined) draft.editedText = editedText;
    if (status) draft.status = status;
    await draft.save();

    if (status === "sent") {
      await Ticket.findByIdAndUpdate(draft.ticket, { status: "resolved" });
    }

    res.json({ draft });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
