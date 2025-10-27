"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../_generated/api";

/**
 * Social Media Integration Actions
 *
 * These actions handle integration with social media platform APIs.
 * Each platform will need its own implementation based on their API requirements.
 *
 * NOTE: This is a template/scaffold. Actual API implementations will need to be added
 * based on each platform's specific API documentation and OAuth requirements.
 */

// ============================================================================
// OAuth & Account Connection
// ============================================================================
const TIKTOK_AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const TIKTOK_USER_INFO_URL = "https://open.tiktokapis.com/v2/user/info/";

/**
 * Initiate OAuth flow for connecting a social media account
 * Returns the OAuth authorization URL that the user should be redirected to
 */
export const initiateOAuth = action({
  args: {
    platform: v.union(
      v.literal("tiktok"),
      v.literal("instagram"),
      v.literal("youtube"),
      v.literal("x"),
      v.literal("facebook"),
      v.literal("threads"),
    ),
    redirectUri: v.string(), // Frontend callback URL
  },
  handler: async (ctx, { platform, redirectUri }) => {
    // TODO: Implement OAuth initiation for each platform
    // This will return an authorization URL for the user to visit

    switch (platform) {
      case "tiktok":
        const clientKey = process.env.TIKTOK_CLIENT_KEY;
        if (!clientKey) {
          throw new Error("TikTok Client Key not configured");
        }

        // Generate CSRF token (state parameter)
        const csrfState = crypto.randomUUID();

        // Scopes yang diperlukan
        const scopes = [
          "user.info.basic",
          "user.info.stats",
          "video.upload",
          "video.publish",
        ].join(",");

        // Build authorization URL
        const params = new URLSearchParams({
          client_key: clientKey,
          scope: scopes,
          response_type: "code",
          redirect_uri: redirectUri,
          state: csrfState,
        });

        const authUrl = `${TIKTOK_AUTH_URL}?${params.toString()}`;

        return {
          authUrl,
          state: csrfState, // Frontend harus simpan ini untuk validasi
        };

      case "instagram":
        // Instagram uses Facebook Graph API
        throw new Error("Instagram OAuth not implemented yet");

      case "youtube":
        // YouTube uses Google OAuth
        throw new Error("YouTube OAuth not implemented yet");

      case "x":
        // X (Twitter) OAuth 2.0
        throw new Error("X OAuth not implemented yet");

      case "facebook":
        throw new Error("Facebook OAuth not implemented yet");

      case "threads":
        throw new Error("Threads OAuth not implemented yet");

      default:
        throw new Error(`Unknown platform: ${platform}`);
    }
  },
});

/**
 * Complete OAuth flow and connect account
 * Called after user returns from OAuth provider with authorization code
 */
export const completeOAuth = action({
  args: {
    platform: v.union(
      v.literal("tiktok"),
      v.literal("instagram"),
      v.literal("youtube"),
      v.literal("x"),
      v.literal("facebook"),
      v.literal("threads"),
    ),
    code: v.string(), // Authorization code from OAuth provider
    redirectUri: v.string(),
    state: v.string(),
  },
  handler: async (ctx, { platform, code, redirectUri, state }) => {
    switch (platform) {
      case "tiktok": {
        const clientKey = process.env.TIKTOK_CLIENT_KEY;
        const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

        if (!clientKey || !clientSecret) {
          throw new Error("TikTok credentials not configured");
        }

        // Exchange code for access token
        const tokenResponse = await fetch(TIKTOK_TOKEN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_key: clientKey,
            client_secret: clientSecret,
            code: code,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
            state: state,
          }),
        });

        if (!tokenResponse.ok) {
          const error = await tokenResponse.text();
          throw new Error(`TikTok token exchange failed: ${error}`);
        }

        const tokenData = await tokenResponse.json();

        // Get user info
        const userInfoResponse = await fetch(TIKTOK_USER_INFO_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        });

        if (!userInfoResponse.ok) {
          throw new Error("Failed to fetch TikTok user info");
        }

        const userData = await userInfoResponse.json();
        const userInfo = userData.data.user;

        // Save to database
        const accountId: string = await ctx.runMutation(
          api.mutations.socialMediaAccounts.connect,
          {
            platform: "tiktok",
            platformAccountId: userInfo.open_id,
            displayName: userInfo.display_name,
            profileImageUrl: userInfo.avatar_url,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            tokenExpiresAt: Date.now() + tokenData.expires_in * 1000,
          },
        );

        return {
          accountId,
          displayName: userInfo.display_name,
        };
      }

      default:
        return {
          accountId: null,
          displayName: null,
        };
    }
  },
});

