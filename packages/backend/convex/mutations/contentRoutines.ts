import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { currentUserId } from "../auth";
import { internal } from "../_generated/api";
import { generateSlug, generateUniqueSlug } from "../utils/slug";

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    notes: v.optional(v.string()),
    platform: v.union(
      v.literal("tiktok"),
      v.literal("instagram"),
      v.literal("youtube"),
      v.literal("x"),
      v.literal("facebook"),
      v.literal("threads"),
      v.literal("other"),
    ),
    status: v.union(
      v.literal("plan"),
      v.literal("in_progress"),
      v.literal("scheduled"),
      v.literal("published"),
    ),
    statusDurations: v.optional(
      v.object({
        plan_to_in_progress: v.optional(v.string()),
        in_progress_to_scheduled: v.optional(v.string()),
        scheduled_to_published: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    const now = Date.now();

    // Generate unique slug
    const baseSlug = generateSlug(args.title);
    const existingRoutines = await ctx.db
      .query("contentRoutines")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const existingSlugs = existingRoutines
      .map((r) => r.slug)
      .filter((slug): slug is string => slug !== undefined);
    const slug = generateUniqueSlug(baseSlug, existingSlugs);

    const contentId = await ctx.db.insert("contentRoutines", {
      userId,
      projectId: args.projectId,
      title: args.title,
      slug,
      notes: args.notes,
      platform: args.platform,
      status: args.status,
      statusHistory: [
        {
          status: args.status,
          timestamp: now,
        },
      ],
      statusDurations: args.statusDurations,
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
        entityType: "content_routine" as const,
        entityId: contentId,
        action: "created" as const,
        description: `Routine "${args.title}" was created`,
        metadata: {
          platform: args.platform,
          status: args.status,
          hasNotes: !!args.notes,
        },
      },
    );

    return contentId;
  },
});

export const update = mutation({
  args: {
    id: v.id("contentRoutines"),
    patch: v.object({
      title: v.optional(v.string()),
      notes: v.optional(v.string()),
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
    }),
  },
  handler: async (ctx, { id, patch }) => {
    const userId = await currentUserId(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== userId) throw new Error("NOT_FOUND");

    // Store old values for logging
    const oldValues = {
      title: doc.title,
      notes: doc.notes,
      platform: doc.platform,
    };

    // If title is being updated, regenerate slug
    let updateData: any = { ...patch, updatedAt: Date.now() };
    if (patch.title && patch.title !== doc.title) {
      const baseSlug = generateSlug(patch.title);
      const existingRoutines = await ctx.db
        .query("contentRoutines")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.neq(q.field("_id"), id))
        .collect();
      const existingSlugs = existingRoutines
        .map((r) => r.slug)
        .filter((slug): slug is string => slug !== undefined);
      updateData.slug = generateUniqueSlug(baseSlug, existingSlugs);
    }

    await ctx.db.patch(id, updateData);

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
        entityType: "content_routine" as const,
        entityId: id,
        action: "updated" as const,
        description: `Routine "${patch.title || doc.title}" was updated`,
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
    id: v.id("contentRoutines"),
    status: v.union(
      v.literal("plan"),
      v.literal("in_progress"),
      v.literal("scheduled"),
      v.literal("published"),
    ),
    scheduledAt: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, scheduledAt, note }) => {
    const userId = await currentUserId(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== userId) throw new Error("NOT_FOUND");

    const now = Date.now();
    const oldStatus = doc.status;

    // Validate scheduledAt if provided
    if (scheduledAt && new Date(scheduledAt) < new Date()) {
      throw new Error("Scheduled date cannot be in the past");
    }

    // Prepare status history entry
    const historyEntry: any = {
      status,
      timestamp: now,
    };

    if (note) {
      historyEntry.note = note;
    }

    // Handle scheduled status
    if (status === "scheduled") {
      historyEntry.scheduledAt = scheduledAt || new Date().toISOString();
    }

    // Handle published status
    if (
      status === "published" &&
      !doc.statusHistory.some((h) => h.status === "published")
    ) {
      historyEntry.publishedAt = new Date().toISOString();
    }

    // Update document with new status and history
    await ctx.db.patch(id, {
      status,
      statusHistory: [...doc.statusHistory, historyEntry],
      updatedAt: now,
    });

    // Log activity
    const getActionFromStatus = (status: string) => {
      switch (status) {
        case "scheduled":
          return "scheduled";
        case "published":
          return "published";
        default:
          return "status_changed";
      }
    };

    const action = getActionFromStatus(status);
    const description =
      action === "status_changed"
        ? `Routine "${doc.title}" status changed from "${oldStatus}" to "${status}"`
        : `Routine "${doc.title}" was ${action}`;

    await ctx.scheduler.runAfter(
      0,
      internal.mutations.projectActivities.logActivity,
      {
        userId,
        projectId: doc.projectId,
        entityType: "content_routine" as const,
        entityId: id,
        action: action as any,
        description,
        metadata: {
          oldStatus,
          newStatus: status,
          scheduledAt: historyEntry.scheduledAt,
          publishedAt: historyEntry.publishedAt,
          note,
        },
      },
    );

    return id;
  },
});

export const setStatusDurations = mutation({
  args: {
    id: v.id("contentRoutines"),
    statusDurations: v.object({
      plan_to_in_progress: v.optional(v.string()),
      in_progress_to_scheduled: v.optional(v.string()),
      scheduled_to_published: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { id, statusDurations }) => {
    const userId = await currentUserId(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== userId) throw new Error("NOT_FOUND");

    await ctx.db.patch(id, {
      statusDurations,
      updatedAt: Date.now(),
    });

    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("contentRoutines") },
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
        entityType: "content_routine" as const,
        entityId: id,
        action: "deleted" as const,
        description: `Routine "${doc.title}" was deleted`,
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

// Internal mutation for migration
export const addSlug = mutation({
  args: {
    id: v.id("contentRoutines"),
    slug: v.string(),
  },
  handler: async (ctx, { id, slug }) => {
    await ctx.db.patch(id, { slug, updatedAt: Date.now() });
    return id;
  },
});
