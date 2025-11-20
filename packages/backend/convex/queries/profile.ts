import { query, internalQuery } from "../_generated/server";
import { getUserId } from "../schema";
import { v } from "convex/values";

// Get user profile
export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) return null;

    // Get avatar URL from storage if storageId exists, otherwise use avatar_url
    let avatarUrl = profile.avatar_url || "";
    if (profile.avatarStorageId) {
      const url = await ctx.storage.getUrl(profile.avatarStorageId);
      if (url) {
        avatarUrl = url;
      }
    }

    return {
      ...profile,
      avatar_url: avatarUrl,
    };
  },
});

// Server-side query that accepts userId as parameter
export const getOnboardingStatusByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profile")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) {
      return { isCompleted: false, hasProfile: false };
    }

    // Check if user has persona data as well (more comprehensive check)
    const persona = await ctx.db
      .query("persona")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const isCompleted = Boolean(profile.is_onboarding_completed);

    return {
      isCompleted,
      hasProfile: true,
      hasPersona: !!persona,
      profile,
    };
  },
});

// Internal query to get profile by userId (for use in actions/crons)
export const getInternalProfile = internalQuery({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profile")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    return profile;
  },
});
