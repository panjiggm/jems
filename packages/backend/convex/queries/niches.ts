import { internalQuery, query } from "../_generated/server";
import { v } from "convex/values";

// Get all niches grouped by category
export const getNichesByCategory = query({
  args: {},
  handler: async (ctx) => {
    const niches = await ctx.db.query("niches").collect();

    // Group niches by category
    const nichesByCategory = niches.reduce(
      (acc, niche) => {
        if (!acc[niche.category]) {
          acc[niche.category] = [];
        }
        acc[niche.category].push(niche);
        return acc;
      },
      {} as Record<string, typeof niches>,
    );

    return nichesByCategory;
  },
});

// Get unique categories
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const niches = await ctx.db.query("niches").collect();
    const categories = [...new Set(niches.map((niche) => niche.category))];
    return categories.sort();
  },
});

// Get niches by specific categories
export const getNichesByCategories = query({
  args: {
    categories: v.array(v.string()),
  },
  handler: async (ctx, { categories }) => {
    const niches = await ctx.db.query("niches").collect();
    return niches.filter((niche) => categories.includes(niche.category));
  },
});

// Get niches by IDs
export const getNichesByIds = query({
  args: {
    nicheIds: v.array(v.id("niches")),
  },
  handler: async (ctx, { nicheIds }) => {
    const niches = await Promise.all(nicheIds.map((id) => ctx.db.get(id)));
    return niches.filter(Boolean);
  },
});

// Get single niche by ID (internal function for OpenAI)
export const getNicheById = query({
  args: {
    id: v.id("niches"),
  },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getInternalNicheById = internalQuery({
  args: {
    id: v.id("niches"),
  },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});
