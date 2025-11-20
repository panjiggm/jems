import { query } from "../_generated/server";
import { v } from "convex/values";
import { getUserId } from "../schema";
import { Id } from "../_generated/dataModel";

/**
 * Get comprehensive dashboard overview
 * Combines social media stats, content pipeline, tasks, and revenue tracking
 */
export const getDashboardOverview = query({
  args: {
    days: v.optional(v.number()), // Days to look back for recent activity
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const days = args.days ?? 7;
    const timeAgo = Date.now() - days * 24 * 60 * 60 * 1000;
    const today = new Date().toISOString().split("T")[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Fetch all data in parallel
    const [
      accounts,
      campaigns,
      routines,
      tasks,
      scheduledPublishes,
      contentIdeas,
      projects,
    ] = await Promise.all([
      ctx.db
        .query("socialMediaAccounts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("contentCampaigns")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("contentRoutines")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("tasks")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("scheduledPublishes")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("contentIdeas")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", userId).eq("status", "suggestion"),
        )
        .collect(),
      ctx.db
        .query("projects")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
    ]);

    // Get latest social media stats for each account
    const socialMediaStatsPromises = accounts.map(async (account) => {
      const latestStats = await ctx.db
        .query("socialMediaStats")
        .withIndex("by_account", (q) => q.eq("accountId", account._id))
        .order("desc")
        .first();

      return {
        account,
        stats: latestStats,
      };
    });

    const socialMediaData = await Promise.all(socialMediaStatsPromises);

    // Calculate social media overview
    const socialMediaOverview = {
      totalAccounts: accounts.length,
      connectedAccounts: accounts.filter((a) => a.isConnected).length,
      totalFollowers: 0,
      totalFollowing: 0,
      byPlatform: {} as Record<
        string,
        {
          followers: number;
          following: number;
          connected: boolean;
          platformMetrics?: any;
        }
      >,
    };

    socialMediaData.forEach(({ account, stats }) => {
      const followers = stats?.followersCount || 0;
      const following = stats?.followingCount || 0;

      socialMediaOverview.totalFollowers += followers;
      socialMediaOverview.totalFollowing += following;

      socialMediaOverview.byPlatform[account.platform] = {
        followers,
        following,
        connected: account.isConnected,
        platformMetrics: stats?.platformMetrics,
      };
    });

    // Calculate content pipeline
    const contentPipeline = {
      campaigns: {
        total: campaigns.length,
        byStatus: {
          product_obtained: 0,
          production: 0,
          published: 0,
          payment: 0,
          done: 0,
        },
        byType: {
          barter: 0,
          paid: 0,
        },
        byPlatform: {} as Record<string, number>,
      },
      routines: {
        total: routines.length,
        byStatus: {
          plan: 0,
          in_progress: 0,
          scheduled: 0,
          published: 0,
        },
        byPlatform: {} as Record<string, number>,
      },
      total: campaigns.length + routines.length,
      byPlatform: {} as Record<string, number>,
    };

    campaigns.forEach((campaign) => {
      contentPipeline.campaigns.byStatus[campaign.status]++;
      contentPipeline.campaigns.byType[campaign.type]++;
      contentPipeline.campaigns.byPlatform[campaign.platform] =
        (contentPipeline.campaigns.byPlatform[campaign.platform] || 0) + 1;
      contentPipeline.byPlatform[campaign.platform] =
        (contentPipeline.byPlatform[campaign.platform] || 0) + 1;
    });

    routines.forEach((routine) => {
      contentPipeline.routines.byStatus[routine.status]++;
      contentPipeline.routines.byPlatform[routine.platform] =
        (contentPipeline.routines.byPlatform[routine.platform] || 0) + 1;
      contentPipeline.byPlatform[routine.platform] =
        (contentPipeline.byPlatform[routine.platform] || 0) + 1;
    });

    // Calculate upcoming scheduled publishes (next 7 days)
    const now = new Date();
    const nextWeekDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingSchedules = scheduledPublishes.filter((schedule) => {
      const scheduledTime = new Date(schedule.scheduledAt);
      return (
        schedule.status === "pending" &&
        scheduledTime >= now &&
        scheduledTime <= nextWeekDate
      );
    });

    // Calculate recent publishes (last 7 days)
    const recentPublishes = scheduledPublishes.filter((schedule) => {
      return (
        schedule.status === "published" &&
        schedule.publishedAt &&
        schedule.publishedAt >= timeAgo
      );
    });

    // Calculate tasks overview
    const tasksOverview = {
      total: tasks.length,
      byStatus: {
        todo: 0,
        doing: 0,
        done: 0,
        skipped: 0,
      },
      overdue: 0,
      upcoming: 0,
      completionRate: 0,
    };

    tasks.forEach((task) => {
      tasksOverview.byStatus[task.status]++;
      if (task.dueDate) {
        if (task.dueDate < today && task.status !== "done") {
          tasksOverview.overdue++;
        }
        if (task.dueDate >= today && task.dueDate <= nextWeek) {
          tasksOverview.upcoming++;
        }
      }
    });

    if (tasksOverview.total > 0) {
      tasksOverview.completionRate = Math.round(
        (tasksOverview.byStatus.done / tasksOverview.total) * 100,
      );
    }

    // Calculate revenue tracking (paid campaigns)
    const paidCampaigns = campaigns.filter((c) => c.type === "paid");
    const revenueTracking = {
      totalPaidCampaigns: paidCampaigns.length,
      byPaymentStatus: {
        product_obtained: 0,
        production: 0,
        published: 0,
        payment: 0,
        done: 0,
      },
      inPaymentStage: 0,
      completed: 0,
    };

    paidCampaigns.forEach((campaign) => {
      revenueTracking.byPaymentStatus[campaign.status]++;
      if (campaign.status === "payment") {
        revenueTracking.inPaymentStage++;
      }
      if (campaign.status === "done") {
        revenueTracking.completed++;
      }
    });

    // Calculate recent activity
    const recentActivity = {
      recentProjects: projects.filter((p) => p.createdAt >= timeAgo).length,
      recentCampaigns: campaigns.filter((c) => c.createdAt >= timeAgo).length,
      recentRoutines: routines.filter((r) => r.createdAt >= timeAgo).length,
      recentTasks: tasks.filter((t) => t.createdAt >= timeAgo).length,
      recentPublishes: recentPublishes.length,
    };

    return {
      socialMedia: socialMediaOverview,
      contentPipeline,
      tasks: tasksOverview,
      revenue: revenueTracking,
      upcomingSchedules: {
        count: upcomingSchedules.length,
        items: upcomingSchedules.slice(0, 10), // Limit to 10 for overview
      },
      recentPublishes: {
        count: recentPublishes.length,
        items: recentPublishes.slice(0, 10), // Limit to 10 for overview
      },
      contentIdeas: {
        activeSuggestions: contentIdeas.length,
        items: contentIdeas.slice(0, 5), // Limit to 5 for overview
      },
      recentActivity,
      summary: {
        totalProjects: projects.length,
        totalContent: contentPipeline.total,
        totalTasks: tasksOverview.total,
        totalAccounts: socialMediaOverview.totalAccounts,
        activeSuggestions: contentIdeas.length,
        upcomingPublishes: upcomingSchedules.length,
      },
    };
  },
});

