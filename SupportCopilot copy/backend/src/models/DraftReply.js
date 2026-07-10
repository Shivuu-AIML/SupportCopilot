import mongoose from "mongoose";

const draftReplySchema = new mongoose.Schema(
  {
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true, unique: true },
    generatedText: { type: String, default: "" },
    editedText: { type: String, default: "" },
    sourceArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: "KBArticle" }],
    status: { type: String, enum: ["draft", "sent"], default: "draft" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("DraftReply", draftReplySchema);
