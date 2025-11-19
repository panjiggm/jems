import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { currentUserId } from "../auth";
/**
 * Create a new AI Assistant thread
 */
export const createThread = mutation({
  args: {
    title: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);

    const now = Date.now();
    const title = args.title || "New Chat";

    const threadId = await ctx.db.insert("aiAssistantThreads", {
      userId,
      title,
      createdAt: now,
      updatedAt: now,
      metadata: args.metadata,
    });

    return threadId;
  },
});

/**
 * Delete a thread
 */
export const deleteThread = mutation({
  args: {
    threadId: v.id("aiAssistantThreads"),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.userId !== userId) {
      throw new Error("Thread not found or unauthorized");
    }

    // Delete all messages in the thread
    const messages = await ctx.db
      .query("aiAssistantMessages")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete the thread
    await ctx.db.delete(args.threadId);

    return { success: true };
  },
});

/**
 * Update thread title
 */
export const updateThreadTitle = mutation({
  args: {
    threadId: v.id("aiAssistantThreads"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.userId !== userId) {
      throw new Error("Thread not found or unauthorized");
    }

    await ctx.db.patch(args.threadId, {
      title: args.title,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Send a message (user message only, AI response handled by action)
 */
export const sendMessage = mutation({
  args: {
    threadId: v.id("aiAssistantThreads"),
    content: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.userId !== userId) {
      throw new Error("Thread not found or unauthorized");
    }

    const now = Date.now();

    // Insert user message
    const messageId = await ctx.db.insert("aiAssistantMessages", {
      threadId: args.threadId,
      role: "user",
      content: args.content,
      createdAt: now,
      metadata: args.metadata,
    });

    // Update thread updatedAt
    await ctx.db.patch(args.threadId, {
      updatedAt: now,
    });

    // Auto-generate title from first message if not set
    if (thread.title === "New Chat" || thread.title === "") {
      const title = args.content.substring(0, 50).trim();
      if (title) {
        await ctx.db.patch(args.threadId, {
          title: title + (args.content.length > 50 ? "..." : ""),
        });
      }
    }

    return messageId;
  },
});

/**
 * Internal mutation to insert AI message
 */
export const insertAIMessage = internalMutation({
  args: {
    threadId: v.id("aiAssistantThreads"),
    content: v.string(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("aiAssistantMessages", {
      threadId: args.threadId,
      role: "assistant",
      content: args.content,
      createdAt: args.createdAt,
      metadata: args.metadata,
    });
  },
});

/**
 * Internal mutation to update thread timestamp
 */
export const updateThreadTimestamp = internalMutation({
  args: {
    threadId: v.id("aiAssistantThreads"),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.threadId, {
      updatedAt: args.timestamp,
    });
  },
});

/**
 * Internal mutation to create or update AI message for streaming
 * Creates message if it doesn't exist, or updates content if it does
 */
export const upsertStreamingAIMessage = internalMutation({
  args: {
    threadId: v.id("aiAssistantThreads"),
    messageId: v.optional(v.id("aiAssistantMessages")),
    content: v.string(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    isComplete: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.messageId) {
      // Update existing message
      await ctx.db.patch(args.messageId, {
        content: args.content,
        metadata: args.metadata,
      });
    } else {
      // Create new message
      const messageId = await ctx.db.insert("aiAssistantMessages", {
        threadId: args.threadId,
        role: "assistant",
        content: args.content,
        createdAt: args.createdAt,
        metadata: args.metadata,
      });
      return messageId;
    }
  },
});
