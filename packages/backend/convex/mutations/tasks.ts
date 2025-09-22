import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { currentUserId } from "../auth";
import { internal } from "../_generated/api";

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

    const taskId = await ctx.db.insert("tasks", {
      ...args,
      userId,
      status: "todo",
      createdAt: now,
      updatedAt: now,
    });

    // Log activity
    await ctx.scheduler.runAfter(
      0,
      internal.mutations.projectActivities.logActivity,
      {
        userId,
        projectId: args.projectId,
        entityType: "task" as const,
        entityId: taskId,
        action: "created" as const,
        description: `Task "${args.title}" was created`,
        metadata: {
          contentId: args.contentId,
          hasDueDate: !!args.dueDate,
        },
      },
    );

    return taskId;
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

    // Store old values for logging
    const oldValues = {
      title: doc.title,
      dueDate: doc.dueDate,
      contentId: doc.contentId,
    };

    await ctx.db.patch(id, { ...patch, updatedAt: Date.now() });

    // Log activity
    const changedFields = Object.keys(patch).filter(
      (key) => patch[key as keyof typeof patch] !== undefined,
    );

    await ctx.scheduler.runAfter(
      0,
      internal.mutations.projectActivities.logActivity,
      {
        userId,
        projectId: doc.projectId,
        entityType: "task" as const,
        entityId: id,
        action: "updated" as const,
        description: `Task "${patch.title || doc.title}" was updated`,
        metadata: {
          changedFields,
          oldValues: Object.fromEntries(
            changedFields.map((field) => [
              field,
              oldValues[field as keyof typeof oldValues],
            ]),
          ),
          newValues: patch,
        },
      },
    );

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

    const oldStatus = doc.status;
    await ctx.db.patch(id, { status, updatedAt: Date.now() });

    // Log status change activity
    const action = status === "done" ? "completed" : "status_changed";

    await ctx.scheduler.runAfter(
      0,
      internal.mutations.projectActivities.logActivity,
      {
        userId,
        projectId: doc.projectId,
        entityType: "task" as const,
        entityId: id,
        action: action as any,
        description: `Task "${doc.title}" status changed from "${oldStatus}" to "${status}"`,
        metadata: {
          oldValue: oldStatus,
          newValue: status,
        },
      },
    );

    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    const userId = await currentUserId(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== userId) throw new Error("NOT_FOUND");

    // Log activity before deletion
    await ctx.scheduler.runAfter(
      0,
      internal.mutations.projectActivities.logActivity,
      {
        userId,
        projectId: doc.projectId,
        entityType: "task" as const,
        entityId: id,
        action: "deleted" as const,
        description: `Task "${doc.title}" was deleted`,
        metadata: {
          deletedTask: {
            title: doc.title,
            status: doc.status,
            contentId: doc.contentId,
          },
        },
      },
    );

    await ctx.db.delete(id);
    return true;
  },
});
