import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { currentUserId } from "../auth";

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    platform: v.union(
      v.literal("tiktok"),
      v.literal("instagram"),
      v.literal("youtube"),
      v.literal("x"),
      v.literal("facebook"),
      v.literal("threads"),
      v.literal("other"),
    ),
    dueDate: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    const now = Date.now();
    return await ctx.db.insert("contents", {
      ...args,
      userId,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("contents"),
    patch: v.object({
      title: v.optional(v.string()),
      platform: v.optional(
        v.union(
          v.literal("tiktok"),
          v.literal("instagram"),
          v.literal("youtube"),
          v.literal("x"),
          v.literal("facebook"),
          v.literal("threads"),
          v.literal("other"),
        ),
      ),
      dueDate: v.optional(v.string()),
      notes: v.optional(v.string()),
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

export const setStatus = mutation({
  args: {
    id: v.id("contents"),
    status: v.union(
      v.literal("draft"),
      v.literal("in_progress"),
      v.literal("scheduled"),
      v.literal("published"),
    ),
    scheduledAt: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, scheduledAt }) => {
    const userId = await currentUserId(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== userId) throw new Error("NOT_FOUND");

    const patch: any = { status, updatedAt: Date.now() };
    if (status === "scheduled")
      patch.scheduledAt = scheduledAt || new Date().toISOString();
    if (status === "published" && !doc.publishedAt)
      patch.publishedAt = new Date().toISOString();

    await ctx.db.patch(id, patch);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("contents") },
  handler: async (ctx, { id }) => {
    const userId = await currentUserId(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== userId) throw new Error("NOT_FOUND");
    await ctx.db.delete(id);
    return true;
  },
});
