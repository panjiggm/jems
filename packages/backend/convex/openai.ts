import { OpenAI } from "openai";
import {
  action,
  internalAction,
  internalMutation,
  query,
} from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { missingEnvVariableUrl } from "./utils";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
  baseURL: "https://api.lunos.tech/v1",
});

export const openaiKeySet = query({
  args: {},
  handler: async () => {
    return !!process.env.OPENAI_API_KEY;
  },
});

export const summary = internalAction({
  args: {
    id: v.id("notes"),
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, { id, title, content }) => {
    console.log("summary args: ", { id, title, content });
    const prompt = `Take in the following note and return a summary: Title: ${title}, Note content: ${content}`;

    const output = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant designed to output JSON in this format: {summary: string}",
        },
        { role: "user", content: prompt },
      ],
      model: "openai/gpt-5-nano",
      response_format: { type: "json_object" },
    });

    // Pull the message content out of the response
    const messageContent = output.choices[0]?.message.content;

    console.log({ messageContent });

    const parsedOutput = JSON.parse(messageContent!);
    console.log({ parsedOutput });

    await ctx.runMutation(internal.openai.saveSummary, {
      id: id,
      summary: parsedOutput.summary,
    });
  },
});

export const saveSummary = internalMutation({
  args: {
    id: v.id("notes"),
    summary: v.string(),
  },
  handler: async (ctx, { id, summary }) => {
    await ctx.db.patch(id, {
      summary: summary,
    });
  },
});

// Generate AI prompt for persona
export const generatePersonaPrompt = internalAction({
  args: {
    bio: v.string(),
    tone: v.string(),
    niches: v.array(
      v.object({
        label: v.string(),
        category: v.string(),
        description: v.string(),
      }),
    ),
  },
  handler: async (ctx, { bio, tone, niches }) => {
    const apiKey = process.env.OPENAI_API_KEY as string;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const nicheDetails = niches
      .map(
        (niche) => `${niche.label} (${niche.category}): ${niche.description}`,
      )
      .join("\n");

    const prompt = `Create a comprehensive AI persona prompt based on this user profile:

Bio: ${bio}

Tone preference: ${tone}

Areas of expertise/interest:
${nicheDetails}

Generate a detailed AI persona prompt that will help an AI assistant:
1. Understand this person's background and expertise
2. Match their communication style and tone
3. Provide relevant advice and insights for their niches
4. Be helpful in their specific areas of interest

The prompt should be comprehensive (200-400 words) and include:
- Their professional background and expertise
- Their communication style and preferred tone
- Their specific interests and focus areas
- How the AI should interact with them
- What kind of responses would be most valuable

Write this as a system prompt that will be used to instruct an AI assistant.`;

    const output = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert at creating AI persona prompts that help AI assistants provide personalized and relevant responses.",
        },
        { role: "user", content: prompt },
      ],
      model: "openai/gpt-5-nano",
      max_tokens: 600,
      temperature: 0.7,
    });

    const aiPrompt = output.choices[0]?.message.content?.trim();
    return aiPrompt || "";
  },
});

// Public action to generate bio (direct call, not scheduled)
export const generateBioAction = action({
  args: {
    categories: v.array(v.string()),
    nicheIds: v.array(v.id("niches")),
  },
  handler: async (ctx, args): Promise<string> => {
    // Get niche names for better context
    const nicheNames =
      args.nicheIds.length > 0
        ? await Promise.all(
            args.nicheIds.map((id) =>
              ctx.runQuery(internal.niches.getInternalNicheById, { id }),
            ),
          ).then((niches) =>
            niches
              .filter(Boolean)
              .map((n: any) => n.label)
              .join(", "),
          )
        : "";

    console.log("nicheNames: ", nicheNames);

    const prompt = `This is my categories: ${args.categories.join(", ")} and 
${nicheNames ? ` niches: ${nicheNames}` : ""}. in Social Media`;

    const output = await openai.chat.completions.create({
      messages: [
        {
          role: "system" as const,
          content:
            "You are a helpful bio writer. Create a bio for a social media profile. Max 500 characters.",
        },
        { role: "user" as const, content: prompt },
      ],
      model: "gpt-5-nano",
    });

    const messageContent = output.choices[0]?.message.content?.trim();
    return messageContent || "Unable to generate bio at this time.";
  },
});
