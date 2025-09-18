import { internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUserId } from "./schema";

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
        bio: args.bio,
        ai_prompt: "", // Will be generated later
      });
      return existingPersona._id;
    } else {
      // Create new persona
      const personaId = await ctx.db.insert("persona", {
        userId,
        nicheIds: args.nicheIds,
        bio: args.bio,
        ai_prompt: "", // Will be generated later
      });
      return personaId;
    }
  },
});
