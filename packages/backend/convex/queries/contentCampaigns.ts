import { query } from "../_generated/server";
import { v } from "convex/values";
import { getUserId } from "../schema";

export const list = query({
  args: {
    projectId: v.optional(v.id("projects")),
    status: v.optional(v.array(v.string())),
    platform: v.optional(v.array(v.string())),
    types: v.optional(v.array(v.string())),
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
        .query("contentCampaigns")
        .withIndex("by_user_project", (q) =>
          q.eq("userId", userId!).eq("projectId", args.projectId!),
        );
    } else if (args.status?.length === 1) {
      q = ctx.db
        .query("contentCampaigns")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", userId!).eq("status", args.status![0] as any),
        );
    } else if (args.platform?.length === 1) {
      q = ctx.db
        .query("contentCampaigns")
        .withIndex("by_user_platform", (q) =>
          q.eq("userId", userId!).eq("platform", args.platform![0] as any),
        );
    } else {
      q = ctx.db
        .query("contentCampaigns")
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

    if (args.types?.length) {
      q = q.filter((q) =>
        q.or(...args.types!.map((type) => q.eq(q.field("type"), type))),
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

// Get campaign statistics
export const getStats = query({
  args: {
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    let campaigns = await ctx.db
      .query("contentCampaigns")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Filter by project if specified
    if (args.projectId) {
      campaigns = campaigns.filter((c) => c.projectId === args.projectId);
    }

    const stats = {
      total: campaigns.length,
      byStatus: {
        product_obtained: 0,
        production: 0,
        published: 0,
        payment: 0,
        done: 0,
      },
      byPlatform: {} as Record<string, number>,
      byType: {
        barter: 0,
        paid: 0,
      },
      withSow: 0,
      withNotes: 0,
      recentlyCreated: 0, // Last 7 days
      recentlyUpdated: 0, // Last 7 days
    };

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    campaigns.forEach((campaign) => {
      // Count by status
      stats.byStatus[campaign.status]++;

      // Count by platform
      stats.byPlatform[campaign.platform] =
        (stats.byPlatform[campaign.platform] || 0) + 1;

      // Count by type
      stats.byType[campaign.type]++;

      // Count with optional fields
      if (campaign.sow) stats.withSow++;
      if (campaign.notes) stats.withNotes++;

      // Count recent activity
      if (campaign.createdAt >= sevenDaysAgo) stats.recentlyCreated++;
      if (campaign.updatedAt >= sevenDaysAgo) stats.recentlyUpdated++;
    });

    return stats;
  },
});

// Get campaign by ID with task stats
export const getById = query({
  args: {
    campaignId: v.id("contentCampaigns"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || campaign.userId !== userId) return null;

    // Get tasks for this campaign
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("contentId"), args.campaignId),
          q.eq(q.field("contentType"), "campaign"),
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
      campaign,
      taskStats,
    };
  },
});

// Get campaign by slug with task stats
export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const campaign = await ctx.db
      .query("contentCampaigns")
      .withIndex("by_user_slug", (q) =>
        q.eq("userId", userId).eq("slug", args.slug),
      )
      .first();

    if (!campaign) return null;

    // Get project info
    const project = campaign.projectId
      ? await ctx.db.get(campaign.projectId)
      : null;

    // Get tasks for this campaign
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("contentId"), campaign._id),
          q.eq(q.field("contentType"), "campaign"),
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
      campaign,
      project,
      taskStats,
    };
  },
});

// Get campaigns by project
export const getByProject = query({
  args: {
    projectId: v.id("projects"),
    search: v.optional(v.string()),
    status: v.optional(v.array(v.string())),
    types: v.optional(v.array(v.string())),
    platform: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    let campaigns = await ctx.db
      .query("contentCampaigns")
      .withIndex("by_user_project", (q) =>
        q.eq("userId", userId).eq("projectId", args.projectId),
      )
      .collect();

    // Apply filters
    if (args.search) {
      campaigns = campaigns.filter((c) =>
        c.title.toLowerCase().includes(args.search!.toLowerCase()),
      );
    }

    if (args.status?.length) {
      campaigns = campaigns.filter((c) => args.status!.includes(c.status));
    }

    if (args.types?.length) {
      campaigns = campaigns.filter((c) => args.types!.includes(c.type));
    }

    if (args.platform?.length) {
      campaigns = campaigns.filter((c) => args.platform!.includes(c.platform));
    }

    return campaigns;
  },
});

