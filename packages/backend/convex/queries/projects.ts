import { query } from "../_generated/server";
import { v } from "convex/values";
import { getUserId } from "../schema";
import { paginationOptsValidator } from "convex/server";

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    year: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);

    // Get all projects for the user first (no pagination yet)
    const allProjects = await ctx.db
      .query("projects")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", userId!))
      .order("desc")
      .collect();

    // Apply filters BEFORE pagination
    let filteredProjects = allProjects;

    // Apply search filter if provided
    if (args.search && args.search.trim() !== "") {
      const searchTerm = args.search.toLowerCase().trim();
      filteredProjects = filteredProjects.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm) ||
          (project.description &&
            project.description.toLowerCase().includes(searchTerm)),
      );
    }

    // Apply year filter if provided
    if (args.year) {
      filteredProjects = filteredProjects.filter((project) => {
        const startYear = project.startDate
          ? new Date(project.startDate).getFullYear()
          : null;
        const endYear = project.endDate
          ? new Date(project.endDate).getFullYear()
          : null;

        // Include project if it appears in the specified year
        return startYear === args.year || endYear === args.year;
      });
    }

    // Apply manual pagination
    const { numItems, cursor } = args.paginationOpts;
    const startIndex = cursor ? parseInt(cursor) : 0;
    const endIndex = startIndex + numItems;
    const page = filteredProjects.slice(startIndex, endIndex);
    const hasMore = endIndex < filteredProjects.length;
    const continueCursor = hasMore ? endIndex.toString() : null;

    // Get content count for each project in the page
    const projectsWithContentCount = await Promise.all(
      page.map(async (project) => {
        const contentCount = await ctx.db
          .query("contents")
          .withIndex("by_user_project", (q) =>
            q.eq("userId", userId!).eq("projectId", project._id),
          )
          .collect()
          .then((contents) => contents.length);

        return {
          ...project,
          contentCount,
        };
      }),
    );

    return {
      page: projectsWithContentCount,
      isDone: !hasMore,
      continueCursor,
    };
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
      withDescription: 0,
      withStartDate: 0,
      withEndDate: 0,
      recentlyCreated: 0, // Last 7 days
      recentlyUpdated: 0, // Last 7 days
    };

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    projects.forEach((project) => {
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
    const contentPhase = {
      total: contents.length,
      byPhase: {
        plan: 0,
        production: 0,
        review: 0,
        scheduled: 0,
        published: 0,
        done: 0,
      },
      byPlatform: {} as Record<string, number>,
    };

    contents.forEach((content) => {
      contentPhase.byPhase[content.phase]++;
      contentPhase.byPlatform[content.platform] =
        (contentPhase.byPlatform[content.platform] || 0) + 1;
    });

    // Calculate task stats
    const taskStats = {
      total: tasks.length,
      byStatus: {
        todo: 0,
        doing: 0,
        done: 0,
        skipped: 0,
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
      contentPhase,
      taskStats,
    };
  },
});

// Get list of years from all user's projects
export const listYear = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Count projects by year from startDate and endDate
    const yearCounts = new Map<number, number>();

    projects.forEach((project) => {
      if (project.startDate) {
        const startYear = new Date(project.startDate).getFullYear();
        yearCounts.set(startYear, (yearCounts.get(startYear) || 0) + 1);
      }
      if (project.endDate) {
        const endYear = new Date(project.endDate).getFullYear();
        // Only count if it's different from startYear to avoid double counting
        if (
          !project.startDate ||
          new Date(project.startDate).getFullYear() !== endYear
        ) {
          yearCounts.set(endYear, (yearCounts.get(endYear) || 0) + 1);
        }
      }
    });

    // Convert to array of objects and sort descending
    const yearList = Array.from(yearCounts.entries())
      .map(([year, projectCount]) => ({ year, projectCount }))
      .sort((a, b) => b.year - a.year);

    return yearList;
  },
});
