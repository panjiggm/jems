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
    type: v.union(
      v.literal("campaign"),
      v.literal("series"),
      v.literal("routine"),
    ),
    status: v.union(
      v.literal("confirmed"),
      v.literal("shipped"),
      v.literal("received"),
      v.literal("shooting"),
      v.literal("drafting"),
      v.literal("editing"),
      v.literal("done"),
      v.literal("pending payment"),
      v.literal("paid"),
      v.literal("canceled"),
      v.literal("ideation"),
      v.literal("scripting"),
      v.literal("scheduled"),
      v.literal("published"),
      v.literal("archived"),
      v.literal("planned"),
      v.literal("skipped"),
    ),
    phase: v.union(
      v.literal("plan"),
      v.literal("production"),
      v.literal("review"),
      v.literal("published"),
      v.literal("done"),
    ),
    dueDate: v.optional(v.string()),
    publishedAt: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    const now = Date.now();

    const contentId = await ctx.db.insert("contents", {
      ...args,
      userId,
      status: args.status,
      phase: args.phase,
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
          type: args.type,
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
      type: v.optional(
        v.union(
          v.literal("campaign"),
          v.literal("series"),
          v.literal("routine"),
        ),
      ),
      dueDate: v.optional(v.string()),
      publishedAt: v.optional(v.string()),
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
      type: doc.type,
      dueDate: doc.dueDate,
      publishedAt: doc.publishedAt,
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
      v.literal("confirmed"),
      v.literal("shipped"),
      v.literal("received"),
      v.literal("shooting"),
      v.literal("drafting"),
      v.literal("editing"),
      v.literal("done"),
      v.literal("pending payment"),
      v.literal("paid"),
      v.literal("canceled"),
      v.literal("ideation"),
      v.literal("scripting"),
      v.literal("scheduled"),
      v.literal("published"),
      v.literal("archived"),
      v.literal("planned"),
      v.literal("skipped"),
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

    // Log status change activity with more specific actions
    const getActionFromStatus = (status: string) => {
      switch (status) {
        case "scheduled":
          return "scheduled";
        case "published":
          return "published";
        case "done":
          return "completed";
        case "canceled":
          return "status_changed";
        case "archived":
          return "status_changed";
        case "skipped":
          return "status_changed";
        default:
          return "status_changed";
      }
    };

    const action = getActionFromStatus(status);
    const description =
      action === "status_changed"
        ? `Content "${doc.title}" status changed from "${oldStatus}" to "${status}"`
        : `Content "${doc.title}" was ${action}`;

    await ctx.scheduler.runAfter(
      0,
      internal.mutations.projectActivities.logActivity,
      {
        userId,
        projectId: doc.projectId,
        entityType: "content" as const,
        entityId: id,
        action: action as any,
        description,
        metadata: {
          changedFields: ["status"],
          oldValues: { status: oldStatus },
          newValues: { status },
          scheduledAt: patch.scheduledAt,
          publishedAt: patch.publishedAt,
        },
      },
    );

    return id;
  },
});

export const setPhase = mutation({
  args: {
    id: v.id("contents"),
    phase: v.union(
      v.literal("plan"),
      v.literal("production"),
      v.literal("review"),
      v.literal("published"),
      v.literal("done"),
    ),
  },
  handler: async (ctx, { id, phase }) => {
    const userId = await currentUserId(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== userId) throw new Error("NOT_FOUND");

    const oldPhase = doc.phase;
    await ctx.db.patch(id, { phase, updatedAt: Date.now() });

    // Log activity
    await ctx.scheduler.runAfter(
      0,
      internal.mutations.projectActivities.logActivity,
      {
        userId,
        projectId: doc.projectId,
        entityType: "content" as const,
        entityId: id,
        action: "updated" as const,
        description: `Content "${doc.title}" phase changed from "${oldPhase}" to "${phase}"`,
        metadata: {
          changedFields: ["phase"],
          oldValues: { phase: oldPhase },
          newValues: { phase },
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
            type: doc.type,
            status: doc.status,
          },
        },
      },
    );

    await ctx.db.delete(id);
    return true;
  },
});