/**
 * Get social media performance overview
 * Latest stats per platform with growth comparison
 */
export const getSocialMediaOverview = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    // Get all accounts
    const accounts = await ctx.db
      .query("socialMediaAccounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get latest and previous stats for each account
    const platformData = await Promise.all(
      accounts.map(async (account) => {
        const stats = await ctx.db
          .query("socialMediaStats")
          .withIndex("by_account", (q) => q.eq("accountId", account._id))
          .order("desc")
          .take(2);

        const latest = stats[0] || null;
        const previous = stats[1] || null;

        // Calculate growth
        const growth = {
          followersChange: 0,
          followingChange: 0,
          platformMetricsChanges: {} as Record<string, number>,
        };

        if (latest && previous) {
          growth.followersChange =
            (latest.followersCount || 0) - (previous.followersCount || 0);
          growth.followingChange =
            (latest.followingCount || 0) - (previous.followingCount || 0);

          // Calculate platform metrics changes
          if (latest.platformMetrics && previous.platformMetrics) {
            Object.keys(latest.platformMetrics).forEach((key) => {
              const latestValue = (latest.platformMetrics as any)[key] || 0;
              const previousValue = (previous.platformMetrics as any)[key] || 0;
              growth.platformMetricsChanges[key] = latestValue - previousValue;
            });
          }
        }

        return {
          account,
          latestStats: latest,
          previousStats: previous,
          growth,
        };
      }),
    );

    // Calculate totals
    const totals = {
      followers: 0,
      following: 0,
      totalAccounts: accounts.length,
      connectedAccounts: accounts.filter((a) => a.isConnected).length,
    };

    platformData.forEach(({ latestStats }) => {
      if (latestStats) {
        totals.followers += latestStats.followersCount || 0;
        totals.following += latestStats.followingCount || 0;
      }
    });

    // Group by platform
    const byPlatform = {} as Record<
      string,
      {
        account: (typeof accounts)[0];
        latestStats: (typeof platformData)[0]["latestStats"];
        growth: (typeof platformData)[0]["growth"];
        engagementRate?: number;
      }
    >;

    platformData.forEach((data) => {
      const platform = data.account.platform;
      const engagementRate =
        data.latestStats?.platformMetrics?.engagementRate || undefined;

      byPlatform[platform] = {
        account: data.account,
        latestStats: data.latestStats,
        growth: data.growth,
        engagementRate,
      };
    });

    return {
      totals,
      byPlatform,
      platforms: platformData,
    };
  },
});

