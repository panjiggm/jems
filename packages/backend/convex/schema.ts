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
  }).index("by_user", ["userId"]),
  niches: defineTable({
    slug: v.string(),
    label: v.string(),
    category: v.string(),
    emoji: v.optional(v.string()),
  }).index("by_slug", ["slug"]),
  persona: defineTable({
    userId: v.string(),
    nicheIds: v.array(v.id("niches")),
    bio: v.string(),
    ai_prompt: v.string(),
  }).index("by_user", ["userId"]),

  // Feature #1 - Projects & Content Planning
  projects: defineTable({
    userId: v.string(),
    title: v.string(),
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
    type: v.union(
      v.literal("campaign"),
      v.literal("series"),
      v.literal("routine"),
    ),
    status: v.union(
      v.literal("confirmed"),
      v.literal("shipped"),
      v.literal("received"),
      v.literal("shooting"),
      v.literal("drafting"),
      v.literal("editing"),
      v.literal("done"),
      v.literal("pending payment"),
      v.literal("paid"),
      v.literal("canceled"),
      v.literal("ideation"),
      v.literal("scripting"),
      v.literal("scheduled"),
      v.literal("published"),
      v.literal("archived"),
      v.literal("planned"),
      v.literal("skipped"),
    ),
    phase: v.union(
      v.literal("plan"),
      v.literal("production"),
      v.literal("review"),
      v.literal("published"),
      v.literal("done"),
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
    status: v.union(
      v.literal("todo"),
      v.literal("doing"),
      v.literal("done"),
      v.literal("skipped"),
    ),
    dueDate: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_project", ["userId", "projectId"])
    .index("by_user_dueDate", ["userId", "dueDate"]),

  // Project Activities - Track all activities for projects, contents, and tasks
  projectActivities: defineTable({
    userId: v.string(),
    projectId: v.id("projects"),
    entityType: v.union(
      v.literal("project"),
      v.literal("content"),
      v.literal("task"),
    ),
    entityId: v.string(), // ID of the project/content/task
    action: v.union(
      v.literal("created"),
      v.literal("updated"),
      v.literal("deleted"),
      v.literal("status_changed"),
      v.literal("assigned"),
      v.literal("completed"),
      v.literal("scheduled"),
      v.literal("published"),
    ),
    description: v.optional(v.string()), // Human-readable description of the action
    metadata: v.optional(v.any()), // Additional data about the change (old/new values, etc.)
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_project", ["userId", "projectId"])
    .index("by_user_timestamp", ["userId", "timestamp"])
    .index("by_project", ["projectId"])
    .index("by_entity", ["entityType", "entityId"])
    .index("by_action", ["action"])
    .index("by_user_entity", ["userId", "entityType"])
    .index("by_project_timestamp", ["projectId", "timestamp"]),
});
