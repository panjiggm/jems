import { query } from "../_generated/server";
import { v } from "convex/values";
import { getUserId } from "../schema";
import { Id } from "../_generated/dataModel";

// List all scheduled publishes for current user
export const list = query({
  args: {
    status: v.optional(
      v.array(
        v.union(
          v.literal("pending"),
          v.literal("processing"),
          v.literal("published"),
          v.literal("failed"),
          v.literal("cancelled"),
        ),
      ),
    ),
    cursor: v.optional(v.string()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return { items: [], cursor: null, isDone: true };

    const pageSize = Math.min(args.pageSize ?? 20, 100);

    let q = ctx.db
      .query("scheduledPublishes")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    // Apply status filter
    if (args.status && args.status.length > 0) {
      q = q.filter((q) =>
        q.or(...args.status!.map((status) => q.eq(q.field("status"), status))),
      );
    }

    const { page, isDone, continueCursor } = await q.order("desc").paginate({
      cursor: args.cursor ?? null,
      numItems: pageSize,
    });

    return { items: page, cursor: continueCursor, isDone };
  },
});

// Get schedule by ID with content and account info
export const getById = query({
  args: {
    scheduleId: v.id("scheduledPublishes"),
  },
  handler: async (ctx, { scheduleId }) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const schedule = await ctx.db.get(scheduleId);
    if (!schedule || schedule.userId !== userId) return null;

    // Get account info
    const account = await ctx.db.get(schedule.accountId);

    // Get content info
    const content = await ctx.db.get(
      schedule.contentId as Id<"contentCampaigns" | "contentRoutines">,
    );

    return {
      schedule,
      account,
      content,
    };
  },
});

// Get schedules by content
export const getByContent = query({
  args: {
    contentType: v.union(v.literal("campaign"), v.literal("routine")),
    contentId: v.union(v.id("contentCampaigns"), v.id("contentRoutines")),
  },
  handler: async (ctx, { contentType, contentId }) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const schedules = await ctx.db
      .query("scheduledPublishes")
      .withIndex("by_content", (q) =>
        q
          .eq("contentType", contentType)
          .eq(
            "contentId",
            contentId as Id<"contentCampaigns" | "contentRoutines">,
          ),
      )
      .collect();

    // Filter by user
    return schedules.filter((s) => s.userId === userId);
  },
});

// Get schedules by account
export const getByAccount = query({
  args: {
    accountId: v.id("socialMediaAccounts"),
  },
  handler: async (ctx, { accountId }) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    // Verify account belongs to user
    const account = await ctx.db.get(accountId);
    if (!account || account.userId !== userId) return [];

    const schedules = await ctx.db
      .query("scheduledPublishes")
      .withIndex("by_account", (q) => q.eq("accountId", accountId))
      .order("desc")
      .collect();

    return schedules;
  },
});

// Get pending schedules that are due (for scheduled function)
export const getPendingDue = query({
  args: {},
  handler: async (ctx) => {
    const now = new Date().toISOString();

    const schedules = await ctx.db
      .query("scheduledPublishes")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .filter((q) => q.lte(q.field("scheduledAt"), now))
      .collect();

    return schedules;
  },
});

// Get upcoming schedules (next 7 days)
export const getUpcoming = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, { days = 7 }) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

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
    return schedules.sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
  },
});

// Get schedule statistics
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const schedules = await ctx.db
      .query("scheduledPublishes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const stats = {
      total: schedules.length,
      byStatus: {
        pending: 0,
        processing: 0,
        published: 0,
        failed: 0,
        cancelled: 0,
      },
      byPlatform: {} as Record<string, number>,
      upcoming: 0, // Next 7 days
      overdue: 0, // Past scheduled time but still pending
    };

    const now = new Date();
    const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    schedules.forEach((schedule) => {
      // Count by status
      stats.byStatus[schedule.status]++;

      // Count by platform
      stats.byPlatform[schedule.platform] =
        (stats.byPlatform[schedule.platform] || 0) + 1;

      const scheduledTime = new Date(schedule.scheduledAt);

      // Count upcoming (next 7 days)
      if (
        schedule.status === "pending" &&
        scheduledTime >= now &&
        scheduledTime <= futureDate
      ) {
        stats.upcoming++;
      }

      // Count overdue (past scheduled time but still pending)
      if (schedule.status === "pending" && scheduledTime < now) {
        stats.overdue++;
      }
    });

    return stats;
  },
});

// Get recent publishes (last 30 days)
export const getRecentPublishes = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, { days = 30 }) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

    const schedules = await ctx.db
      .query("scheduledPublishes")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "published"),
      )
      .filter((q) => q.gte(q.field("publishedAt"), cutoffTime))
      .order("desc")
      .collect();

    return schedules;
  },
});
