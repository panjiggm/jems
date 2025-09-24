import { query } from "../_generated/server";
import { v } from "convex/values";
import { getUserId } from "../schema";
import { paginationOptsValidator } from "convex/server";

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);

    // Get all projects for the user with pagination
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", userId!))
      .order("desc")
      .paginate(args.paginationOpts);

    return projects;
  },
});

// Get all projects for dropdown (no pagination)
export const getAll = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    let query = ctx.db
      .query("projects")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", userId))
      .order("desc");

    const projects = await query.collect();

    // Filter by search if provided
    if (args.search) {
      return projects.filter((project) =>
        project.title.toLowerCase().includes(args.search!.toLowerCase()),
      );
    }

    return projects;
  },
});

// Get project statistics
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const stats = {
      total: projects.length,
      byType: {
        campaign: 0,
        series: 0,
        routine: 0,
      },
      withDescription: 0,
      withStartDate: 0,
      withEndDate: 0,
      recentlyCreated: 0, // Last 7 days
      recentlyUpdated: 0, // Last 7 days
    };

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    projects.forEach((project) => {
      // Count by type
      stats.byType[project.type]++;

      // Count with optional fields
      if (project.description) stats.withDescription++;
      if (project.startDate) stats.withStartDate++;
      if (project.endDate) stats.withEndDate++;

      // Count recent activity
      if (project.createdAt >= sevenDaysAgo) stats.recentlyCreated++;
      if (project.updatedAt >= sevenDaysAgo) stats.recentlyUpdated++;
    });

    return stats;
  },
});

// Get project by ID with detailed stats
export const getByIdWithStats = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) return null;

    // Get contents count for this project
    const contents = await ctx.db
      .query("contents")
      .withIndex("by_user_project", (q) =>
        q.eq("userId", userId).eq("projectId", args.projectId),
      )
      .collect();

    // Get tasks count for this project
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user_project", (q) =>
        q.eq("userId", userId).eq("projectId", args.projectId),
      )
      .collect();

    // Calculate content stats
    const contentStats = {
      total: contents.length,
      byStatus: {
        draft: 0,
        in_progress: 0,
        scheduled: 0,
        published: 0,
      },
      byPlatform: {} as Record<string, number>,
    };

    contents.forEach((content) => {
      contentStats.byStatus[content.status]++;
      contentStats.byPlatform[content.platform] =
        (contentStats.byPlatform[content.platform] || 0) + 1;
    });

    // Calculate task stats
    const taskStats = {
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
      taskStats.byStatus[task.status]++;
      if (task.contentId) taskStats.withContent++;
      if (task.dueDate) {
        taskStats.withDueDate++;
        if (task.dueDate < today && task.status !== "done") {
          taskStats.overdue++;
        }
      }
    });

    return {
      project,
      contentStats,
      taskStats,
    };
  },
});
