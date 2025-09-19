import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { currentUserId } from "../auth";

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    contentId: v.optional(v.id("contents")),
    title: v.string(),
    dueDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    const now = Date.now();
    return await ctx.db.insert("tasks", {
      ...args,
      userId,
      status: "todo",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    patch: v.object({
      title: v.optional(v.string()),
      dueDate: v.optional(v.string()),
      contentId: v.optional(v.id("contents")),
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
    id: v.id("tasks"),
    status: v.union(v.literal("todo"), v.literal("doing"), v.literal("done")),
  },
  handler: async (ctx, { id, status }) => {
    const userId = await currentUserId(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== userId) throw new Error("NOT_FOUND");
    await ctx.db.patch(id, { status, updatedAt: Date.now() });
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    const userId = await currentUserId(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== userId) throw new Error("NOT_FOUND");
    await ctx.db.delete(id);
    return true;
  },
});
