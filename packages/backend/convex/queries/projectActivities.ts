import { query } from "../_generated/server";
import { v } from "convex/values";

// Get activities for a specific project
export const getProjectActivities = query({
  args: {
    projectId: v.id("projects"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user is authenticated first
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { page: [], isDone: true, continueCursor: null };
    }

    const userId = identity.subject;
    const limit = Math.min(args.limit ?? 50, 100);

    const result = await ctx.db
      .query("projectActivities")
      .withIndex("by_project_timestamp", (q) =>
        q.eq("projectId", args.projectId),
      )
      .order("desc")
      .paginate({
        cursor: args.cursor ?? null,
        numItems: limit,
      });

    // Filter by user to ensure security
    const filteredItems = result.page.filter(
      (activity) => activity.userId === userId,
    );

    return {
      ...result,
      page: filteredItems,
    };
  },
});

// Get activities for a user across all projects
export const getUserActivities = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    entityType: v.optional(
      v.union(v.literal("project"), v.literal("content"), v.literal("task")),
    ),
    action: v.optional(
      v.union(
        v.literal("created"),
        v.literal("updated"),
        v.literal("deleted"),
        v.literal("status_changed"),
        v.literal("assigned"),
        v.literal("completed"),
        v.literal("scheduled"),
        v.literal("published"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    // Check if user is authenticated first
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { page: [], isDone: true, continueCursor: null };
    }

    const userId = identity.subject;
    const limit = Math.min(args.limit ?? 50, 100);

    let query = ctx.db
      .query("projectActivities")
      .withIndex("by_user_timestamp", (q) => q.eq("userId", userId))
      .order("desc");

    const result = await query.paginate({
      cursor: args.cursor ?? null,
      numItems: limit,
    });

    let filteredItems = result.page;

    // Apply filters
    if (args.entityType) {
      filteredItems = filteredItems.filter(
        (activity) => activity.entityType === args.entityType,
      );
    }

    if (args.action) {
      filteredItems = filteredItems.filter(
        (activity) => activity.action === args.action,
      );
    }

    return {
      ...result,
      page: filteredItems,
    };
  },
});

// Get activities for a specific entity (project/content/task)
export const getEntityActivities = query({
  args: {
    entityType: v.union(
      v.literal("project"),
      v.literal("content"),
      v.literal("task"),
    ),
    entityId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if user is authenticated first
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;
    const limit = Math.min(args.limit ?? 20, 50);

    const activities = await ctx.db
      .query("projectActivities")
      .withIndex("by_entity", (q) =>
        q.eq("entityType", args.entityType).eq("entityId", args.entityId),
      )
      .order("desc")
      .take(limit);

    // Filter by user to ensure security
    return activities.filter((activity) => activity.userId === userId);
  },
});

// Get recent activities (last 24 hours)
export const getRecentActivities = query({
  args: {
    projectId: v.optional(v.id("projects")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if user is authenticated first
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return []; // Return empty array if not authenticated
    }

    const userId = identity.subject;
    const limit = Math.min(args.limit ?? 20, 50);
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago

    let query = ctx.db
      .query("projectActivities")
      .withIndex("by_user_timestamp", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit * 2); // Take more to filter later

    const activities = await query;

    let filteredActivities = activities.filter(
      (activity) => activity.timestamp >= oneDayAgo,
    );

    // Filter by project if specified
    if (args.projectId) {
      filteredActivities = filteredActivities.filter(
        (activity) => activity.projectId === args.projectId,
      );
    }

    return filteredActivities.slice(0, limit);
  },
});

// Get activity statistics
export const getActivityStats = query({
  args: {
    projectId: v.optional(v.id("projects")),
    days: v.optional(v.number()), // Number of days to look back
  },
  handler: async (ctx, args) => {
    // Check if user is authenticated first
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        total: 0,
        byAction: {},
        byEntityType: {},
        byDay: {},
      };
    }

    const userId = identity.subject;
    const days = args.days ?? 7;
    const timeAgo = Date.now() - days * 24 * 60 * 60 * 1000;

    let query = ctx.db
      .query("projectActivities")
      .withIndex("by_user_timestamp", (q) => q.eq("userId", userId))
      .order("desc");

    const activities = await query.collect();

    let filteredActivities = activities.filter(
      (activity) => activity.timestamp >= timeAgo,
    );

    // Filter by project if specified
    if (args.projectId) {
      filteredActivities = filteredActivities.filter(
        (activity) => activity.projectId === args.projectId,
      );
    }

    // Calculate statistics
    const stats = {
      total: filteredActivities.length,
      byAction: {} as Record<string, number>,
      byEntityType: {} as Record<string, number>,
      byDay: {} as Record<string, number>,
    };

    filteredActivities.forEach((activity) => {
      // Count by action
      stats.byAction[activity.action] =
        (stats.byAction[activity.action] || 0) + 1;

      // Count by entity type
      stats.byEntityType[activity.entityType] =
        (stats.byEntityType[activity.entityType] || 0) + 1;

      // Count by day
      const date = new Date(activity.timestamp).toISOString().split("T")[0];
      stats.byDay[date] = (stats.byDay[date] || 0) + 1;
    });

    return stats;
  },
});
