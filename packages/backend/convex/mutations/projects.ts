import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { currentUserId } from "../auth";

export const create = mutation({
  args: {
    title: v.string(),
    type: v.union(
      v.literal("campaign"),
      v.literal("series"),
      v.literal("routine"),
    ),
    description: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    const now = Date.now();
    return await ctx.db.insert("projects", {
      ...args,
      userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    patch: v.object({
      title: v.optional(v.string()),
      type: v.optional(
        v.union(
          v.literal("campaign"),
          v.literal("series"),
          v.literal("routine"),
        ),
      ),
      description: v.optional(v.string()),
      startDate: v.optional(v.string()),
      endDate: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { id, patch }) => {
    const userId = await currentUserId(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== userId) throw new Error("NOT_FOUND");
    await ctx.db.patch(id, { ...patch, updatedAt: Date.now() });
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const userId = await currentUserId(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== userId) throw new Error("NOT_FOUND");
    await ctx.db.delete(id);
    return true;
  },
});
