"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

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
          ctx.runQuery(internal.queries.niches.getInternalNicheById, { id }),
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
      await ctx.runMutation(internal.mutations.onboarding.updatePersonaPrompt, {
        personaId: args.personaId,
        aiPrompt: aiPrompt || "Default AI prompt - generation failed",
      });

      // Onboarding is already marked complete in the mutation
      // This action only handles AI prompt generation
    } catch (error) {
      // Save fallback and complete onboarding
      await ctx.runMutation(internal.mutations.onboarding.updatePersonaPrompt, {
        personaId: args.personaId,
        aiPrompt: "Default AI prompt - generation failed",
      });

      // Onboarding is already marked complete in the mutation
      // This action only handles AI prompt generation
    }
  },
});
