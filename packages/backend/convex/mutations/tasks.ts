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
