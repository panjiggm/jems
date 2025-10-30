"use node";

import { action, internalAction } from "../_generated/server";
import { v } from "convex/values";
import { languageModel } from "../models";
import { generateText } from "ai";
import { internal } from "../_generated/api";

/**
 * Generate content suggestions using AI based on user's persona, niche, and content history
 */
export const generateSuggestions = internalAction({
  args: {
    userId: v.string(),
    date: v.string(), // ISO date string
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    success: boolean;
    ideaIds: any[];
    count: number;
    fallback?: boolean;
  }> => {
    // Get RAG context for the user
    const ragContext = await ctx.runQuery(
      internal.utils.ragContext.getRAGContext,
      {
        userId: args.userId,
        limit: 15, // Get more content history for better suggestions
      },
    );

    // Get user's persona for additional context
    const persona = await ctx.runQuery(
      internal.queries.persona.getInternalPersona,
      {
        userId: args.userId,
      },
    );

    // Create prompt for generating content suggestions
    const prompt = `You are a content strategy assistant helping a content creator generate new content ideas.

${ragContext}

${persona ? `The user's persona focuses on: ${persona.bio}\nAI Prompt: ${persona.ai_prompt}` : ""}

Generate exactly 3 creative and engaging content ideas that:
1. Align with the user's persona, niches, and content style
2. Are different from their recent content (avoid repetition)
3. Are practical and actionable
4. Consider their preferred platforms and content types
5. Include a compelling title and detailed description

Format your response as a JSON array with exactly 3 objects, each containing:
- "title": A catchy, engaging title (max 60 characters)
- "description": A detailed description of the content idea (2-4 sentences explaining the concept, what makes it engaging, and how it fits their brand)
- "platform": One of: "tiktok", "instagram", "youtube", "x", "facebook", "threads", or "other" (based on their content history)
- "reasoning": Brief explanation of why this idea fits their brand (1-2 sentences)

Return ONLY the JSON array, no additional text or markdown formatting.`;

    try {
      const result = await generateText({
        model: languageModel,
        prompt,
        temperature: 0.8, // Higher temperature for more creativity
        maxOutputTokens: 1500,
      });

      // Parse the JSON response
      let suggestions;
      try {
        // Try to extract JSON from markdown code blocks if present
        const text = result.text.trim();
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const jsonText = jsonMatch ? jsonMatch[1] : text;
        suggestions = JSON.parse(jsonText);
      } catch (parseError) {
        // If parsing fails, try to extract JSON array from text
        const jsonMatch = result.text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Failed to parse AI response as JSON");
        }
      }

      // Validate and ensure we have exactly 3 suggestions
      if (!Array.isArray(suggestions)) {
        throw new Error("AI response is not an array");
      }

      // Ensure we have at least 3 suggestions, pad if needed
      const validatedSuggestions = suggestions
        .slice(0, 3)
        .map((suggestion: any, index: number) => ({
          title: suggestion.title || `Content Idea ${index + 1}`,
          description:
            suggestion.description ||
            "A creative content idea tailored to your brand.",
          platform: suggestion.platform || "other",
          metadata: {
            reasoning: suggestion.reasoning || "",
            generatedAt: new Date().toISOString(),
            model: "gpt-5-nano",
          },
        }));

      // Create content ideas in database
      const ideaIds: any[] = await ctx.runMutation(
        internal.mutations.contentIdeas.createContentIdeas,
        {
          userId: args.userId,
          ideas: validatedSuggestions,
          source: "ai_suggestion",
          suggestedDate: args.date,
        },
      );

      return { success: true, ideaIds, count: validatedSuggestions.length };
    } catch (error) {
      console.error("Error generating suggestions:", error);
      // Fallback: create basic suggestions if AI fails
      const fallbackIdeas = [
        {
          title: "Engaging Content Idea",
          description:
            "Create content that resonates with your audience based on your persona and niche.",
          platform: "other" as const,
        },
        {
          title: "Trending Topic Content",
          description:
            "Leverage current trends in your niche to create timely and relevant content.",
          platform: "other" as const,
        },
        {
          title: "Educational Content Piece",
          description:
            "Share valuable insights and knowledge that align with your brand identity.",
          platform: "other" as const,
        },
      ];

      const ideaIds: any[] = await ctx.runMutation(
        internal.mutations.contentIdeas.createContentIdeas,
        {
          userId: args.userId,
          ideas: fallbackIdeas,
          source: "ai_suggestion",
          suggestedDate: args.date,
        },
      );

      return {
        success: true,
        ideaIds,
        count: fallbackIdeas.length,
        fallback: true,
      };
    }
  },
});
