import { query } from "../_generated/server";
import { getUserId } from "../schema";

// Get user profile
export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profile")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    return profile;
  },
});

// Check if user has completed onboarding
export const getOnboardingStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return { isCompleted: false, hasProfile: false };

    const profile = await ctx.db
      .query("profile")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!profile) {
      return { isCompleted: false, hasProfile: false };
    }

    return {
      isCompleted: profile.is_onboarding_completed,
      hasProfile: true,
      profile,
    };
  },
});
