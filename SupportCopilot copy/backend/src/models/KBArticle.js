import mongoose from "mongoose";

const kbArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

kbArticleSchema.index({ title: "text", body: "text", tags: "text" });

export default mongoose.model("KBArticle", kbArticleSchema);
