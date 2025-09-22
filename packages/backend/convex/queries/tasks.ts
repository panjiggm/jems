import { query } from "../_generated/server";
import { v } from "convex/values";
import { currentUserId } from "../auth";

export const list = query({
  args: {
    projectId: v.optional(v.id("projects")),
    contentId: v.optional(v.id("contents")),
    status: v.optional(v.array(v.string())),
    overdueOnly: v.optional(v.boolean()),
    cursor: v.optional(v.string()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    const pageSize = Math.min(args.pageSize ?? 20, 100);

    let q = ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("asc");

    if (args.projectId)
      q = ctx.db
        .query("tasks")
        .withIndex("by_user_project", (q) =>
          q.eq("userId", userId).eq("projectId", args.projectId!),
        );

    const { page, isDone, continueCursor } = await q.paginate({
      cursor: args.cursor ?? null,
      numItems: pageSize,
    });

    let items = page;
    if (args.contentId)
      items = items.filter((t) => t.contentId === args.contentId);
    if (args.status?.length)
      items = items.filter((t) => (args.status as string[]).includes(t.status));
    if (args.overdueOnly) {
      const today = new Date().toISOString().slice(0, 10);
      items = items.filter(
        (t) => t.dueDate && t.dueDate < today && t.status !== "done",
      );
    }

    items.sort(
      (a, b) =>
        (a.dueDate || "").localeCompare(b.dueDate || "") ||
        b._creationTime - a._creationTime,
    );

    return { items, cursor: continueCursor, isDone };
  },
});

// Get task statistics
export const getStats = query({
  args: {
    projectId: v.optional(v.id("projects")),
    contentId: v.optional(v.id("contents")),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    if (!userId) return null;

    let tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Filter by project if specified
    if (args.projectId) {
      tasks = tasks.filter((t) => t.projectId === args.projectId);
    }

    // Filter by content if specified
    if (args.contentId) {
      tasks = tasks.filter((t) => t.contentId === args.contentId);
    }

    const stats = {
      total: tasks.length,
      byStatus: {
        todo: 0,
        doing: 0,
        done: 0,
      },
      withContent: 0,
      withDueDate: 0,
      overdue: 0,
      upcoming: 0, // Due in next 7 days
      recentlyCreated: 0, // Last 7 days
      recentlyUpdated: 0, // Last 7 days
      completionRate: 0,
    };

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const today = new Date().toISOString().split("T")[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    tasks.forEach((task) => {
      // Count by status
      stats.byStatus[task.status]++;

      // Count with optional fields
      if (task.contentId) stats.withContent++;
      if (task.dueDate) {
        stats.withDueDate++;
        if (task.dueDate < today && task.status !== "done") {
          stats.overdue++;
        }
        if (task.dueDate >= today && task.dueDate <= nextWeek) {
          stats.upcoming++;
        }
      }

      // Count recent activity
      if (task.createdAt >= sevenDaysAgo) stats.recentlyCreated++;
      if (task.updatedAt >= sevenDaysAgo) stats.recentlyUpdated++;
    });

    // Calculate completion rate
    if (stats.total > 0) {
      stats.completionRate = Math.round(
        (stats.byStatus.done / stats.total) * 100,
      );
    }

    return stats;
  },
});

// Get tasks by project with stats
export const getByProjectWithStats = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    if (!userId) return null;

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user_project", (q) =>
        q.eq("userId", userId).eq("projectId", args.projectId),
      )
      .collect();

    const stats = {
      total: tasks.length,
      byStatus: {
        todo: 0,
        doing: 0,
        done: 0,
      },
      withContent: 0,
      withDueDate: 0,
      overdue: 0,
    };

    const today = new Date().toISOString().split("T")[0];

    tasks.forEach((task) => {
      stats.byStatus[task.status]++;
      if (task.contentId) stats.withContent++;
      if (task.dueDate) {
        stats.withDueDate++;
        if (task.dueDate < today && task.status !== "done") {
          stats.overdue++;
        }
      }
    });

    return {
      tasks,
      stats,
    };
  },
});

// Get tasks by content with stats
export const getByContentWithStats = query({
  args: {
    contentId: v.id("contents"),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    if (!userId) return null;

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("contentId"), args.contentId))
      .collect();

    const stats = {
      total: tasks.length,
      byStatus: {
        todo: 0,
        doing: 0,
        done: 0,
      },
      withDueDate: 0,
      overdue: 0,
    };

    const today = new Date().toISOString().split("T")[0];

    tasks.forEach((task) => {
      stats.byStatus[task.status]++;
      if (task.dueDate) {
        stats.withDueDate++;
        if (task.dueDate < today && task.status !== "done") {
          stats.overdue++;
        }
      }
    });

    return {
      tasks,
      stats,
    };
  },
});

// Get overdue tasks
export const getOverdue = query({
  args: {
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    if (!userId) return [];

    let tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Filter by project if specified
    if (args.projectId) {
      tasks = tasks.filter((t) => t.projectId === args.projectId);
    }

    const today = new Date().toISOString().split("T")[0];
    const overdueTasks = tasks.filter(
      (t) => t.dueDate && t.dueDate < today && t.status !== "done",
    );

    return overdueTasks.sort((a, b) =>
      (a.dueDate || "").localeCompare(b.dueDate || ""),
    );
  },
});

// Get upcoming tasks (due in next 7 days)
export const getUpcoming = query({
  args: {
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    if (!userId) return [];

    let tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Filter by project if specified
    if (args.projectId) {
      tasks = tasks.filter((t) => t.projectId === args.projectId);
    }

    const today = new Date().toISOString().split("T")[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const upcomingTasks = tasks.filter(
      (t) =>
        t.dueDate &&
        t.dueDate >= today &&
        t.dueDate <= nextWeek &&
        t.status !== "done",
    );

    return upcomingTasks.sort((a, b) =>
      (a.dueDate || "").localeCompare(b.dueDate || ""),
    );
  },
});
