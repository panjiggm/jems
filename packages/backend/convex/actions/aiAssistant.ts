"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { currentUserId } from "../auth";
import { internal } from "../_generated/api";
import { languageModel } from "../models";
import { streamText } from "ai";

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

    // Format messages for AI
    const formattedMessages: Array<{
      role: "user" | "assistant";
      content: string;
    }> = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

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

    // Generate AI response using streamText
    const result: Awaited<ReturnType<typeof streamText>> = await streamText({
      model: languageModel,
      system: systemPrompt,
      messages: [
        ...formattedMessages,
        {
          role: "user" as const,
          content: args.message,
        },
      ] as Array<{ role: "user" | "assistant"; content: string }>,
    });

    // Collect the full response text
    let fullResponse = "";
    for await (const textPart of result.textStream) {
      fullResponse += textPart;
    }

    // Get usage info
    const usage = await result.usage;

    // Save both user message and AI response
    const now = Date.now();

    // User message is already saved by the mutation that calls this action
    // Just save the AI response
    await ctx.runMutation(internal.mutations.aiAssistant.insertAIMessage, {
      threadId: args.threadId,
      content: fullResponse,
      metadata: {
        model: "gpt-5-nano",
        tokensUsed: usage?.totalTokens,
      },
      createdAt: now,
    });

    // Update thread updatedAt
    await ctx.runMutation(
      internal.mutations.aiAssistant.updateThreadTimestamp,
      {
        threadId: args.threadId,
        timestamp: now,
      },
    );

    return {
      response: fullResponse,
      usage,
    };
  },
});
