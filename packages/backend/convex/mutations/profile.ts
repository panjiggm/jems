import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getUserId } from "../schema";
import { internal } from "../_generated/api";

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

// Update existing profile
export const updateProfile = mutation({
  args: {
    full_name: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatar_url: v.optional(v.string()),
    regeneratePrompt: v.optional(v.boolean()), // Flag to trigger AI prompt regeneration
    locale: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found");

    const profile = await ctx.db
      .query("profile")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!profile) {
      throw new Error("Profile not found");
    }

    const updates: Record<string, any> = {};
    if (args.full_name !== undefined) updates.full_name = args.full_name;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.avatar_url !== undefined) updates.avatar_url = args.avatar_url;

    await ctx.db.patch(profile._id, updates);

    // If regeneratePrompt flag is true and full_name changed, schedule AI prompt regeneration
    if (args.regeneratePrompt && args.full_name) {
      // Get persona data
      const persona = await ctx.db
        .query("persona")
        .filter((q) => q.eq(q.field("userId"), userId))
        .first();

      if (persona) {
        await ctx.scheduler.runAfter(
          0,
          internal.actions.onboarding.generateAndSavePrompt,
          {
            personaId: persona._id,
            profileId: profile._id,
            bio: persona.bio,
            nicheIds: persona.nicheIds,
            full_name: args.full_name,
            locale: args.locale,
          },
        );
      }
    }

    return profile._id;
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

// Fix onboarding status for existing users who have both profile and persona
export const fixOnboardingStatus = mutation({
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

    // Check if user also has persona data
    const persona = await ctx.db
      .query("persona")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    // If user has both profile and persona but onboarding is not marked complete, fix it
    if (persona && !profile.is_onboarding_completed) {
      await ctx.db.patch(profile._id, {
        is_onboarding_completed: true,
      });
      return { fixed: true, profileId: profile._id };
    }

    return { fixed: false, profileId: profile._id };
  },
});

// Create or update persona
export const updatePersona = mutation({
  args: {
    nicheIds: v.optional(v.array(v.id("niches"))),
    bio: v.optional(v.string()),
    ai_prompt: v.optional(v.string()),
    regeneratePrompt: v.optional(v.boolean()), // Flag to trigger AI prompt regeneration
    locale: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found");

    const existingPersona = await ctx.db
      .query("persona")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existingPersona) {
      // Update existing persona - only update fields that are provided
      const updates: Record<string, any> = {};
      if (args.nicheIds !== undefined) updates.nicheIds = args.nicheIds;
      if (args.bio !== undefined) updates.bio = args.bio;
      if (args.ai_prompt !== undefined) updates.ai_prompt = args.ai_prompt;

      await ctx.db.patch(existingPersona._id, updates);

      // If regeneratePrompt flag is true, schedule AI prompt generation
      if (args.regeneratePrompt) {
        // Get profile for full_name
        const profile = await ctx.db
          .query("profile")
          .filter((q) => q.eq(q.field("userId"), userId))
          .first();

        if (profile) {
          // Get updated values (use new values or fallback to existing)
          const finalNicheIds = args.nicheIds || existingPersona.nicheIds;
          const finalBio = args.bio || existingPersona.bio;

          await ctx.scheduler.runAfter(
            0,
            internal.actions.onboarding.generateAndSavePrompt,
            {
              personaId: existingPersona._id,
              profileId: profile._id,
              bio: finalBio,
              nicheIds: finalNicheIds,
              full_name: profile.full_name,
              locale: args.locale,
            },
          );
        }
      }

      return existingPersona._id;
    } else {
      // Create new persona - all fields are required for creation
      if (!args.nicheIds || !args.bio || !args.ai_prompt) {
        throw new Error(
          "All fields (nicheIds, bio, ai_prompt) are required to create a new persona",
        );
      }

      const personaId = await ctx.db.insert("persona", {
        userId,
        nicheIds: args.nicheIds,
        bio: args.bio,
        ai_prompt: args.ai_prompt,
      });
      return personaId;
    }
  },
});
