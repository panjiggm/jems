import {
  mutation,
  internalMutation,
  internalAction,
  internalQuery,
} from "./_generated/server";
import { v } from "convex/values";
import { getUserId } from "./notes";
import { internal } from "./_generated/api";

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
    await ctx.scheduler.runAfter(0, internal.onboarding.generateAndSavePrompt, {
      personaId,
      profileId,
      bio: args.bio,
      nicheIds: args.nicheIds,
      full_name: args.full_name,
      locale: args.locale,
    });

    return { profileId, personaId };
  },
});

// Generate AI prompt and save to persona
export const generateAndSavePrompt = internalAction({
  args: {
    personaId: v.id("persona"),
    profileId: v.id("profile"),
    bio: v.string(),
    nicheIds: v.array(v.id("niches")),
    full_name: v.string(),
    locale: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Get niche details
      const niches = await Promise.all(
        args.nicheIds.map((id) =>
          ctx.runQuery(internal.onboarding.getNiche, { id }),
        ),
      );
      const validNiches = niches.filter(Boolean);

      // Generate AI prompt
      const aiPrompt = await ctx.runAction(
        internal.openai.generatePersonaPrompt,
        {
          full_name: args.full_name,
          bio: args.bio,
          niches: validNiches.map((niche) => ({
            label: niche?.label || "",
            category: niche?.category || "",
          })),
          locale: args.locale,
        },
      );

      // Save to persona
      await ctx.runMutation(internal.onboarding.updatePersonaPrompt, {
        personaId: args.personaId,
        aiPrompt: aiPrompt || "Default AI prompt - generation failed",
      });

      // Mark onboarding complete
      await ctx.runMutation(internal.onboarding.completeOnboardingProcess, {
        profileId: args.profileId,
      });
    } catch (error) {
      // Save fallback and complete onboarding
      await ctx.runMutation(internal.onboarding.updatePersonaPrompt, {
        personaId: args.personaId,
        aiPrompt: "Default AI prompt - generation failed",
      });

      await ctx.runMutation(internal.onboarding.completeOnboardingProcess, {
        profileId: args.profileId,
      });
    }
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

export const getNiche = internalQuery({
  args: { id: v.id("niches") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