/**
 * Get content pipeline overview
 * Content workflow status breakdown
 */
export const getContentPipeline = query({
  args: {
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    // Build queries based on projectId filter
    let campaignsQuery = ctx.db
      .query("contentCampaigns")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    let routinesQuery = ctx.db
      .query("contentRoutines")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    if (args.projectId) {
      campaignsQuery = ctx.db
        .query("contentCampaigns")
        .withIndex("by_user_project", (q) =>
          q.eq("userId", userId).eq("projectId", args.projectId!),
        );

      routinesQuery = ctx.db
        .query("contentRoutines")
        .withIndex("by_user_project", (q) =>
          q.eq("userId", userId).eq("projectId", args.projectId!),
        );
    }

    const [campaigns, routines, scheduledPublishes] = await Promise.all([
      campaignsQuery.collect(),
      routinesQuery.collect(),
      ctx.db
        .query("scheduledPublishes")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
    ]);

    // Calculate campaigns by status
    const campaignsByStatus = {
      product_obtained: 0,
      production: 0,
      published: 0,
      payment: 0,
      done: 0,
    };

    campaigns.forEach((campaign) => {
      campaignsByStatus[campaign.status]++;
    });

    // Calculate routines by status
    const routinesByStatus = {
      plan: 0,
      in_progress: 0,
      scheduled: 0,
      published: 0,
    };

    routines.forEach((routine) => {
      routinesByStatus[routine.status]++;
    });

    // Get upcoming scheduled publishes (next 7 days)
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingPublishes = scheduledPublishes.filter((schedule) => {
      const scheduledTime = new Date(schedule.scheduledAt);
      return (
        schedule.status === "pending" &&
        scheduledTime >= now &&
        scheduledTime <= nextWeek
      );
    });

    // Get recent publishes (last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentPublishes = scheduledPublishes.filter((schedule) => {
      return (
        schedule.status === "published" &&
        schedule.publishedAt &&
        schedule.publishedAt >= sevenDaysAgo
      );
    });

    // Calculate content distribution by platform
    const byPlatform = {} as Record<
      string,
      {
        campaigns: number;
        routines: number;
        total: number;
        published: number;
        scheduled: number;
      }
    >;

    campaigns.forEach((campaign) => {
      if (!byPlatform[campaign.platform]) {
        byPlatform[campaign.platform] = {
          campaigns: 0,
          routines: 0,
          total: 0,
          published: 0,
          scheduled: 0,
        };
      }
      byPlatform[campaign.platform].campaigns++;
      byPlatform[campaign.platform].total++;
      if (campaign.status === "published") {
        byPlatform[campaign.platform].published++;
      }
    });

    routines.forEach((routine) => {
      if (!byPlatform[routine.platform]) {
        byPlatform[routine.platform] = {
          campaigns: 0,
          routines: 0,
          total: 0,
          published: 0,
          scheduled: 0,
        };
      }
      byPlatform[routine.platform].routines++;
      byPlatform[routine.platform].total++;
      if (routine.status === "published") {
        byPlatform[routine.platform].published++;
      }
      if (routine.status === "scheduled") {
        byPlatform[routine.platform].scheduled++;
      }
    });

    // Count scheduled publishes by platform
    scheduledPublishes.forEach((schedule) => {
      if (!byPlatform[schedule.platform]) {
        byPlatform[schedule.platform] = {
          campaigns: 0,
          routines: 0,
          total: 0,
          published: 0,
          scheduled: 0,
        };
      }
      if (schedule.status === "pending") {
        byPlatform[schedule.platform].scheduled++;
      }
      if (schedule.status === "published") {
        byPlatform[schedule.platform].published++;
      }
    });

    return {
      campaigns: {
        total: campaigns.length,
        byStatus: campaignsByStatus,
        byType: {
          barter: campaigns.filter((c) => c.type === "barter").length,
          paid: campaigns.filter((c) => c.type === "paid").length,
        },
      },
      routines: {
        total: routines.length,
        byStatus: routinesByStatus,
      },
      total: campaigns.length + routines.length,
      byPlatform,
      upcomingPublishes: {
        count: upcomingPublishes.length,
        items: upcomingPublishes.slice(0, 20), // Limit to 20
      },
      recentPublishes: {
        count: recentPublishes.length,
        items: recentPublishes.slice(0, 20), // Limit to 20
      },
    };
  },
});

