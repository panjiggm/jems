import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { getUserId } from "../schema";
import { internal } from "../_generated/api";

/**
 * Generate daily content suggestions (called by cron or manually)
 */
export const generateDailySuggestions = mutation({
  args: {
    date: v.optional(v.string()), // ISO date string, defaults to today
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    suggestionId?: any;
    ideas?: any[];
    scheduled?: boolean;
    scheduledId?: any;
  }> => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const suggestionDate = args.date || new Date().toISOString().split("T")[0];

    // Check if suggestions already exist for this date
    const existing = await ctx.db
      .query("dailyContentSuggestions")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", userId).eq("suggestionDate", suggestionDate),
      )
      .first();

    if (existing) {
      // Return existing suggestions
      const ideas = await Promise.all(
        existing.ideaIds
          .map((id) => ctx.db.get(id))
          .filter(Boolean) as Promise<any>[],
      );
      return {
        suggestionId: existing._id,
        ideas,
      };
    }

    // Generate new suggestions using action
    const result: any = await ctx.scheduler.runAfter(
      0,
      internal.actions.contentSuggestions.generateSuggestions,
      {
        userId,
        date: suggestionDate,
      },
    );

    return { scheduled: true, scheduledId: result };
  },
});

/**
 * Dismiss a content idea
 */
export const dismissIdea = mutation({
  args: {
    ideaId: v.id("contentIdeas"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const idea = await ctx.db.get(args.ideaId);
    if (!idea || idea.userId !== userId) {
      throw new Error("Idea not found or unauthorized");
    }

    await ctx.db.patch(args.ideaId, {
      status: "dismissed",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Convert content idea to campaign
 */
export const convertIdeaToCampaign = mutation({
  args: {
    ideaId: v.id("contentIdeas"),
    projectId: v.id("projects"),
    platform: v.optional(
      v.union(
        v.literal("tiktok"),
        v.literal("instagram"),
        v.literal("youtube"),
        v.literal("x"),
        v.literal("facebook"),
        v.literal("threads"),
        v.literal("other"),
      ),
    ),
    type: v.optional(v.union(v.literal("barter"), v.literal("paid"))),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const idea = await ctx.db.get(args.ideaId);
    if (!idea || idea.userId !== userId) {
      throw new Error("Idea not found or unauthorized");
    }

    // Verify project belongs to user
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or unauthorized");
    }

    const now = Date.now();

    // Create campaign from idea
    const campaignId = await ctx.db.insert("contentCampaigns", {
      userId,
      projectId: args.projectId,
      title: idea.title,
      platform: args.platform || idea.platform || "other",
      type: args.type || "barter",
      status: "product_obtained",
      statusHistory: [
        {
          status: "product_obtained",
          timestamp: now,
        },
      ],
      notes: idea.description,
      createdAt: now,
      updatedAt: now,
    });

    // Update idea status
    await ctx.db.patch(args.ideaId, {
      status: "converted_to_campaign",
      convertedToType: "campaign",
      convertedToId: campaignId,
      updatedAt: now,
    });

    return campaignId;
  },
});

/**
 * Convert content idea to routine
 */
export const convertIdeaToRoutine = mutation({
  args: {
    ideaId: v.id("contentIdeas"),
    projectId: v.id("projects"),
    platform: v.optional(
      v.union(
        v.literal("tiktok"),
        v.literal("instagram"),
        v.literal("youtube"),
        v.literal("x"),
        v.literal("facebook"),
        v.literal("threads"),
        v.literal("other"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const idea = await ctx.db.get(args.ideaId);
    if (!idea || idea.userId !== userId) {
      throw new Error("Idea not found or unauthorized");
    }

    // Verify project belongs to user
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or unauthorized");
    }

    const now = Date.now();

    // Create routine from idea
    const routineId = await ctx.db.insert("contentRoutines", {
      userId,
      projectId: args.projectId,
      title: idea.title,
      platform: args.platform || idea.platform || "other",
      status: "plan",
      statusHistory: [
        {
          status: "plan",
          timestamp: now,
        },
      ],
      notes: idea.description,
      createdAt: now,
      updatedAt: now,
    });

    // Update idea status
    await ctx.db.patch(args.ideaId, {
      status: "converted_to_routine",
      convertedToType: "routine",
      convertedToId: routineId,
      updatedAt: now,
    });

    return routineId;
  },
});

/**
 * Internal mutation to create content ideas
 */
export const createContentIdeas = internalMutation({
  args: {
    userId: v.string(),
    ideas: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        platform: v.optional(
          v.union(
            v.literal("tiktok"),
            v.literal("instagram"),
            v.literal("youtube"),
            v.literal("x"),
            v.literal("facebook"),
            v.literal("threads"),
            v.literal("other"),
          ),
        ),
        metadata: v.optional(v.any()),
      }),
    ),
    source: v.union(
      v.literal("ai_suggestion"),
      v.literal("manual"),
      v.literal("chat_generated"),
    ),
    suggestedDate: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const ideaIds: any[] = [];

    for (const idea of args.ideas) {
      const ideaId = await ctx.db.insert("contentIdeas", {
        userId: args.userId,
        title: idea.title,
        description: idea.description,
        source: args.source,
        suggestedDate: args.suggestedDate,
        status: "suggestion",
        platform: idea.platform,
        metadata: idea.metadata,
        createdAt: now,
        updatedAt: now,
      });
      ideaIds.push(ideaId);
    }

    // Create or update dailyContentSuggestions record
    const existing = await ctx.db
      .query("dailyContentSuggestions")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).eq("suggestionDate", args.suggestedDate),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ideaIds: [...existing.ideaIds, ...ideaIds],
      });
    } else {
      await ctx.db.insert("dailyContentSuggestions", {
        userId: args.userId,
        suggestionDate: args.suggestedDate,
        ideaIds,
        createdAt: now,
      });
    }

    return ideaIds;
  },
});