/**
 * Refresh expired OAuth tokens
 */
export const refreshAccessToken = action({
  args: {
    accountId: v.id("socialMediaAccounts"),
  },
  handler: async (ctx, { accountId }) => {
    // Get account details
    const account = await ctx.runQuery(
      api.queries.socialMediaAccounts.getById,
      {
        accountId,
      },
    );

    if (!account) {
      throw new Error("Account not found");
    }

    if (!account.refreshToken) {
      throw new Error("No refresh token available");
    }

    switch (account.platform) {
      case "tiktok": {
        const clientKey = process.env.TIKTOK_CLIENT_KEY;
        const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

        const response = await fetch(TIKTOK_TOKEN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_key: clientKey!,
            client_secret: clientSecret!,
            grant_type: "refresh_token",
            refresh_token: account.refreshToken,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to refresh TikTok token");
        }

        const data = await response.json();

        await ctx.runMutation(api.mutations.socialMediaAccounts.updateTokens, {
          accountId,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          tokenExpiresAt: Date.now() + data.expires_in * 1000,
        });

        return { success: true };
      }

      default:
        throw new Error(
          `Token refresh for ${account.platform} not implemented`,
        );
    }
  },
});

/**
 * Disconnect and revoke access to a social media account
 */
export const revokeAccess = action({
  args: {
    accountId: v.id("socialMediaAccounts"),
  },
  handler: async (ctx, { accountId }) => {
    const account = await ctx.runQuery(
      api.queries.socialMediaAccounts.getById,
      {
        accountId,
      },
    );

    if (!account) {
      throw new Error("Account not found");
    }

    // TODO: Revoke access on platform side
    // await revokePlatformAccess(account.platform, account.accessToken);

    // Mark as disconnected in database
    await ctx.runMutation(api.mutations.socialMediaAccounts.disconnect, {
      accountId,
    });

    return true;
  },
});

// ============================================================================
// Content Publishing
// ============================================================================

/**
 * Publish content to a social media platform
 */
export const publishContent = action({
  args: {
    scheduleId: v.id("scheduledPublishes"),
  },
  handler: async (ctx, { scheduleId }) => {
    // Get schedule details
    const scheduleData = await ctx.runQuery(
      api.queries.scheduledPublishes.getById,
      { scheduleId },
    );

    if (!scheduleData) {
      throw new Error("Schedule not found");
    }

    const { schedule, account, content } = scheduleData;

    if (!account || !account.isConnected) {
      await ctx.runMutation(api.mutations.scheduledPublishes.setFailed, {
        scheduleId,
        errorMessage: "Account is not connected",
      });
      return;
    }

    if (!content) {
      await ctx.runMutation(api.mutations.scheduledPublishes.setFailed, {
        scheduleId,
        errorMessage: "Content not found",
      });
      return;
    }

    try {
      // Mark as processing
      await ctx.runMutation(api.mutations.scheduledPublishes.setProcessing, {
        scheduleId,
      });

      // TODO: Implement actual publishing logic for each platform
      // This will vary significantly by platform and content type

      // Example flow:
      // 1. Get media files from content
      // const mediaFiles = content.mediaFiles || [];
      // 2. Upload media to platform
      // const uploadedMedia = await uploadMediaToPlatform(
      //   schedule.platform,
      //   account.accessToken,
      //   mediaFiles
      // );
      // 3. Create post with uploaded media
      // const post = await createPlatformPost(
      //   schedule.platform,
      //   account.accessToken,
      //   {
      //     title: content.title,
      //     description: content.notes || content.sow,
      //     mediaIds: uploadedMedia.map(m => m.id),
      //   }
      // );

      // For now, return a placeholder error
      throw new Error(`Publishing to ${schedule.platform} not implemented yet`);

      // On success:
      // await ctx.runMutation(api.mutations.scheduledPublishes.setPublished, {
      //   scheduleId,
      //   platformPostId: post.id,
      //   platformPostUrl: post.url,
      // });
    } catch (error: any) {
      // Handle errors
      await ctx.runMutation(api.mutations.scheduledPublishes.setFailed, {
        scheduleId,
        errorMessage: error.message || "Unknown error during publishing",
      });
    }
  },
});

/**
 * Check for pending scheduled publishes and process them
 * This should be called by a scheduled Convex function (cron job)
 */
