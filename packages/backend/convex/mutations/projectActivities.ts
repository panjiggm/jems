import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { currentUserId } from "../auth";
import { createActivityDescription } from "../utils";

// Log activity - can be called from other mutations
export const logActivity = internalMutation({
  args: {
    userId: v.string(),
    projectId: v.id("projects"),
    entityType: v.union(
      v.literal("project"),
      v.literal("task"),
      v.literal("content_campaign"),
      v.literal("content_routine"),
    ),
    entityId: v.string(),
    action: v.union(
      v.literal("created"),
      v.literal("updated"),
      v.literal("deleted"),
      v.literal("status_changed"),
      v.literal("assigned"),
      v.literal("completed"),
      v.literal("scheduled"),
      v.literal("published"),
    ),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();

    return await ctx.db.insert("projectActivities", {
      ...args,
      timestamp,
    });
  },
});

// Manual activity logging (for custom activities)
export const createActivity = mutation({
  args: {
    projectId: v.id("projects"),
    entityType: v.union(
      v.literal("project"),
      v.literal("task"),
      v.literal("content_campaign"),
      v.literal("content_routine"),
    ),
    entityId: v.string(),
    action: v.union(
      v.literal("created"),
      v.literal("updated"),
      v.literal("deleted"),
      v.literal("status_changed"),
      v.literal("assigned"),
      v.literal("completed"),
      v.literal("scheduled"),
      v.literal("published"),
    ),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    const timestamp = Date.now();

    // Generate description if not provided
    const description =
      args.description ||
      createActivityDescription(
        args.entityType,
        args.action,
        undefined,
        args.metadata,
      );

    return await ctx.db.insert("projectActivities", {
      userId,
      projectId: args.projectId,
      entityType: args.entityType,
      entityId: args.entityId,
      action: args.action,
      description,
      metadata: args.metadata,
      timestamp,
    });
  },
});

// Bulk delete activities (for cleanup)
export const deleteActivitiesByEntity = internalMutation({
  args: {
    entityType: v.union(
      v.literal("project"),
      v.literal("task"),
      v.literal("content_campaign"),
      v.literal("content_routine"),
    ),
    entityId: v.string(),
  },
  handler: async (ctx, { entityType, entityId }) => {
    const activities = await ctx.db
      .query("projectActivities")
      .withIndex("by_entity", (q) =>
        q.eq("entityType", entityType).eq("entityId", entityId),
      )
      .collect();

    for (const activity of activities) {
      await ctx.db.delete(activity._id);
    }

    return activities.length;
  },
});
