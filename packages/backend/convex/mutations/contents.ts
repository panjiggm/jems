import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { currentUserId } from "../auth";
import { internal } from "../_generated/api";

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

    const contentId = await ctx.db.insert("contents", {
      ...args,
      userId,
      status: "draft",
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
        entityType: "content" as const,
        entityId: contentId,
        action: "created" as const,
        description: `Content "${args.title}" was created`,
        metadata: {
          platform: args.platform,
          hasDueDate: !!args.dueDate,
          hasNotes: !!args.notes,
        },
      },
    );

    return contentId;
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

    // Store old values for logging
    const oldValues = {
      title: doc.title,
      platform: doc.platform,
      dueDate: doc.dueDate,
      notes: doc.notes,
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
        entityType: "content" as const,
        entityId: id,
        action: "updated" as const,
        description: `Content "${patch.title || doc.title}" was updated`,
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

    const oldStatus = doc.status;
    const patch: any = { status, updatedAt: Date.now() };

    if (status === "scheduled")
      patch.scheduledAt = scheduledAt || new Date().toISOString();
    if (status === "published" && !doc.publishedAt)
      patch.publishedAt = new Date().toISOString();

    await ctx.db.patch(id, patch);

    // Log status change activity
    const action =
      status === "scheduled"
        ? "scheduled"
        : status === "published"
          ? "published"
          : "status_changed";

    await ctx.scheduler.runAfter(
      0,
      internal.mutations.projectActivities.logActivity,
      {
        userId,
        projectId: doc.projectId,
        entityType: "content" as const,
        entityId: id,
        action: action as any,
        description: `Content "${doc.title}" status changed from "${oldStatus}" to "${status}"`,
        metadata: {
          oldValue: oldStatus,
          newValue: status,
          scheduledAt: patch.scheduledAt,
          publishedAt: patch.publishedAt,
        },
      },
    );

    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("contents") },
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
        entityType: "content" as const,
        entityId: id,
        action: "deleted" as const,
        description: `Content "${doc.title}" was deleted`,
        metadata: {
          deletedContent: {
            title: doc.title,
            platform: doc.platform,
            status: doc.status,
          },
        },
      },
    );

    await ctx.db.delete(id);
    return true;
  },
});
