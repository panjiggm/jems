import { internalQuery, query } from "../_generated/server";
import { v } from "convex/values";
import { getUserId } from "../schema";

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

// Get all personas (for cron jobs)
export const getAllPersonas = internalQuery({
  args: {},
  handler: async (ctx) => {
    const personas = await ctx.db.query("persona").collect();
    return personas;
  },
});