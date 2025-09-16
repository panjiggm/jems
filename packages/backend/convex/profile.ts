import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUserId } from "./notes";

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

// Create or update user profile
export const createProfile = mutation({
  args: {
    full_name: v.string(),
    phone: v.string(),
    avatar_url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found");

    const existingProfile = await ctx.db
      .query("profile")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existingProfile) {
      // Update existing profile
      await ctx.db.patch(existingProfile._id, {
        full_name: args.full_name,
        phone: args.phone,
        avatar_url: args.avatar_url || existingProfile.avatar_url,
      });
      return existingProfile._id;
    } else {
      // Create new profile
      const profileId = await ctx.db.insert("profile", {
        userId,
        full_name: args.full_name,
        phone: args.phone,
        avatar_url: args.avatar_url || "",
        is_onboarding_completed: false,
      });
      return profileId;
    }
  },
});

// Update onboarding completion status
export const completeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found");

    const profile = await ctx.db
      .query("profile")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!profile) {
      throw new Error("Profile not found");
    }

    await ctx.db.patch(profile._id, {
      is_onboarding_completed: true,
    });

    return profile._id;
  },
});
