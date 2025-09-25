import { query } from "../_generated/server";
import { v } from "convex/values";
import { getUserId } from "../schema";

export const list = query({
  args: {
    projectId: v.optional(v.id("projects")),
    status: v.optional(v.array(v.string())),
    platform: v.optional(v.array(v.string())),
    priority: v.optional(v.array(v.string())),
    dateFrom: v.optional(v.string()),
    dateTo: v.optional(v.string()),
    search: v.optional(v.string()),
    cursor: v.optional(v.string()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const pageSize = Math.min(args.pageSize ?? 20, 100);

    let q = ctx.db
      .query("contents")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc");

    if (args.projectId) {
      q = ctx.db
        .query("contents")
        .withIndex("by_user_project", (q) =>
          q.eq("userId", userId!).eq("projectId", args.projectId!),
        );
    }

    const { page, isDone, continueCursor } = await q.paginate({
      cursor: args.cursor ?? null,
      numItems: pageSize,
    });

    let items = page;

    if (args.status?.length)
      items = items.filter((c) => (args.status as string[]).includes(c.status));
    if (args.platform?.length)
      items = items.filter((c) =>
        (args.platform as string[]).includes(c.platform),
      );
    if (args.priority?.length)
      items = items.filter((c) =>
        (args.priority as string[]).includes(c.priority),
      );
    if (args.dateFrom)
      items = items.filter(
        (c) => !c.dueDate || c.dueDate >= (args.dateFrom as string),
      );
    if (args.dateTo)
      items = items.filter(
        (c) => !c.dueDate || c.dueDate <= (args.dateTo as string),
      );
    if (args.search)
      items = items.filter((c) =>
        c.title.toLowerCase().includes((args.search as string).toLowerCase()),
      );

    return { items, cursor: continueCursor, isDone };
  },
});

// Get content statistics
export const getStats = query({
  args: {
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    let contents = await ctx.db
      .query("contents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Filter by project if specified
    if (args.projectId) {
      contents = contents.filter((c) => c.projectId === args.projectId);
    }

    const stats = {
      total: contents.length,
      byStatus: {
        draft: 0,
        in_progress: 0,
        scheduled: 0,
        published: 0,
      },
      byPlatform: {} as Record<string, number>,
      byPriority: {
        low: 0,
        medium: 0,
        high: 0,
      },
      withNotes: 0,
      withDueDate: 0,
      withScheduledDate: 0,
      withPublishedDate: 0,
      recentlyCreated: 0, // Last 7 days
      recentlyUpdated: 0, // Last 7 days
      overdue: 0,
      upcoming: 0, // Due in next 7 days
    };

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const today = new Date().toISOString().split("T")[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    contents.forEach((content) => {
      // Count by status
      stats.byStatus[content.status]++;

      // Count by platform
      stats.byPlatform[content.platform] =
        (stats.byPlatform[content.platform] || 0) + 1;

      // Count by priority
      stats.byPriority[content.priority]++;

      // Count with optional fields
      if (content.notes) stats.withNotes++;
      if (content.dueDate) {
        stats.withDueDate++;
        if (content.dueDate < today && content.status !== "published") {
          stats.overdue++;
        }
        if (content.dueDate >= today && content.dueDate <= nextWeek) {
          stats.upcoming++;
        }
      }
      if (content.scheduledAt) stats.withScheduledDate++;
      if (content.publishedAt) stats.withPublishedDate++;

      // Count recent activity
      if (content.createdAt >= sevenDaysAgo) stats.recentlyCreated++;
      if (content.updatedAt >= sevenDaysAgo) stats.recentlyUpdated++;
    });

    return stats;
  },
});

// Get content by ID with task stats
export const getByIdWithStats = query({
  args: {
    contentId: v.id("contents"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const content = await ctx.db.get(args.contentId);
    if (!content || content.userId !== userId) return null;

    // Get tasks for this content
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("contentId"), args.contentId))
      .collect();

    // Calculate task stats
    const taskStats = {
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
      taskStats.byStatus[task.status]++;
      if (task.dueDate) {
        taskStats.withDueDate++;
        if (task.dueDate < today && task.status !== "done") {
          taskStats.overdue++;
        }
      }
    });

    return {
      content,
      taskStats,
    };
  },
});

// Get contents by project for Kanban board
export const getByProject = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const contents = await ctx.db
      .query("contents")
      .withIndex("by_user_project", (q) =>
        q.eq("userId", userId).eq("projectId", args.projectId),
      )
      .collect();

    return contents;
  },
});

// Get contents by project with stats
export const getByProjectWithStats = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const contents = await ctx.db
      .query("contents")
      .withIndex("by_user_project", (q) =>
        q.eq("userId", userId).eq("projectId", args.projectId),
      )
      .collect();

    const stats = {
      total: contents.length,
      byStatus: {
        draft: 0,
        in_progress: 0,
        scheduled: 0,
        published: 0,
      },
      byPlatform: {} as Record<string, number>,
      byPriority: {
        low: 0,
        medium: 0,
        high: 0,
      },
    };

    contents.forEach((content) => {
      stats.byStatus[content.status]++;
      stats.byPlatform[content.platform] =
        (stats.byPlatform[content.platform] || 0) + 1;
      stats.byPriority[content.priority]++;
    });

    return {
      contents,
      stats,
    };
  },
});
