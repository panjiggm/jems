import { OpenAI } from "openai";
import {
  action,
  internalAction,
  internalMutation,
  query,
} from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
  baseURL: process.env.OPENAI_BASE_URL as string,
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
    const parsedOutput = JSON.parse(messageContent!);

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
    full_name: v.string(),
    bio: v.string(),
    niches: v.array(
      v.object({
        label: v.string(),
        category: v.string(),
      }),
    ),
  },
  handler: async (ctx, { full_name, bio, niches }) => {
    const nicheDetails = niches
      .map((niche) => `${niche.label} - (${niche.category})`)
      .join("\n");

    const prompt = `Create a persona prompt for an AI assistant based on this user profile:

Full Name: ${full_name}

Bio: ${bio}

Niche Details:
${nicheDetails}

Generate a detailed persona prompt that will help an AI assistant understand this person:
1. Help this person to find ideas related to their bio, niches and their category to create content
2. Understand this person's full name, bio and niches
3. Provide relevant advice and insights for their niches and their category

The prompt should be comprehensive and include the following:
- This person is Content Creator
- Their full name
- Their bio
- Their niches and their category
- How the AI should interact with them

Write this as a system prompt that will be used to instruct an AI assistant.`;

    const output = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert at creating AI persona prompts that help AI assistants provide personalized and relevant responses. max 1000 characters",
        },
        { role: "user", content: prompt },
      ],
      model: "gpt-4o-mini",
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

    const prompt = `This is my categories: ${args.categories.join(", ")} and 
${nicheNames ? ` my niches: ${nicheNames}` : ""}`;

    const output = await openai.chat.completions.create({
      messages: [
        {
          role: "system" as const,
          content:
            "You are a helpful bio writer. Create a bio for a profile based on the categories and niches. Max 500 characters.",
        },
        { role: "user" as const, content: prompt },
      ],
      model: "gpt-4o-mini",
      temperature: 0.7,
    });

    const messageContent = output.choices[0]?.message.content?.trim();
    return messageContent || "Unable to generate bio at this time.";
  },
});