// Get campaigns by project with stats
export const getByProjectWithStats = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const campaigns = await ctx.db
      .query("contentCampaigns")
      .withIndex("by_user_project", (q) =>
        q.eq("userId", userId).eq("projectId", args.projectId),
      )
      .collect();

    const stats = {
      total: campaigns.length,
      byStatus: {
        product_obtained: 0,
        production: 0,
        published: 0,
        payment: 0,
        done: 0,
      },
      byPlatform: {} as Record<string, number>,
      byType: {
        barter: 0,
        paid: 0,
      },
    };

    campaigns.forEach((campaign) => {
      stats.byStatus[campaign.status]++;
      stats.byPlatform[campaign.platform] =
        (stats.byPlatform[campaign.platform] || 0) + 1;
      stats.byType[campaign.type]++;
    });

    return {
      campaigns,
      stats,
    };
  },
});

// Internal queries for migration
export const getWithoutSlugs = query({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.db.query("contentCampaigns").collect();
    return campaigns.filter((c) => !c.slug);
  },
});

export const getAllSlugsForUser = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const campaigns = await ctx.db
      .query("contentCampaigns")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    return campaigns.map((c) => c.slug).filter(Boolean);
  },
});

// Get campaigns for calendar view with scheduled and published dates
export const getForCalendar = query({
  args: {
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    let campaigns = await ctx.db
      .query("contentCampaigns")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Filter by project if specified
    if (args.projectId) {
      campaigns = campaigns.filter((c) => c.projectId === args.projectId);
    }

    // Get scheduled publishes for these campaigns
    const campaignIds = campaigns.map((c) => c._id);
    const schedules = await Promise.all(
      campaignIds.map((id) =>
        ctx.db
          .query("scheduledPublishes")
          .withIndex("by_content", (q) =>
            q.eq("contentType", "campaign").eq("contentId", id),
          )
          .collect(),
      ),
    );

    // Flatten schedules
    const allSchedules = schedules.flat();

    // Combine campaigns with their schedules
    return campaigns.map((campaign) => {
      const campaignSchedules = allSchedules.filter(
        (s) => s.contentId === campaign._id,
      );

      // Get scheduled dates (future)
      const scheduledDates = campaignSchedules
        .filter((s) => s.status === "pending" || s.status === "processing")
        .map((s) => ({
          date: s.scheduledAt,
          type: "scheduled" as const,
          platform: s.platform,
          status: s.status,
        }));

      // Get published dates (past)
      const publishedDates = campaignSchedules
        .filter((s) => s.status === "published" && s.publishedAt)
        .map((s) => ({
          date: new Date(s.publishedAt!).toISOString(),
          type: "published" as const,
          platform: s.platform,
          status: s.status,
        }));

      // Also check publishInfo.publishedAt
      if (campaign.publishInfo?.publishedAt) {
        publishedDates.push({
          date: campaign.publishInfo.publishedAt,
          type: "published" as const,
          platform: campaign.platform,
          status: "published",
        });
      }

      // Check statusHistory for publishedAt
      campaign.statusHistory.forEach((history) => {
        if (history.publishedAt && !publishedDates.some((d) => d.date === history.publishedAt)) {
          publishedDates.push({
            date: history.publishedAt,
            type: "published" as const,
            platform: campaign.platform,
            status: campaign.status,
          });
        }
      });

      return {
        ...campaign,
        calendarEvents: [...scheduledDates, ...publishedDates],
      };
    });
  },
});
