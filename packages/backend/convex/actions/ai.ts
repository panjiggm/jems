"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

export const generateIdeas = action({
  args: {
    topic: v.string(),
    count: v.optional(v.number()),
  },
  handler: async (ctx, { topic, count = 10 }) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Generate ${count} short content ideas about: ${topic}`,
          },
        ],
        temperature: 0.7,
      }),
    });
    const data = await res.json();
    return data;
  },
});
