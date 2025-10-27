import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { currentUserId } from "../auth";

// Connect a new social media account
export const connect = mutation({
  args: {
    platform: v.union(
      v.literal("tiktok"),
      v.literal("instagram"),
      v.literal("youtube"),
      v.literal("x"),
      v.literal("facebook"),
      v.literal("threads"),
    ),
    platformAccountId: v.string(),
    displayName: v.string(),
    profileImageUrl: v.optional(v.string()),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    tokenExpiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    const now = Date.now();

    // Check if account already exists for this platform (max 1 per platform)
    const existingAccount = await ctx.db
      .query("socialMediaAccounts")
      .withIndex("by_user_platform", (q) =>
        q.eq("userId", userId).eq("platform", args.platform),
      )
      .first();

    if (existingAccount) {
      throw new Error(
        `You already have a connected ${args.platform} account. Please disconnect it first.`,
      );
    }

    const accountId = await ctx.db.insert("socialMediaAccounts", {
      userId,
      platform: args.platform,
      platformAccountId: args.platformAccountId,
      displayName: args.displayName,
      profileImageUrl: args.profileImageUrl,
      accessToken: args.accessToken,
      refreshToken: args.refreshToken,
      tokenExpiresAt: args.tokenExpiresAt,
      isConnected: true,
      lastSyncedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return accountId;
  },
});

// Disconnect a social media account
export const disconnect = mutation({
  args: {
    accountId: v.id("socialMediaAccounts"),
  },
  handler: async (ctx, { accountId }) => {
    const userId = await currentUserId(ctx);
    const account = await ctx.db.get(accountId);

    if (!account || account.userId !== userId) {
      throw new Error("Account not found");
    }

    // Mark as disconnected instead of deleting (to preserve history)
    await ctx.db.patch(accountId, {
      isConnected: false,
      updatedAt: Date.now(),
    });

    return true;
  },
});

// Update account tokens (for token refresh)
export const updateTokens = mutation({
  args: {
    accountId: v.id("socialMediaAccounts"),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    tokenExpiresAt: v.optional(v.number()),
  },
  handler: async (
    ctx,
    { accountId, accessToken, refreshToken, tokenExpiresAt },
  ) => {
    const userId = await currentUserId(ctx);
    const account = await ctx.db.get(accountId);

    if (!account || account.userId !== userId) {
      throw new Error("Account not found");
    }

    await ctx.db.patch(accountId, {
      accessToken,
      refreshToken,
      tokenExpiresAt,
      updatedAt: Date.now(),
    });

    return accountId;
  },
});

// Update connection status
export const updateConnectionStatus = mutation({
  args: {
    accountId: v.id("socialMediaAccounts"),
    isConnected: v.boolean(),
    lastError: v.optional(v.string()),
  },
  handler: async (ctx, { accountId, isConnected, lastError }) => {
    const userId = await currentUserId(ctx);
    const account = await ctx.db.get(accountId);

    if (!account || account.userId !== userId) {
      throw new Error("Account not found");
    }

    await ctx.db.patch(accountId, {
      isConnected,
      lastError,
      updatedAt: Date.now(),
    });

    return accountId;
  },
});

// Update last synced timestamp
export const updateLastSynced = mutation({
  args: {
    accountId: v.id("socialMediaAccounts"),
  },
  handler: async (ctx, { accountId }) => {
    const userId = await currentUserId(ctx);
    const account = await ctx.db.get(accountId);

    if (!account || account.userId !== userId) {
      throw new Error("Account not found");
    }

    const now = Date.now();
    await ctx.db.patch(accountId, {
      lastSyncedAt: now,
      updatedAt: now,
    });

    return accountId;
  },
});

// Update account info (display name, profile image)
export const updateAccountInfo = mutation({
  args: {
    accountId: v.id("socialMediaAccounts"),
    displayName: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, { accountId, displayName, profileImageUrl }) => {
    const userId = await currentUserId(ctx);
    const account = await ctx.db.get(accountId);

    if (!account || account.userId !== userId) {
      throw new Error("Account not found");
    }

    const updates: any = { updatedAt: Date.now() };
    if (displayName !== undefined) updates.displayName = displayName;
    if (profileImageUrl !== undefined)
      updates.profileImageUrl = profileImageUrl;

    await ctx.db.patch(accountId, updates);

    return accountId;
  },
});

// Store account statistics
export const saveStats = mutation({
  args: {
    accountId: v.id("socialMediaAccounts"),
    followersCount: v.optional(v.number()),
    followingCount: v.optional(v.number()),
    platformMetrics: v.optional(
      v.object({
        totalLikes: v.optional(v.number()),
        totalViews: v.optional(v.number()),
        totalVideos: v.optional(v.number()),
        totalPosts: v.optional(v.number()),
        subscribersCount: v.optional(v.number()),
        totalTweets: v.optional(v.number()),
        totalRetweets: v.optional(v.number()),
        engagementRate: v.optional(v.number()),
      }),
    ),
  },
  handler: async (
    ctx,
    { accountId, followersCount, followingCount, platformMetrics },
  ) => {
    const userId = await currentUserId(ctx);
    const account = await ctx.db.get(accountId);

    if (!account || account.userId !== userId) {
      throw new Error("Account not found");
    }

    const now = Date.now();

    const statsId = await ctx.db.insert("socialMediaStats", {
      userId,
      accountId,
      platform: account.platform,
      followersCount,
      followingCount,
      platformMetrics,
      syncedAt: now,
      createdAt: now,
    });

    return statsId;
  },
});
