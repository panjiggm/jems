import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { getUserId } from "../schema";
import { internal } from "../_generated/api";

// Complete full onboarding process
export const completeOnboarding = mutation({
  args: {
    // Profile data
    full_name: v.string(),
    phone: v.string(),
    // Persona data
    categories: v.array(v.string()),
    nicheIds: v.array(v.id("niches")),
    bio: v.string(),
    locale: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found");

    // 1. Create/update profile
    const existingProfile = await ctx.db
      .query("profile")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    let profileId;
    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        full_name: args.full_name,
        phone: args.phone,
        is_onboarding_completed: false, // Will be set to true after persona is created
      });
      profileId = existingProfile._id;
    } else {
      profileId = await ctx.db.insert("profile", {
        userId,
        full_name: args.full_name,
        phone: args.phone,
        avatar_url: "",
        is_onboarding_completed: false,
      });
    }

    // 2. Create/update persona
    const existingPersona = await ctx.db
      .query("persona")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    let personaId;
    if (existingPersona) {
      await ctx.db.patch(existingPersona._id, {
        nicheIds: args.nicheIds,
        bio: args.bio,
        ai_prompt: "", // Will be generated
      });
      personaId = existingPersona._id;
    } else {
      personaId = await ctx.db.insert("persona", {
        userId,
        nicheIds: args.nicheIds,
        bio: args.bio,
        ai_prompt: "", // Will be generated
      });
    }

    // 3. Schedule AI prompt generation and save
    await ctx.scheduler.runAfter(
      0,
      internal.actions.onboarding.generateAndSavePrompt,
      {
        personaId,
        profileId,
        bio: args.bio,
        nicheIds: args.nicheIds,
        full_name: args.full_name,
        locale: args.locale,
      },
    );

    return { profileId, personaId };
  },
});

// Helper mutations for internalAction
export const updatePersonaPrompt = internalMutation({
  args: {
    personaId: v.id("persona"),
    aiPrompt: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.personaId, {
      ai_prompt: args.aiPrompt,
    });
  },
});

export const completeOnboardingProcess = internalMutation({
  args: {
    profileId: v.id("profile"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.profileId, {
      is_onboarding_completed: true,
    });
  },
});
