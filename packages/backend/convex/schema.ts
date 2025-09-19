import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { Auth } from "convex/server";

export const getUserId = async (ctx: { auth: Auth }) => {
  return (await ctx.auth.getUserIdentity())?.subject;
};

export default defineSchema({
  profile: defineTable({
    userId: v.string(),
    full_name: v.string(),
    phone: v.string(),
    avatar_url: v.string(),
    is_onboarding_completed: v.boolean(),
  }),
  niches: defineTable({
    slug: v.string(),
    label: v.string(),
    category: v.string(),
    emoji: v.optional(v.string()),
  }),
  persona: defineTable({
    userId: v.string(),
    nicheIds: v.array(v.id("niches")),
    bio: v.string(),
    ai_prompt: v.string(),
  }),

  // Feature #1 - Projects & Content Planning
  projects: defineTable({
    userId: v.string(),
    title: v.string(),
    type: v.union(
      v.literal("campaign"),
      v.literal("series"),
      v.literal("routine"),
    ),
    description: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_createdAt", ["userId", "createdAt"]),

  contents: defineTable({
    userId: v.string(),
    projectId: v.id("projects"),
    title: v.string(),
    platform: v.union(
      v.literal("tiktok"),
      v.literal("instagram"),
      v.literal("youtube"),
      v.literal("x"),
      v.literal("facebook"),
      v.literal("threads"),
      v.literal("other"),
    ),
    status: v.union(
      v.literal("draft"),
      v.literal("in_progress"),
      v.literal("scheduled"),
      v.literal("published"),
    ),
    dueDate: v.optional(v.string()),
    scheduledAt: v.optional(v.string()),
    publishedAt: v.optional(v.string()),
    notes: v.optional(v.string()),
    assetIds: v.optional(v.array(v.string())),
    aiMetadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_project", ["userId", "projectId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_user_platform", ["userId", "platform"])
    .index("by_user_dueDate", ["userId", "dueDate"]),

  tasks: defineTable({
    userId: v.string(),
    projectId: v.id("projects"),
    contentId: v.optional(v.id("contents")),
    title: v.string(),
    status: v.union(v.literal("todo"), v.literal("doing"), v.literal("done")),
    dueDate: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_project", ["userId", "projectId"])
    .index("by_user_dueDate", ["userId", "dueDate"]),
});
