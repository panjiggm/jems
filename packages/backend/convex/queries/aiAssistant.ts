import { query, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { getUserId } from "../schema";

/**
 * List all threads for the current user
 */
export const listThreads = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const limit = Math.min(args.limit ?? 50, 100);

    const threads = await ctx.db
      .query("aiAssistantThreads")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return threads;
  },
});

/**
 * Get a single thread with its messages
 */
export const getThread = query({
  args: {
    threadId: v.id("aiAssistantThreads"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.userId !== userId) {
      return null;
    }

    const messages = await ctx.db
      .query("aiAssistantMessages")
      .withIndex("by_thread_createdAt", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();

    return {
      ...thread,
      messages,
    };
  },
});

/**
 * Get messages for a thread with pagination
 */
export const getMessages = query({
  args: {
    threadId: v.id("aiAssistantThreads"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return { items: [], isDone: true, cursor: undefined };

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.userId !== userId) {
      return { items: [], isDone: true, cursor: undefined };
    }

    const limit = Math.min(args.limit ?? 50, 100);

    const query = ctx.db
      .query("aiAssistantMessages")
      .withIndex("by_thread_createdAt", (q) => q.eq("threadId", args.threadId));

    const result: {
      page: any[];
      isDone: boolean;
      continueCursor?: string;
    } = await (args.cursor
      ? query.order("asc").paginate({
          cursor: args.cursor,
          numItems: limit,
        })
      : query
          .order("asc")
          .take(limit)
          .then((items) => ({
            page: items,
            isDone: items.length < limit,
            continueCursor:
              items.length > 0 ? items[items.length - 1]._id : undefined,
          })));

    return {
      items: result.page,
      isDone: result.isDone,
      cursor: result.continueCursor,
    };
  },
});

/**
 * Internal query to get thread by ID (for verification)
 */
export const getThreadById = internalQuery({
  args: {
    threadId: v.id("aiAssistantThreads"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.userId !== args.userId) {
      return null;
    }
    return thread;
  },
});

/**
 * Internal query to get messages for thread (for AI context)
 */
export const getMessagesForThread = internalQuery({
  args: {
    threadId: v.id("aiAssistantThreads"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 20, 50);

    const messages = await ctx.db
      .query("aiAssistantMessages")
      .withIndex("by_thread_createdAt", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .take(limit);

    return messages;
  },
});
