import { query } from "../_generated/server";
import { v } from "convex/values";
import { getUserId } from "../schema";

// Get comprehensive dashboard statistics
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    // Get all data
    const [projects, contents, tasks] = await Promise.all([
      ctx.db
        .query("projects")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("contents")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("tasks")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
    ]);

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const today = new Date().toISOString().split("T")[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Calculate project stats
    const projectStats = {
      total: projects.length,
      byType: {
        campaign: 0,
        series: 0,
        routine: 0,
      },
      recentlyCreated: 0,
      recentlyUpdated: 0,
    };

    projects.forEach((project) => {
      projectStats.byType[project.type]++;
      if (project.createdAt >= sevenDaysAgo) projectStats.recentlyCreated++;
      if (project.updatedAt >= sevenDaysAgo) projectStats.recentlyUpdated++;
    });

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
      recentlyCreated: 0,
      recentlyUpdated: 0,
      overdue: 0,
      upcoming: 0,
    };

    contents.forEach((content) => {
      contentStats.byStatus[content.status]++;
      contentStats.byPlatform[content.platform] =
        (contentStats.byPlatform[content.platform] || 0) + 1;
      if (content.createdAt >= sevenDaysAgo) contentStats.recentlyCreated++;
      if (content.updatedAt >= sevenDaysAgo) contentStats.recentlyUpdated++;
      if (content.dueDate) {
        if (content.dueDate < today && content.status !== "published") {
          contentStats.overdue++;
        }
        if (content.dueDate >= today && content.dueDate <= nextWeek) {
          contentStats.upcoming++;
        }
      }
    });

    // Calculate task stats
    const taskStats = {
      total: tasks.length,
      byStatus: {
        todo: 0,
        doing: 0,
        done: 0,
      },
      recentlyCreated: 0,
      recentlyUpdated: 0,
      overdue: 0,
      upcoming: 0,
      completionRate: 0,
    };

    tasks.forEach((task) => {
      taskStats.byStatus[task.status]++;
      if (task.createdAt >= sevenDaysAgo) taskStats.recentlyCreated++;
      if (task.updatedAt >= sevenDaysAgo) taskStats.recentlyUpdated++;
      if (task.dueDate) {
        if (task.dueDate < today && task.status !== "done") {
          taskStats.overdue++;
        }
        if (task.dueDate >= today && task.dueDate <= nextWeek) {
          taskStats.upcoming++;
        }
      }
    });

    // Calculate completion rate
    if (taskStats.total > 0) {
      taskStats.completionRate = Math.round(
        (taskStats.byStatus.done / taskStats.total) * 100,
      );
    }

    // Calculate productivity metrics
    const productivity = {
      totalActivities:
        projectStats.recentlyCreated +
        contentStats.recentlyCreated +
        taskStats.recentlyCreated,
      contentPublishRate:
        contentStats.total > 0
          ? Math.round(
              (contentStats.byStatus.published / contentStats.total) * 100,
            )
          : 0,
      taskCompletionRate: taskStats.completionRate,
      overdueItems: contentStats.overdue + taskStats.overdue,
      upcomingItems: contentStats.upcoming + taskStats.upcoming,
    };

    return {
      projects: projectStats,
      contents: contentStats,
      tasks: taskStats,
      productivity,
      summary: {
        totalProjects: projectStats.total,
        totalContents: contentStats.total,
        totalTasks: taskStats.total,
        totalOverdue: productivity.overdueItems,
        totalUpcoming: productivity.upcomingItems,
      },
    };
  },
});

