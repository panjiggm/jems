import { query } from "../_generated/server";
import { v } from "convex/values";
import { getUserId } from "../schema";

export const list = query({
  args: {
    projectId: v.optional(v.id("projects")),
    status: v.optional(v.array(v.string())),
    platform: v.optional(v.array(v.string())),
    search: v.optional(v.string()),
    cursor: v.optional(v.string()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return { items: [], cursor: null, isDone: true };
    const pageSize = Math.min(args.pageSize ?? 20, 100);

    // Start with base query - use appropriate index based on filters
    let q;
    if (args.projectId) {
      q = ctx.db
        .query("contentRoutines")
        .withIndex("by_user_project", (q) =>
          q.eq("userId", userId!).eq("projectId", args.projectId!),
        );
    } else if (args.status?.length === 1) {
      q = ctx.db
        .query("contentRoutines")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", userId!).eq("status", args.status![0] as any),
        );
    } else if (args.platform?.length === 1) {
      q = ctx.db
        .query("contentRoutines")
        .withIndex("by_user_platform", (q) =>
          q.eq("userId", userId!).eq("platform", args.platform![0] as any),
        );
    } else {
      q = ctx.db
        .query("contentRoutines")
        .withIndex("by_user", (q) => q.eq("userId", userId!));
    }

    // Apply additional filters at database level where possible
    if (args.status?.length) {
      q = q.filter((q) =>
        q.or(...args.status!.map((status) => q.eq(q.field("status"), status))),
      );
    }

    if (args.platform?.length) {
      q = q.filter((q) =>
        q.or(
          ...args.platform!.map((platform) =>
            q.eq(q.field("platform"), platform),
          ),
        ),
      );
    }

    if (args.search) {
      q = q.filter((q) =>
        q.or(
          q.and(
            q.gte(q.field("title"), args.search!.toLowerCase()),
            q.lt(q.field("title"), args.search!.toLowerCase() + "\uffff"),
          ),
        ),
      );
    }

    const { page, isDone, continueCursor } = await q.order("desc").paginate({
      cursor: args.cursor ?? null,
      numItems: pageSize,
    });

    return { items: page, cursor: continueCursor, isDone };
  },
});

// Get routine statistics
export const getStats = query({
  args: {
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    let routines = await ctx.db
      .query("contentRoutines")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Filter by project if specified
    if (args.projectId) {
      routines = routines.filter((r) => r.projectId === args.projectId);
    }

    const stats = {
      total: routines.length,
      byStatus: {
        plan: 0,
        in_progress: 0,
        scheduled: 0,
        published: 0,
      },
      byPlatform: {} as Record<string, number>,
      withNotes: 0,
      scheduled: 0, // Has scheduledAt in history
      recentlyCreated: 0, // Last 7 days
      recentlyUpdated: 0, // Last 7 days
    };

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    routines.forEach((routine) => {
      // Count by status
      stats.byStatus[routine.status]++;

      // Count by platform
      stats.byPlatform[routine.platform] =
        (stats.byPlatform[routine.platform] || 0) + 1;

      // Count with optional fields
      if (routine.notes) stats.withNotes++;
      if (routine.statusHistory.some((h) => h.scheduledAt)) {
        stats.scheduled++;
      }

      // Count recent activity
      if (routine.createdAt >= sevenDaysAgo) stats.recentlyCreated++;
      if (routine.updatedAt >= sevenDaysAgo) stats.recentlyUpdated++;
    });

    return stats;
  },
});

// Get routine by ID with task stats
export const getById = query({
  args: {
    routineId: v.id("contentRoutines"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const routine = await ctx.db.get(args.routineId);
    if (!routine || routine.userId !== userId) return null;

    // Get tasks for this routine
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("contentId"), args.routineId),
          q.eq(q.field("contentType"), "routine"),
        ),
      )
      .collect();

    // Calculate task stats
    const taskStats = {
      total: tasks.length,
      byStatus: {
        todo: 0,
        doing: 0,
        done: 0,
        skipped: 0,
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
      routine,
      taskStats,
    };
  },
});

// Get routine by slug with task stats
export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const routine = await ctx.db
      .query("contentRoutines")
      .withIndex("by_user_slug", (q) =>
        q.eq("userId", userId).eq("slug", args.slug),
      )
      .first();

    if (!routine) return null;

    // Get project info
    const project = routine.projectId
      ? await ctx.db.get(routine.projectId)
      : null;

    // Get tasks for this routine
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("contentId"), routine._id),
          q.eq(q.field("contentType"), "routine"),
        ),
      )
      .collect();

    // Calculate task stats
    const taskStats = {
      total: tasks.length,
      byStatus: {
        todo: 0,
        doing: 0,
        done: 0,
        skipped: 0,
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
      routine,
      project,
      taskStats,
    };
  },
});

// Get routines by project
export const getByProject = query({
  args: {
    projectId: v.id("projects"),
    search: v.optional(v.string()),
    status: v.optional(v.array(v.string())),
    platform: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    let routines = await ctx.db
      .query("contentRoutines")
      .withIndex("by_user_project", (q) =>
        q.eq("userId", userId).eq("projectId", args.projectId),
      )
      .collect();

    // Apply filters
    if (args.search) {
      routines = routines.filter((r) =>
        r.title.toLowerCase().includes(args.search!.toLowerCase()),
      );
    }

    if (args.status?.length) {
      routines = routines.filter((r) => args.status!.includes(r.status));
    }

    if (args.platform?.length) {
      routines = routines.filter((r) => args.platform!.includes(r.platform));
    }

    return routines;
  },
});

// Get routines by project with stats
export const getByProjectWithStats = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const routines = await ctx.db
      .query("contentRoutines")
      .withIndex("by_user_project", (q) =>
        q.eq("userId", userId).eq("projectId", args.projectId),
      )
      .collect();

    const stats = {
      total: routines.length,
      byStatus: {
        plan: 0,
        in_progress: 0,
        scheduled: 0,
        published: 0,
      },
      byPlatform: {} as Record<string, number>,
    };

    routines.forEach((routine) => {
      stats.byStatus[routine.status]++;
      stats.byPlatform[routine.platform] =
        (stats.byPlatform[routine.platform] || 0) + 1;
    });

    return {
      routines,
      stats,
    };
  },
});

// Internal queries for migration
export const getWithoutSlugs = query({
  args: {},
  handler: async (ctx) => {
    const routines = await ctx.db.query("contentRoutines").collect();
    return routines.filter((r) => !r.slug);
  },
});

export const getAllSlugsForUser = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const routines = await ctx.db
      .query("contentRoutines")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    return routines.map((r) => r.slug).filter(Boolean);
  },
});
