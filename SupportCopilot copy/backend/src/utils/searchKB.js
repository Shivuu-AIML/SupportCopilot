import KBArticle from "../models/KBArticle.js";

export async function searchRelevantArticles(query, limit = 5) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const terms = trimmed.replace(/[^a-zA-Z0-9 ]/g, "").split(/\s+/).filter(Boolean).join(" ");

  const results = await KBArticle.find(
    { $text: { $search: terms } },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(limit);

  return results;
}
