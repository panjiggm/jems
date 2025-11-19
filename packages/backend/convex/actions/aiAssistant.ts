"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { currentUserId } from "../auth";
import { internal } from "../_generated/api";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
  baseURL: process.env.OPENAI_BASE_URL as string,
});

/**
 * Chat with AI Assistant - handles user message and generates AI response
 * Uses RAG context from user's profile, persona, niches, and content history
 */
export const chatWithAI = action({
  args: {
    threadId: v.id("aiAssistantThreads"),
    message: v.string(),
  },
  handler: async (ctx, args): Promise<{ response: string; usage?: any }> => {
    const userId = await currentUserId(ctx);

    // Verify thread belongs to user
    const thread = await ctx.runQuery(
      internal.queries.aiAssistant.getThreadById,
      {
        threadId: args.threadId,
        userId,
      },
    );

    if (!thread) {
      throw new Error("Thread not found or unauthorized");
    }

    // Get RAG context for the user
    const ragContext: string = await ctx.runQuery(
      internal.utils.ragContext.getRAGContext,
      {
        userId,
        limit: 10,
      },
    );

    // Get previous messages in thread (limit to last 20 for context window)
    const messages: Array<{ role: string; content: string }> =
      await ctx.runQuery(internal.queries.aiAssistant.getMessagesForThread, {
        threadId: args.threadId,
        limit: 20,
      });

    // Create system prompt with RAG context
    const systemPrompt: string = `You are an AI Assistant helping a content creator manage their content strategy.

${ragContext}

Instructions:
- Use the user's profile, persona, niches, and content history to provide relevant suggestions
- Help them brainstorm content ideas, analyze their content performance, and improve their content strategy
- Be conversational, helpful, and specific in your recommendations
- Reference their past content when relevant
- Suggest content ideas that align with their persona and niches
- If they ask about specific platforms or content types, use their historical data to inform your response

Remember: You have access to their recent content campaigns, routines, and social media stats. Use this information to provide personalized advice.`;

    // Format messages for OpenAI API
    const formattedMessages: Array<{
      role: "user" | "assistant" | "system";
      content: string;
    }> = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      {
        role: "user" as const,
        content: args.message,
      },
    ];

    // Generate AI response using OpenAI streaming
    const stream = await openai.chat.completions.create({
      model: process.env.AI_MODEL as string,
      messages: formattedMessages,
      stream: true,
    });

    // Create initial empty AI message for streaming
    const now = Date.now();
    let messageId: string | undefined = undefined;
    let fullResponse = "";
    let chunkCount = 0;
    const CHUNK_BATCH_SIZE = 3; // Update database every N chunks for better performance

    // Stream chunks and update database incrementally
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        chunkCount++;

        // Update database every N chunks or on first chunk
        if (chunkCount === 1 || chunkCount % CHUNK_BATCH_SIZE === 0) {
          const result = await ctx.runMutation(
            internal.mutations.aiAssistant.upsertStreamingAIMessage,
            {
              threadId: args.threadId,
              messageId: messageId as any,
              content: fullResponse,
              metadata: {
                model: process.env.AI_MODEL || "unknown",
                tokensUsed: undefined,
                streaming: true,
              },
              createdAt: now,
              isComplete: false,
            },
          );

          // Store messageId on first creation
          if (!messageId && result) {
            messageId = result as string;
          }
        }
      }
    }

    // Final update to mark message as complete
    if (messageId) {
      await ctx.runMutation(
        internal.mutations.aiAssistant.upsertStreamingAIMessage,
        {
          threadId: args.threadId,
          messageId: messageId as any,
          content: fullResponse,
          metadata: {
            model: process.env.AI_MODEL || "unknown",
            tokensUsed: undefined,
            streaming: false,
          },
          createdAt: now,
          isComplete: true,
        },
      );
    } else {
      // Fallback: create message if streaming didn't work properly
      await ctx.runMutation(internal.mutations.aiAssistant.insertAIMessage, {
        threadId: args.threadId,
        content: fullResponse,
        metadata: {
          model: process.env.AI_MODEL || "unknown",
          tokensUsed: undefined,
        },
        createdAt: now,
      });
    }

    // Update thread updatedAt
    await ctx.runMutation(
      internal.mutations.aiAssistant.updateThreadTimestamp,
      {
        threadId: args.threadId,
        timestamp: now,
      },
    );

    // Note: OpenAI streaming doesn't provide usage in chunks
    // Usage info would need to be tracked separately if needed
    const usage = undefined;

    return {
      response: fullResponse,
      usage,
    };
  },
});