/**
 * Get revenue overview for paid campaigns
 * Track payment status and pipeline health
 */
export const getRevenueOverview = query({
  args: {
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    let campaignsQuery = ctx.db
      .query("contentCampaigns")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    if (args.projectId) {
      campaignsQuery = ctx.db
        .query("contentCampaigns")
        .withIndex("by_user_project", (q) =>
          q.eq("userId", userId).eq("projectId", args.projectId!),
        );
    }

    const campaigns = await campaignsQuery.collect();

    // Filter only paid campaigns
    const paidCampaigns = campaigns.filter((c) => c.type === "paid");

    // Calculate by payment status
    const byPaymentStatus = {
      product_obtained: 0,
      production: 0,
      published: 0,
      payment: 0,
      done: 0,
    };

    paidCampaigns.forEach((campaign) => {
      byPaymentStatus[campaign.status]++;
    });

    // Calculate average time per stage
    const stageDurations = {
      product_obtained_to_production: [] as number[],
      production_to_published: [] as number[],
      published_to_payment: [] as number[],
      payment_to_done: [] as number[],
    };

    paidCampaigns.forEach((campaign) => {
      if (campaign.statusDurations) {
        const durations = campaign.statusDurations;

        if (durations.product_obtained_to_production) {
          // Parse duration string (e.g., "5 days", "2 weeks")
          const days = parseDurationToDays(
            durations.product_obtained_to_production,
          );
          if (days > 0) {
            stageDurations.product_obtained_to_production.push(days);
          }
        }

        if (durations.production_to_published) {
          const days = parseDurationToDays(durations.production_to_published);
          if (days > 0) {
            stageDurations.production_to_published.push(days);
          }
        }

        if (durations.published_to_payment) {
          const days = parseDurationToDays(durations.published_to_payment);
          if (days > 0) {
            stageDurations.published_to_payment.push(days);
          }
        }

        if (durations.payment_to_done) {
          const days = parseDurationToDays(durations.payment_to_done);
          if (days > 0) {
            stageDurations.payment_to_done.push(days);
          }
        }
      }
    });

    // Calculate averages
    const averageDurations = {
      product_obtained_to_production: calculateAverage(
        stageDurations.product_obtained_to_production,
      ),
      production_to_published: calculateAverage(
        stageDurations.production_to_published,
      ),
      published_to_payment: calculateAverage(
        stageDurations.published_to_payment,
      ),
      payment_to_done: calculateAverage(stageDurations.payment_to_done),
    };

    // Calculate pipeline health
    const pipelineHealth = {
      total: paidCampaigns.length,
      inProgress: byPaymentStatus.production + byPaymentStatus.published,
      awaitingPayment: byPaymentStatus.payment,
      completed: byPaymentStatus.done,
      completionRate:
        paidCampaigns.length > 0
          ? Math.round((byPaymentStatus.done / paidCampaigns.length) * 100)
          : 0,
      stuckInPayment: byPaymentStatus.payment, // Campaigns stuck in payment stage
    };

    return {
      totalPaidCampaigns: paidCampaigns.length,
      byPaymentStatus,
      averageDurations,
      pipelineHealth,
      campaigns: paidCampaigns.slice(0, 50), // Limit to 50 for overview
    };
  },
});

/**
 * Get upcoming scheduled publishes with full details
 */
