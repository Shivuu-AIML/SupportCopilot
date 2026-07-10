import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateDraft(customerMessage, articles) {
  if (!articles.length) {
    return {
      text: "No matching knowledge-base articles were found for this question. Please draft a reply manually.",
      sourceIds: [],
    };
  }

  const context = articles
    .map((a) => `---\nTitle: ${a.title}\nTags: ${a.tags.join(", ")}\n\n${a.body}`)
    .join("\n\n");

  const prompt = `You are a customer support agent. Using ONLY the knowledge-base articles below, draft a helpful reply to the customer's question.

If the articles do not contain enough information to answer the question, say so clearly — do NOT make up an answer.

Knowledge Base Articles:
${context}

Customer Question:
${customerMessage}

Draft Reply:`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 800,
    temperature: 0.3,
  });

  return {
    text: completion.choices[0]?.message?.content || "AI was unable to generate a draft. Please try again.",
    sourceIds: articles.map((a) => a._id),
  };
}