export const processScheduledPublishes = action({
  args: {},
  handler: async (ctx): Promise<{ processed: number }> => {
    // Get all pending schedules that are due
    const dueSchedules = await ctx.runQuery(
      api.queries.scheduledPublishes.getPendingDue,
    );

    console.log(`Found ${dueSchedules.length} due scheduled publishes`);

    // Process each schedule
    for (const schedule of dueSchedules) {
      try {
        // Call publishContent action for each schedule
        // @ts-ignore - Type will be available after first Convex deployment
        await ctx.runAction(internal.actions.socialMedia.publishContent, {
          scheduleId: schedule._id,
        });
      } catch (error) {
        console.error(`Error processing schedule ${schedule._id}:`, error);
      }
    }

    return {
      processed: dueSchedules.length,
    };
  },
});

// ============================================================================
// Statistics & Analytics
// ============================================================================

/**
 * Sync account statistics from social media platform
 */
export const syncAccountStats = action({
  args: {
    accountId: v.id("socialMediaAccounts"),
  },
  handler: async (ctx, { accountId }) => {
    const account = await ctx.runQuery(
      api.queries.socialMediaAccounts.getById,
      {
        accountId,
      },
    );

    if (!account) {
      throw new Error("Account not found");
    }

    if (!account.isConnected) {
      throw new Error("Account is not connected");
    }

    try {
      // TODO: Fetch stats from each platform's API
      // This will vary by platform

      // Example flow:
      // const stats = await fetchPlatformStats(account.platform, account.accessToken);

      // Save stats to database
      // await ctx.runMutation(api.mutations.socialMediaAccounts.saveStats, {
      //   accountId,
      //   followersCount: stats.followersCount,
      //   followingCount: stats.followingCount,
      //   platformMetrics: {
      //     totalLikes: stats.totalLikes,
      //     totalViews: stats.totalViews,
      //     // ... other platform-specific metrics
      //   },
      // });

      // Update last synced timestamp
      await ctx.runMutation(
        api.mutations.socialMediaAccounts.updateLastSynced,
        {
          accountId,
        },
      );

      throw new Error(`Stats sync for ${account.platform} not implemented yet`);
    } catch (error: any) {
      // Update connection status if there's an auth error
      if (error.message?.includes("auth") || error.message?.includes("token")) {
        await ctx.runMutation(
          api.mutations.socialMediaAccounts.updateConnectionStatus,
          {
            accountId,
            isConnected: false,
            lastError: error.message,
          },
        );
      }

      throw error;
    }
  },
});

/**
 * Sync stats for all connected accounts
 * This should be called periodically (e.g., daily cron job)
 */
export const syncAllAccountStats = action({
  args: {},
  handler: async (ctx) => {
    // Get all connected accounts
    const accounts = await ctx.runQuery(
      api.queries.socialMediaAccounts.listConnected,
    );

    console.log(`Syncing stats for ${accounts.length} accounts`);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const account of accounts) {
      try {
        // Call syncAccountStats action for each account
        // @ts-ignore - Type will be available after first Convex deployment
        await ctx.runAction(internal.actions.socialMedia.syncAccountStats, {
          accountId: account._id,
        });
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${account.platform}: ${error.message}`);
        console.error(`Error syncing stats for ${account.platform}:`, error);
      }
    }

    return results;
  },
});

// ============================================================================
// Platform-Specific Helpers
// ============================================================================

/**
 * Validate media file compatibility with platform
 */
export const validateMediaForPlatform = action({
  args: {
    platform: v.union(
      v.literal("tiktok"),
      v.literal("instagram"),
      v.literal("youtube"),
      v.literal("x"),
      v.literal("facebook"),
      v.literal("threads"),
    ),
    mediaFiles: v.array(
      v.object({
        contentType: v.string(),
        size: v.number(),
        durationMs: v.optional(v.number()),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, { platform, mediaFiles }) => {
    // TODO: Implement platform-specific validation rules
    // Each platform has different requirements for:
    // - File formats (video/image)
    // - File size limits
    // - Duration limits
    // - Aspect ratios
    // - Number of media items per post

    const validationResults = mediaFiles.map((media, index) => ({
      index,
      valid: true,
      errors: [] as string[],
    }));

    // Example validation rules (these are placeholders)
    switch (platform) {
      case "tiktok":
        // TikTok: Video only, max 10 minutes, certain aspect ratios
        break;
      case "instagram":
        // Instagram: Different rules for feed, stories, reels
        break;
      case "youtube":
        // YouTube: Longer videos allowed, specific formats
        break;
      case "x":
        // X: Short videos, images, GIFs
        break;
      case "facebook":
        // Facebook: Various formats, longer content allowed
        break;
      case "threads":
        // Threads: Similar to Instagram
        break;
    }

    return validationResults;
  },
});