export const getUpcomingSchedule = query({
  args: {
    days: v.optional(v.number()), // Days ahead to look (default 7)
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const days = args.days ?? 7;
    const limit = Math.min(args.limit ?? 20, 100);

    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    // Get upcoming scheduled publishes
    const schedules = await ctx.db
      .query("scheduledPublishes")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "pending"),
      )
      .filter((q) =>
        q.and(
          q.gte(q.field("scheduledAt"), now.toISOString()),
          q.lte(q.field("scheduledAt"), futureDate.toISOString()),
        ),
      )
      .collect();

    // Sort by scheduled time
    const sortedSchedules = schedules.sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );

    // Enrich with content and account info
    const enrichedSchedules = await Promise.all(
      sortedSchedules.slice(0, limit).map(async (schedule) => {
        const [account, content] = await Promise.all([
          ctx.db.get(schedule.accountId),
          ctx.db.get(
            schedule.contentId as Id<"contentCampaigns" | "contentRoutines">,
          ),
        ]);

        // Get project info if content exists
        let project = null;
        if (content && "projectId" in content) {
          project = await ctx.db.get(content.projectId);
        }

        return {
          schedule,
          account,
          content,
          project,
        };
      }),
    );

    return {
      count: sortedSchedules.length,
      days,
      items: enrichedSchedules,
    };
  },
});

/**
 * Get recent publishes performance
 * Success rate, failed publishes, platform distribution
 */
export const getRecentPerformance = query({
  args: {
    days: v.optional(v.number()), // Days to look back (default 30)
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const days = args.days ?? 30;
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

    // Get all scheduled publishes in the time range
    const schedules = await ctx.db
      .query("scheduledPublishes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.or(
          q.and(
            q.eq(q.field("status"), "published"),
            q.gte(q.field("publishedAt"), cutoffTime),
          ),
          q.and(
            q.eq(q.field("status"), "failed"),
            q.gte(q.field("createdAt"), cutoffTime),
          ),
        ),
      )
      .collect();

    // Separate published and failed
    const published = schedules.filter((s) => s.status === "published");
    const failed = schedules.filter((s) => s.status === "failed");

    // Calculate success rate
    const totalAttempts = published.length + failed.length;
    const successRate =
      totalAttempts > 0
        ? Math.round((published.length / totalAttempts) * 100)
        : 0;

    // Group by platform
    const byPlatform = {} as Record<
      string,
      {
        published: number;
        failed: number;
        successRate: number;
        total: number;
      }
    >;

    schedules.forEach((schedule) => {
      if (!byPlatform[schedule.platform]) {
        byPlatform[schedule.platform] = {
          published: 0,
          failed: 0,
          successRate: 0,
          total: 0,
        };
      }

      byPlatform[schedule.platform].total++;
      if (schedule.status === "published") {
        byPlatform[schedule.platform].published++;
      } else if (schedule.status === "failed") {
        byPlatform[schedule.platform].failed++;
      }
    });

    // Calculate success rate per platform
    Object.keys(byPlatform).forEach((platform) => {
      const platformData = byPlatform[platform];
      platformData.successRate =
        platformData.total > 0
          ? Math.round((platformData.published / platformData.total) * 100)
          : 0;
    });

    // Get failed publishes with error details
    const failedWithDetails = failed.map((schedule) => ({
      schedule,
      errorMessage: schedule.errorMessage || "Unknown error",
      retryCount: schedule.retryCount || 0,
      scheduledAt: schedule.scheduledAt,
    }));

    return {
      period: {
        days,
        startDate: new Date(cutoffTime).toISOString(),
        endDate: new Date().toISOString(),
      },
      summary: {
        totalAttempts,
        published: published.length,
        failed: failed.length,
        successRate,
      },
      byPlatform,
      failedPublishes: failedWithDetails.slice(0, 20), // Limit to 20
      recentPublished: published
        .sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0))
        .slice(0, 20), // Limit to 20
    };
  },
});

// Helper function to parse duration string to days
function parseDurationToDays(duration: string): number {
  const lower = duration.toLowerCase().trim();
  const daysMatch = lower.match(/(\d+)\s*days?/);
  const weeksMatch = lower.match(/(\d+)\s*weeks?/);
  const monthsMatch = lower.match(/(\d+)\s*months?/);

  if (daysMatch) {
    return parseInt(daysMatch[1], 10);
  }
  if (weeksMatch) {
    return parseInt(weeksMatch[1], 10) * 7;
  }
  if (monthsMatch) {
    return parseInt(monthsMatch[1], 10) * 30;
  }

  return 0;
}

// Helper function to calculate average
function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / numbers.length) * 100) / 100; // Round to 2 decimal places
}
