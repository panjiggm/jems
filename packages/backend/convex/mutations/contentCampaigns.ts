import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { currentUserId } from "../auth";
import { internal } from "../_generated/api";
import { generateSlug, generateUniqueSlug } from "../utils/slug";

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    sow: v.optional(v.string()),
    platform: v.union(
      v.literal("tiktok"),
      v.literal("instagram"),
      v.literal("youtube"),
      v.literal("x"),
      v.literal("facebook"),
      v.literal("threads"),
      v.literal("other"),
    ),
    type: v.union(v.literal("barter"), v.literal("paid")),
    status: v.union(
      v.literal("product_obtained"),
      v.literal("production"),
      v.literal("published"),
      v.literal("payment"),
      v.literal("done"),
    ),
    statusDurations: v.optional(
      v.object({
        product_obtained_to_production: v.optional(v.string()),
        production_to_published: v.optional(v.string()),
        published_to_payment: v.optional(v.string()),
        payment_to_done: v.optional(v.string()),
      }),
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    const now = Date.now();

    // Generate unique slug
    const baseSlug = generateSlug(args.title);
    const existingCampaigns = await ctx.db
      .query("contentCampaigns")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const existingSlugs = existingCampaigns.map((c) => c.slug);
    const slug = generateUniqueSlug(baseSlug, existingSlugs);

    const contentId = await ctx.db.insert("contentCampaigns", {
      userId,
      projectId: args.projectId,
      title: args.title,
      slug,
      sow: args.sow,
      platform: args.platform,
      type: args.type,
      status: args.status,
      statusHistory: [
        {
          status: args.status,
          timestamp: now,
        },
      ],
      statusDurations: args.statusDurations,
      notes: args.notes,
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
        entityType: "content_campaign" as const,
        entityId: contentId,
        action: "created" as const,
        description: `Campaign "${args.title}" was created`,
        metadata: {
          platform: args.platform,
          type: args.type,
          status: args.status,
          hasSow: !!args.sow,
          hasNotes: !!args.notes,
        },
      },
    );

    return contentId;
  },
});

export const update = mutation({
  args: {
    id: v.id("contentCampaigns"),
    patch: v.object({
      title: v.optional(v.string()),
      sow: v.optional(v.string()),
      type: v.optional(v.union(v.literal("barter"), v.literal("paid"))),
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
      sow: doc.sow,
      type: doc.type,
      platform: doc.platform,
      notes: doc.notes,
    };

    // If title is being updated, regenerate slug
    let updateData: any = { ...patch, updatedAt: Date.now() };
    if (patch.title && patch.title !== doc.title) {
      const baseSlug = generateSlug(patch.title);
      const existingCampaigns = await ctx.db
        .query("contentCampaigns")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.neq(q.field("_id"), id))
        .collect();
      const existingSlugs = existingCampaigns.map((c) => c.slug);
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
        entityType: "content_campaign" as const,
        entityId: id,
        action: "updated" as const,
        description: `Campaign "${patch.title || doc.title}" was updated`,
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
    id: v.id("contentCampaigns"),
    status: v.union(
      v.literal("product_obtained"),
      v.literal("production"),
      v.literal("published"),
      v.literal("payment"),
      v.literal("done"),
    ),
    note: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, note }) => {
    const userId = await currentUserId(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== userId) throw new Error("NOT_FOUND");

    const now = Date.now();
    const oldStatus = doc.status;

    // Prepare status history entry
    const historyEntry: any = {
      status,
      timestamp: now,
    };

    if (note) {
      historyEntry.note = note;
    }

    // If status is published, set publishedAt
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
        case "published":
          return "published";
        case "done":
          return "completed";
        default:
          return "status_changed";
      }
    };

    const action = getActionFromStatus(status);
    const description =
      action === "status_changed"
        ? `Campaign "${doc.title}" status changed from "${oldStatus}" to "${status}"`
        : `Campaign "${doc.title}" was ${action}`;

    await ctx.scheduler.runAfter(
      0,
      internal.mutations.projectActivities.logActivity,
      {
        userId,
        projectId: doc.projectId,
        entityType: "content_campaign" as const,
        entityId: id,
        action: action as any,
        description,
        metadata: {
          oldStatus,
          newStatus: status,
          note,
        },
      },
    );

    return id;
  },
});

export const setStatusDurations = mutation({
  args: {
    id: v.id("contentCampaigns"),
    statusDurations: v.object({
      product_obtained_to_production: v.optional(v.string()),
      production_to_published: v.optional(v.string()),
      published_to_payment: v.optional(v.string()),
      payment_to_done: v.optional(v.string()),
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
  args: { id: v.id("contentCampaigns") },
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
        entityType: "content_campaign" as const,
        entityId: id,
        action: "deleted" as const,
        description: `Campaign "${doc.title}" was deleted`,
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

// Internal mutation for migration
export const addSlug = mutation({
  args: {
    id: v.id("contentCampaigns"),
    slug: v.string(),
  },
  handler: async (ctx, { id, slug }) => {
    await ctx.db.patch(id, { slug, updatedAt: Date.now() });
    return id;
  },
});