// Get project-specific comprehensive stats
export const getProjectStats = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) return null;

    // Get contents and tasks for this project
    const [contents, tasks] = await Promise.all([
      ctx.db
        .query("contents")
        .withIndex("by_user_project", (q) =>
          q.eq("userId", userId).eq("projectId", args.projectId),
        )
        .collect(),
      ctx.db
        .query("tasks")
        .withIndex("by_user_project", (q) =>
          q.eq("userId", userId).eq("projectId", args.projectId),
        )
        .collect(),
    ]);

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const today = new Date().toISOString().split("T")[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

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
      recentlyCreated: 0,
      recentlyUpdated: 0,
      overdue: 0,
      upcoming: 0,
    };

    contents.forEach((content) => {
      contentStats.byStatus[content.status]++;
      contentStats.byPlatform[content.platform] =
        (contentStats.byPlatform[content.platform] || 0) + 1;
      if (content.createdAt >= sevenDaysAgo) contentStats.recentlyCreated++;
      if (content.updatedAt >= sevenDaysAgo) contentStats.recentlyUpdated++;
      if (content.dueDate) {
        if (content.dueDate < today && content.status !== "published") {
          contentStats.overdue++;
        }
        if (content.dueDate >= today && content.dueDate <= nextWeek) {
          contentStats.upcoming++;
        }
      }
    });

    // Calculate task stats
    const taskStats = {
      total: tasks.length,
      byStatus: {
        todo: 0,
        doing: 0,
        done: 0,
      },
      recentlyCreated: 0,
      recentlyUpdated: 0,
      overdue: 0,
      upcoming: 0,
      completionRate: 0,
    };

    tasks.forEach((task) => {
      taskStats.byStatus[task.status]++;
      if (task.createdAt >= sevenDaysAgo) taskStats.recentlyCreated++;
      if (task.updatedAt >= sevenDaysAgo) taskStats.recentlyUpdated++;
      if (task.dueDate) {
        if (task.dueDate < today && task.status !== "done") {
          taskStats.overdue++;
        }
        if (task.dueDate >= today && task.dueDate <= nextWeek) {
          taskStats.upcoming++;
        }
      }
    });

    // Calculate completion rate
    if (taskStats.total > 0) {
      taskStats.completionRate = Math.round(
        (taskStats.byStatus.done / taskStats.total) * 100,
      );
    }

    // Calculate project health
    const health = {
      contentPublishRate:
        contentStats.total > 0
          ? Math.round(
              (contentStats.byStatus.published / contentStats.total) * 100,
            )
          : 0,
      taskCompletionRate: taskStats.completionRate,
      overdueItems: contentStats.overdue + taskStats.overdue,
      upcomingItems: contentStats.upcoming + taskStats.upcoming,
      recentActivity: contentStats.recentlyCreated + taskStats.recentlyCreated,
    };

    return {
      project,
      contents: contentStats,
      tasks: taskStats,
      health,
      summary: {
        totalContents: contentStats.total,
        totalTasks: taskStats.total,
        totalOverdue: health.overdueItems,
        totalUpcoming: health.upcomingItems,
      },
    };
  },
});

// Get content-specific stats with tasks
export const getContentStats = query({
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

    const today = new Date().toISOString().split("T")[0];

    // Calculate task stats
    const taskStats = {
      total: tasks.length,
      byStatus: {
        todo: 0,
        doing: 0,
        done: 0,
      },
      overdue: 0,
      upcoming: 0,
      completionRate: 0,
    };

    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    tasks.forEach((task) => {
      taskStats.byStatus[task.status]++;
      if (task.dueDate) {
        if (task.dueDate < today && task.status !== "done") {
          taskStats.overdue++;
        }
        if (task.dueDate >= today && task.dueDate <= nextWeek) {
          taskStats.upcoming++;
        }
      }
    });

    // Calculate completion rate
    if (taskStats.total > 0) {
      taskStats.completionRate = Math.round(
        (taskStats.byStatus.done / taskStats.total) * 100,
      );
    }

    return {
      content,
      tasks: taskStats,
      summary: {
        totalTasks: taskStats.total,
        completedTasks: taskStats.byStatus.done,
        overdueTasks: taskStats.overdue,
        upcomingTasks: taskStats.upcoming,
        completionRate: taskStats.completionRate,
      },
    };
  },
});

// Get productivity trends (last 30 days)
export const getProductivityTrends = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const days = args.days ?? 30;
    const timeAgo = Date.now() - days * 24 * 60 * 60 * 1000;

    // Get recent activities
    const activities = await ctx.db
      .query("projectActivities")
      .withIndex("by_user_timestamp", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("timestamp"), timeAgo))
      .collect();

    // Group by day
    const trends = {} as Record<
      string,
      {
        projects: { created: number; updated: number };
        contents: { created: number; updated: number; published: number };
        tasks: { created: number; updated: number; completed: number };
      }
    >;

    activities.forEach((activity) => {
      const date = new Date(activity.timestamp).toISOString().split("T")[0];

      if (!trends[date]) {
        trends[date] = {
          projects: { created: 0, updated: 0 },
          contents: { created: 0, updated: 0, published: 0 },
          tasks: { created: 0, updated: 0, completed: 0 },
        };
      }

      const entityTrend =
        trends[date][activity.entityType as keyof (typeof trends)[typeof date]];

      if (activity.action === "created") {
        entityTrend.created++;
      } else if (activity.action === "updated") {
        entityTrend.updated++;
      } else if (activity.action === "published") {
        (entityTrend as any).published++;
      } else if (activity.action === "completed") {
        (entityTrend as any).completed++;
      }
    });

    return {
      trends,
      summary: {
        totalDays: days,
        totalActivities: activities.length,
        averagePerDay: Math.round(activities.length / days),
      },
    };
  },
});
