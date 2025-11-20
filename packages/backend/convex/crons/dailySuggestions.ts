import { internalAction, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

/**
 * Regenerate daily suggestions for all users
 * Called by cron job daily at midnight UTC
 * Cron 1: Generate 3 content suggestions every day
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

    const results: Array<{
      userId: string;
      success: boolean;
      ideasGenerated?: number;
      error?: string;
    }> = [];

    for (const persona of allPersonas) {
      try {
        // Get user profile to determine locale
        const profile = await ctx.runQuery(
          internal.queries.profile.getInternalProfile,
          {
            userId: persona.userId,
          },
        );

        // Use locale from profile or default to "en"
        const locale = profile?.locale || "en";

        // Generate new suggestions for today (exactly 3 ideas)
        const generateResult: { count: number } = await ctx.runAction(
          internal.actions.contentSuggestions.generateSuggestions,
          {
            userId: persona.userId,
            date: today,
            locale,
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
 * Delete old suggestions for all users
 * Called by cron job to delete content ideas older than 24 hours
 * Cron 2: Delete content ideas that have passed 24 hours
 */
export const deleteOldSuggestionsForAllUsers = internalAction({
  handler: async (
    ctx,
  ): Promise<{
    processed: number;
    totalDeleted: number;
    results: Array<{
      userId: string;
      success: boolean;
      deleted?: number;
      error?: string;
    }>;
  }> => {
    // Get all users who have completed onboarding (have persona)
    const allPersonas: Array<{ userId: string }> = await ctx.runQuery(
      internal.queries.persona.getAllPersonas,
    );

    const results: Array<{
      userId: string;
      success: boolean;
      deleted?: number;
      error?: string;
    }> = [];

    let totalDeleted = 0;

    for (const persona of allPersonas) {
      try {
        // Delete old suggestions for this user
        const deleteResult: { deleted: number } = await ctx.runMutation(
          internal.crons.dailySuggestions.deleteOldSuggestionsForUser,
          {
            userId: persona.userId,
          },
        );

        totalDeleted += deleteResult.deleted;
        results.push({
          userId: persona.userId,
          success: true,
          deleted: deleteResult.deleted,
        });
      } catch (error) {
        console.error(
          `Error deleting old suggestions for user ${persona.userId}:`,
          error,
        );
        results.push({
          userId: persona.userId,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      processed: allPersonas.length,
      totalDeleted,
      results,
    };
  },
});

/**
 * Delete old suggestions for a specific user
 * Deletes content ideas with status "suggestion" that are older than 24 hours
 */
export const deleteOldSuggestionsForUser = internalMutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    // Get all content ideas for this user with status "suggestion"
    const allIdeas = await ctx.db
      .query("contentIdeas")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", args.userId).eq("status", "suggestion"),
      )
      .collect();

    // Filter ideas that are older than 24 hours
    const ideasToDelete = allIdeas.filter(
      (idea) => idea.createdAt < twentyFourHoursAgo,
    );

    if (ideasToDelete.length === 0) {
      return { deleted: 0 };
    }

    const deletedIds = new Set<Id<"contentIdeas">>();

    // Delete the ideas
    for (const idea of ideasToDelete) {
      await ctx.db.delete(idea._id);
      deletedIds.add(idea._id);
    }

    // Update dailyContentSuggestions records
    // Get all dailyContentSuggestions for this user
    const allDailySuggestions = await ctx.db
      .query("dailyContentSuggestions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const suggestion of allDailySuggestions) {
      // Remove deleted ideaIds from the array
      const updatedIdeaIds = suggestion.ideaIds.filter(
        (id) => !deletedIds.has(id),
      );

      if (updatedIdeaIds.length === 0) {
        // Delete the dailyContentSuggestions record if no ideas left
        await ctx.db.delete(suggestion._id);
      } else if (updatedIdeaIds.length !== suggestion.ideaIds.length) {
        // Update the record if some ideas were deleted
        await ctx.db.patch(suggestion._id, {
          ideaIds: updatedIdeaIds,
        });
      }
    }

    return { deleted: ideasToDelete.length };
  },
});
