import { query } from "../_generated/server";
import { v } from "convex/values";
import { currentUserId } from "../auth";

/**
 * Get daily suggestions for a specific date
 */
export const getDailySuggestions = query({
  args: {
    date: v.optional(v.string()), // ISO date string, defaults to today
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    if (!userId) return null;

    const suggestionDate = args.date || new Date().toISOString().split("T")[0];

    const suggestion = await ctx.db
      .query("dailyContentSuggestions")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", userId).eq("suggestionDate", suggestionDate),
      )
      .first();

    if (!suggestion) {
      return null;
    }

    const ideas = await Promise.all(
      suggestion.ideaIds.map((id) => ctx.db.get(id)).filter(Boolean),
    );

    return {
      ...suggestion,
      ideas,
    };
  },
});

/**
 * Get all active suggestions (not converted or dismissed)
 */
export const getActiveSuggestions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    if (!userId) return [];

    const limit = Math.min(args.limit ?? 50, 100);

    const ideas = await ctx.db
      .query("contentIdeas")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "suggestion"),
      )
      .order("desc")
      .take(limit);

    return ideas;
  },
});

/**
 * List all content ideas with filters
 */
export const listContentIdeas = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("suggestion"),
        v.literal("converted_to_campaign"),
        v.literal("converted_to_routine"),
        v.literal("dismissed"),
      ),
    ),
    source: v.optional(
      v.union(
        v.literal("ai_suggestion"),
        v.literal("manual"),
        v.literal("chat_generated"),
      ),
    ),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    if (!userId) return { items: [], isDone: true, cursor: undefined };

    const limit = Math.min(args.limit ?? 20, 100);

    let query = ctx.db
      .query("contentIdeas")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    if (args.status) {
      const status = args.status;
      query = ctx.db
        .query("contentIdeas")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", userId).eq("status", status),
        );
    } else if (args.source) {
      const source = args.source;
      query = ctx.db
        .query("contentIdeas")
        .withIndex("by_user_source", (q) =>
          q.eq("userId", userId).eq("source", source),
        );
    }

    let result: {
      page: any[];
      isDone: boolean;
      continueCursor: string | undefined;
    };

    if (args.cursor) {
      const paginatedResult = await query.order("desc").paginate({
        cursor: args.cursor,
        numItems: limit,
      });
      result = {
        page: paginatedResult.page,
        isDone: paginatedResult.isDone,
        continueCursor: paginatedResult.continueCursor,
      };
    } else {
      const items = await query.order("desc").take(limit);
      result = {
        page: items,
        isDone: items.length < limit,
        continueCursor:
          items.length > 0 ? items[items.length - 1]._id : undefined,
      };
    }

    return {
      items: result.page,
      isDone: result.isDone,
      cursor: result.continueCursor,
    };
  },
});

/**
 * Get a single content idea
 */
export const getContentIdea = query({
  args: {
    ideaId: v.id("contentIdeas"),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    if (!userId) return null;

    const idea = await ctx.db.get(args.ideaId);
    if (!idea || idea.userId !== userId) {
      return null;
    }

    return idea;
  },
});