/**
 * Create a content idea manually (from form)
 */
export const createContentIdea = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    platform: v.optional(
      v.union(
        v.literal("tiktok"),
        v.literal("instagram"),
        v.literal("youtube"),
        v.literal("x"),
        v.literal("facebook"),
        v.literal("threads"),
        v.literal("other"),
      ),
    ),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const now = Date.now();

    const ideaId = await ctx.db.insert("contentIdeas", {
      userId,
      title: args.title,
      description: args.description,
      source: "manual",
      status: "suggestion",
      platform: args.platform,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    });

    return ideaId;
  },
});

/**
 * Update a content idea
 */
export const updateContentIdea = mutation({
  args: {
    ideaId: v.id("contentIdeas"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    platform: v.optional(
      v.union(
        v.literal("tiktok"),
        v.literal("instagram"),
        v.literal("youtube"),
        v.literal("x"),
        v.literal("facebook"),
        v.literal("threads"),
        v.literal("other"),
      ),
    ),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const idea = await ctx.db.get(args.ideaId);
    if (!idea || idea.userId !== userId) {
      throw new Error("Idea not found or unauthorized");
    }

    // Don't allow updating if already converted
    if (idea.status !== "suggestion" && idea.status !== "dismissed") {
      throw new Error("Cannot update converted idea");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.platform !== undefined) updates.platform = args.platform;
    if (args.metadata !== undefined) updates.metadata = args.metadata;

    await ctx.db.patch(args.ideaId, updates);

    return { success: true };
  },
});

/**
 * Delete a content idea
 */
export const deleteContentIdea = mutation({
  args: {
    ideaId: v.id("contentIdeas"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const idea = await ctx.db.get(args.ideaId);
    if (!idea || idea.userId !== userId) {
      throw new Error("Idea not found or unauthorized");
    }

    // Don't allow deleting if already converted
    if (idea.status !== "suggestion" && idea.status !== "dismissed") {
      throw new Error("Cannot delete converted idea");
    }

    await ctx.db.delete(args.ideaId);

    // Remove from dailyContentSuggestions if present
    if (idea.suggestedDate) {
      const suggestion = await ctx.db
        .query("dailyContentSuggestions")
        .withIndex("by_user_date", (q) =>
          q.eq("userId", userId).eq("suggestionDate", idea.suggestedDate!),
        )
        .first();

      if (suggestion) {
        const updatedIdeaIds = suggestion.ideaIds.filter(
          (id) => id !== args.ideaId,
        );
        if (updatedIdeaIds.length === 0) {
          await ctx.db.delete(suggestion._id);
        } else {
          await ctx.db.patch(suggestion._id, {
            ideaIds: updatedIdeaIds,
          });
        }
      }
    }

    return { success: true };
  },
});
