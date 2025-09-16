import { mutation, internalMutation } from "./_generated/server";
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
    tone: v.optional(v.string()),
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

    const tone = args.tone || "professional"; // Default tone

    let personaId;
    if (existingPersona) {
      await ctx.db.patch(existingPersona._id, {
        nicheIds: args.nicheIds,
        tone,
        bio: args.bio,
        ai_prompt: "", // Will be generated
      });
      personaId = existingPersona._id;
    } else {
      personaId = await ctx.db.insert("persona", {
        userId,
        nicheIds: args.nicheIds,
        tone,
        bio: args.bio,
        ai_prompt: "", // Will be generated
      });
    }

    // 3. Schedule AI prompt generation
    await ctx.scheduler.runAfter(
      0,
      internal.onboarding.generateAndSaveAIPrompt,
      {
        personaId,
        profileId,
        bio: args.bio,
        tone,
        nicheIds: args.nicheIds,
      },
    );

    return { profileId, personaId };
  },
});

// Internal function to generate AI prompt and complete onboarding
export const generateAndSaveAIPrompt = internalMutation({
  args: {
    personaId: v.id("persona"),
    profileId: v.id("profile"),
    bio: v.string(),
    tone: v.string(),
    nicheIds: v.array(v.id("niches")),
  },
  handler: async (ctx, args) => {
    try {
      // Get niche details
      const niches = await Promise.all(
        args.nicheIds.map((id) => ctx.db.get(id)),
      );
      const validNiches = niches.filter(Boolean);

      // Generate AI prompt
      const aiPrompt = await ctx.scheduler.runAfter(
        0,
        internal.openai.generatePersonaPrompt,
        {
          bio: args.bio,
          tone: args.tone,
          niches: validNiches.map((niche) => ({
            label: niche.label,
            category: niche.category,
            description: niche.description || "",
          })),
        },
      );

      // Update persona with AI prompt
      await ctx.db.patch(args.personaId, {
        ai_prompt: aiPrompt || "Default AI prompt - generation failed",
      });

      // Mark onboarding as completed
      await ctx.db.patch(args.profileId, {
        is_onboarding_completed: true,
      });

      return { success: true };
    } catch (error) {
      console.error("Failed to generate AI prompt:", error);

      // Still mark onboarding as completed even if AI prompt generation fails
      await ctx.db.patch(args.profileId, {
        is_onboarding_completed: true,
      });

      return { success: false, error: "AI prompt generation failed" };
    }
  },
});
