import { internalQuery } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get comprehensive context for AI Assistant RAG
 * This gathers profile, persona, niches, content history, and social media stats
 */
export const getRAGContext = internalQuery({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()), // Limit content history items
  },
  handler: async (ctx, { userId, limit = 10 }) => {
    // 1. Get user profile
    const profile = await ctx.db
      .query("profile")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // 2. Get user persona with niches
    const persona = await ctx.db
      .query("persona")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    let niches: any[] = [];
    if (persona?.nicheIds) {
      niches = await Promise.all(
        persona.nicheIds
          .map((id) => ctx.db.get(id))
          .filter(Boolean) as Promise<any>[],
      );
    }

    // 3. Get recent content campaigns (limit to most recent)
    const recentCampaigns = await ctx.db
      .query("contentCampaigns")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    // 4. Get recent content routines (limit to most recent)
    const recentRoutines = await ctx.db
      .query("contentRoutines")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    // 5. Get latest social media stats for all platforms
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
        platform: account.platform,
        displayName: account.displayName,
        stats: latestStats,
      };
    });

    const socialMediaStats = await Promise.all(statsPromises);

    // Format context as a structured string for AI prompt
    return formatContextForAI({
      profile,
      persona,
      niches,
      recentCampaigns,
      recentRoutines,
      socialMediaStats,
    });
  },
});

/**
 * Format gathered context into a readable string for AI
 */
function formatContextForAI(context: {
  profile: any;
  persona: any;
  niches: any[];
  recentCampaigns: any[];
  recentRoutines: any[];
  socialMediaStats: any[];
}): string {
  const parts: string[] = [];

  // Profile information
  if (context.profile) {
    parts.push(`## User Profile`);
    parts.push(`- Name: ${context.profile.full_name}`);
    parts.push(`- Phone: ${context.profile.phone}`);
    parts.push("");
  }

  // Persona and niches
  if (context.persona) {
    parts.push(`## User Persona`);
    parts.push(`- Bio: ${context.persona.bio}`);
    parts.push(`- AI Prompt: ${context.persona.ai_prompt}`);

    if (context.niches.length > 0) {
      parts.push(
        `- Niches: ${context.niches.map((n) => `${n.label} (${n.category})`).join(", ")}`,
      );
    }
    parts.push("");
  }

  // Recent content campaigns
  if (context.recentCampaigns.length > 0) {
    parts.push(
      `## Recent Content Campaigns (${context.recentCampaigns.length} items)`,
    );
    context.recentCampaigns.forEach((campaign, idx) => {
      parts.push(`${idx + 1}. "${campaign.title}"`);
      parts.push(`   - Platform: ${campaign.platform}`);
      parts.push(`   - Status: ${campaign.status}`);
      parts.push(`   - Type: ${campaign.type}`);
      if (campaign.notes)
        parts.push(
          `   - Notes: ${campaign.notes.substring(0, 100)}${campaign.notes.length > 100 ? "..." : ""}`,
        );
      if (campaign.sow)
        parts.push(
          `   - SOW: ${campaign.sow.substring(0, 100)}${campaign.sow.length > 100 ? "..." : ""}`,
        );
    });
    parts.push("");
  }

  // Recent content routines
  if (context.recentRoutines.length > 0) {
    parts.push(
      `## Recent Content Routines (${context.recentRoutines.length} items)`,
    );
    context.recentRoutines.forEach((routine, idx) => {
      parts.push(`${idx + 1}. "${routine.title}"`);
      parts.push(`   - Platform: ${routine.platform}`);
      parts.push(`   - Status: ${routine.status}`);
      if (routine.notes)
        parts.push(
          `   - Notes: ${routine.notes.substring(0, 100)}${routine.notes.length > 100 ? "..." : ""}`,
        );
    });
    parts.push("");
  }

  // Social media stats
  if (context.socialMediaStats.length > 0) {
    parts.push(`## Social Media Statistics`);
    context.socialMediaStats.forEach(({ platform, displayName, stats }) => {
      if (stats) {
        parts.push(`### ${platform} (@${displayName})`);
        if (stats.followersCount)
          parts.push(`- Followers: ${stats.followersCount.toLocaleString()}`);
        if (stats.followingCount)
          parts.push(`- Following: ${stats.followingCount.toLocaleString()}`);
        if (stats.platformMetrics) {
          const metrics = stats.platformMetrics;
          if (metrics.totalViews)
            parts.push(`- Total Views: ${metrics.totalViews.toLocaleString()}`);
          if (metrics.totalLikes)
            parts.push(`- Total Likes: ${metrics.totalLikes.toLocaleString()}`);
          if (metrics.totalPosts)
            parts.push(`- Total Posts: ${metrics.totalPosts.toLocaleString()}`);
          if (metrics.totalVideos)
            parts.push(
              `- Total Videos: ${metrics.totalVideos.toLocaleString()}`,
            );
          if (metrics.engagementRate)
            parts.push(
              `- Engagement Rate: ${(metrics.engagementRate * 100).toFixed(2)}%`,
            );
        }
      }
    });
    parts.push("");
  }

  return parts.join("\n");
}
