import { query } from "../_generated/server";
import { v } from "convex/values";
import { getUserId } from "../schema";

// Get latest stats for an account
export const getLatestByAccount = query({
  args: {
    accountId: v.id("socialMediaAccounts"),
  },
  handler: async (ctx, { accountId }) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    // Verify account belongs to user
    const account = await ctx.db.get(accountId);
    if (!account || account.userId !== userId) return null;

    const stats = await ctx.db
      .query("socialMediaStats")
      .withIndex("by_account", (q) => q.eq("accountId", accountId))
      .order("desc")
      .first();

    return stats;
  },
});

// Get stats history for an account
export const getHistoryByAccount = query({
  args: {
    accountId: v.id("socialMediaAccounts"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { accountId, limit = 30 }) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    // Verify account belongs to user
    const account = await ctx.db.get(accountId);
    if (!account || account.userId !== userId) return [];

    const stats = await ctx.db
      .query("socialMediaStats")
      .withIndex("by_account", (q) => q.eq("accountId", accountId))
      .order("desc")
      .take(limit);

    return stats;
  },
});

// Get latest stats for all user's accounts
export const getLatestForAllAccounts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const accounts = await ctx.db
      .query("socialMediaAccounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const statsPromises = accounts.map(async (account) => {
      const latestStats = await ctx.db
        .query("socialMediaStats")
        .withIndex("by_account", (q) => q.eq("accountId", account._id))
        .order("desc")
        .first();

      return {
        accountId: account._id,
        platform: account.platform,
        displayName: account.displayName,
        stats: latestStats,
      };
    });

    return await Promise.all(statsPromises);
  },
});

// Get stats by platform
export const getByPlatform = query({
  args: {
    platform: v.union(
      v.literal("tiktok"),
      v.literal("instagram"),
      v.literal("youtube"),
      v.literal("x"),
      v.literal("facebook"),
      v.literal("threads"),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { platform, limit = 30 }) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const stats = await ctx.db
      .query("socialMediaStats")
      .withIndex("by_user_platform", (q) =>
        q.eq("userId", userId).eq("platform", platform),
      )
      .order("desc")
      .take(limit);

    return stats;
  },
});

// Get aggregate stats summary
export const getSummary = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const accounts = await ctx.db
      .query("socialMediaAccounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const summary = {
      totalFollowers: 0,
      totalFollowing: 0,
      byPlatform: {} as Record<
        string,
        {
          followersCount: number;
          followingCount: number;
          platformMetrics?: any;
          lastSynced?: number;
        }
      >,
    };

    for (const account of accounts) {
      const latestStats = await ctx.db
        .query("socialMediaStats")
        .withIndex("by_account", (q) => q.eq("accountId", account._id))
        .order("desc")
        .first();

      if (latestStats) {
        summary.totalFollowers += latestStats.followersCount || 0;
        summary.totalFollowing += latestStats.followingCount || 0;

        summary.byPlatform[account.platform] = {
          followersCount: latestStats.followersCount || 0,
          followingCount: latestStats.followingCount || 0,
          platformMetrics: latestStats.platformMetrics,
          lastSynced: latestStats.syncedAt,
        };
      }
    }

    return summary;
  },
});

// Compare stats between two time periods
export const compareStats = query({
  args: {
    accountId: v.id("socialMediaAccounts"),
  },
  handler: async (ctx, { accountId }) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    // Verify account belongs to user
    const account = await ctx.db.get(accountId);
    if (!account || account.userId !== userId) return null;

    // Get latest and previous stats
    const stats = await ctx.db
      .query("socialMediaStats")
      .withIndex("by_account", (q) => q.eq("accountId", accountId))
      .order("desc")
      .take(2);

    if (stats.length === 0) return null;

    const latest = stats[0];
    const previous = stats.length > 1 ? stats[1] : null;

    if (!previous) {
      return {
        latest,
        previous: null,
        changes: null,
      };
    }

    const changes = {
      followersChange:
        (latest.followersCount || 0) - (previous.followersCount || 0),
      followingChange:
        (latest.followingCount || 0) - (previous.followingCount || 0),
      platformMetricsChanges: {} as Record<string, number>,
    };

    // Calculate platform metrics changes
    if (latest.platformMetrics && previous.platformMetrics) {
      Object.keys(latest.platformMetrics).forEach((key) => {
        const latestValue = (latest.platformMetrics as any)[key] || 0;
        const previousValue = (previous.platformMetrics as any)[key] || 0;
        changes.platformMetricsChanges[key] = latestValue - previousValue;
      });
    }

    return {
      latest,
      previous,
      changes,
    };
  },
});
