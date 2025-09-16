import { internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUserId } from "./notes";
import { internal } from "./_generated/api";

// Get user persona
export const getPersona = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const persona = await ctx.db
      .query("persona")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    return persona;
  },
});

// Internal version for use in tools
export const getInternalPersona = internalQuery({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    const persona = await ctx.db
      .query("persona")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    return persona;
  },
});

// Create or update persona
export const createPersona = mutation({
  args: {
    nicheIds: v.array(v.id("niches")),
    tone: v.string(),
    bio: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found");

    const existingPersona = await ctx.db
      .query("persona")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existingPersona) {
      // Update existing persona
      await ctx.db.patch(existingPersona._id, {
        nicheIds: args.nicheIds,
        tone: args.tone,
        bio: args.bio,
        ai_prompt: "", // Will be generated later
      });
      return existingPersona._id;
    } else {
      // Create new persona
      const personaId = await ctx.db.insert("persona", {
        userId,
        nicheIds: args.nicheIds,
        tone: args.tone,
        bio: args.bio,
        ai_prompt: "", // Will be generated later
      });
      return personaId;
    }
  },
});

// Generate AI prompt for persona
export const generateAIPrompt = mutation({
  args: {
    personaId: v.id("persona"),
  },
  handler: async (ctx, args) => {
    const persona = await ctx.db.get(args.personaId);
    if (!persona) throw new Error("Persona not found");

    // Get niche details
    const niches = await Promise.all(
      persona.nicheIds.map((id) => ctx.db.get(id)),
    );
    const validNiches = niches.filter(Boolean);

    // Generate AI prompt using OpenAI
    const aiPrompt = await ctx.scheduler.runAfter(
      0,
      internal.openai.generatePersonaPrompt,
      {
        bio: persona.bio,
        tone: persona.tone,
        niches: validNiches.map((niche) => ({
          label: niche.label,
          category: niche.category,
          description: niche.description || "",
        })),
      },
    );

    return aiPrompt;
  },
});

// Update persona with generated AI prompt
export const updateAIPrompt = mutation({
  args: {
    personaId: v.id("persona"),
    aiPrompt: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.personaId, {
      ai_prompt: args.aiPrompt,
    });
    return args.personaId;
  },
});
