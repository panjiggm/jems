import { internalAction, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

/**
 * Regenerate daily suggestions for all users
 * Called by cron job daily at midnight UTC
 */
export const regenerateForAllUsers = internalAction({
  handler: async (
    ctx,
  ): Promise<{
    processed: number;
    results: Array<{
      userId: string;
      success: boolean;
      ideasGenerated?: number;
      error?: string;
    }>;
  }> => {
    // Get all users who have completed onboarding (have persona)
    const allPersonas: Array<{ userId: string }> = await ctx.runQuery(
      internal.queries.persona.getAllPersonas,
    );

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const results: Array<{
      userId: string;
      success: boolean;
      ideasGenerated?: number;
      error?: string;
    }> = [];

    for (const persona of allPersonas) {
      try {
        // Generate new suggestions for today
        const generateResult: { count: number } = await ctx.runAction(
          internal.actions.contentSuggestions.generateSuggestions,
          {
            userId: persona.userId,
            date: today,
          },
        );

        // Delete old suggestions from yesterday (keep only 3, delete the rest)
        await ctx.runMutation(
          internal.crons.dailySuggestions.cleanupOldSuggestions,
          {
            userId: persona.userId,
            date: yesterday,
          },
        );

        results.push({
          userId: persona.userId,
          success: true,
          ideasGenerated: generateResult.count,
        });
      } catch (error) {
        console.error(
          `Error generating suggestions for user ${persona.userId}:`,
          error,
        );
        results.push({
          userId: persona.userId,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return { processed: allPersonas.length, results };
  },
});

/**
 * Cleanup old suggestions - keep only 3, delete the rest
 */
export const cleanupOldSuggestions = internalMutation({
  args: {
    userId: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    // Get suggestions for the date
    const suggestion = await ctx.db
      .query("dailyContentSuggestions")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).eq("suggestionDate", args.date),
      )
      .first();

    if (!suggestion || suggestion.ideaIds.length <= 3) {
      return { deleted: 0 };
    }

    // Keep first 3, delete the rest
    const toKeep = suggestion.ideaIds.slice(0, 3);
    const toDelete = suggestion.ideaIds.slice(3);

    // Delete the ideas
    for (const ideaId of toDelete) {
      await ctx.db.delete(ideaId);
    }

    // Update the suggestion record
    await ctx.db.patch(suggestion._id, {
      ideaIds: toKeep,
    });

    return { deleted: toDelete.length };
  },
});
