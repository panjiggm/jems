import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";
import { Auth } from "convex/server";

export const getUserId = async (ctx: { auth: Auth }) => {
  return (await ctx.auth.getUserIdentity())?.subject;
};

// Reusable media item shape for file attachments stored in Convex Storage
const mediaItem = v.object({
  storageId: v.id("_storage"),
  filename: v.string(),
  size: v.number(), // bytes
  contentType: v.string(), // e.g. video/mp4
  extension: v.string(), // e.g. mp4
  durationMs: v.optional(v.number()),
  width: v.optional(v.number()),
  height: v.optional(v.number()),
  uploadedAt: v.number(),
});

export type MediaItem = Infer<typeof mediaItem>;

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

  contentCampaigns: defineTable({
    userId: v.string(),
    projectId: v.id("projects"),
    title: v.string(),
    slug: v.optional(v.string()), // URL-safe slug for page routing (optional during migration)
    sow: v.optional(v.string()), // Statement of Work
    platform: v.union(
      v.literal("tiktok"),
      v.literal("instagram"),
      v.literal("youtube"),
      v.literal("x"),
      v.literal("facebook"),
      v.literal("threads"),
      v.literal("other"),
    ),
    type: v.union(v.literal("barter"), v.literal("paid")),
    status: v.union(
      v.literal("product_obtained"),
      v.literal("production"),
      v.literal("published"),
      v.literal("payment"),
      v.literal("done"),
    ),
    statusHistory: v.array(
      v.object({
        status: v.string(),
        timestamp: v.number(),
        publishedAt: v.optional(v.string()),
        note: v.optional(v.string()),
      }),
    ),
    statusDurations: v.optional(
      v.object({
        product_obtained_to_production: v.optional(v.string()),
        production_to_published: v.optional(v.string()),
        published_to_payment: v.optional(v.string()),
        payment_to_done: v.optional(v.string()),
      }),
    ),
    // Multiple media files attached to the campaign (videos/images/documents)
    mediaFiles: v.optional(v.array(mediaItem)),
    notes: v.optional(v.string()),
    // Social media publish info
    publishInfo: v.optional(
      v.object({
        isPublished: v.boolean(),
        scheduledPublishId: v.optional(v.id("scheduledPublishes")),
        publishedAt: v.optional(v.string()),
        platformPostId: v.optional(v.string()),
        platformPostUrl: v.optional(v.string()),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_project", ["userId", "projectId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_user_platform", ["userId", "platform"])
    .index("by_user_slug", ["userId", "slug"]),

  contentRoutines: defineTable({
    userId: v.string(),
    projectId: v.id("projects"),
    title: v.string(),
    slug: v.optional(v.string()), // URL-safe slug for page routing (optional during migration)
    notes: v.optional(v.string()),
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
      v.literal("plan"),
      v.literal("in_progress"),
      v.literal("scheduled"),
      v.literal("published"),
    ),
    statusHistory: v.array(
      v.object({
        status: v.string(),
        timestamp: v.number(),
        scheduledAt: v.optional(v.string()),
        publishedAt: v.optional(v.string()),
        note: v.optional(v.string()),
      }),
    ),
    statusDurations: v.optional(
      v.object({
        plan_to_in_progress: v.optional(v.string()),
        in_progress_to_scheduled: v.optional(v.string()),
        scheduled_to_published: v.optional(v.string()),
      }),
    ),
    // Multiple media files attached to the routine (videos/images/documents)
    mediaFiles: v.optional(v.array(mediaItem)),
    // Social media publish info
    publishInfo: v.optional(
      v.object({
        isPublished: v.boolean(),
        scheduledPublishId: v.optional(v.id("scheduledPublishes")),
        publishedAt: v.optional(v.string()),
        platformPostId: v.optional(v.string()),
        platformPostUrl: v.optional(v.string()),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_project", ["userId", "projectId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_user_platform", ["userId", "platform"])
    .index("by_user_slug", ["userId", "slug"]),

  tasks: defineTable({
    userId: v.string(),
    projectId: v.id("projects"),
    contentId: v.optional(v.string()), // Polymorphic reference
    contentType: v.optional(
      v.union(v.literal("campaign"), v.literal("routine")),
    ),
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
      v.literal("content_campaign"),
      v.literal("content_routine"),
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

  // Feature #2 - Social Media Integration
  socialMediaAccounts: defineTable({
    userId: v.string(),
    platform: v.union(
      v.literal("tiktok"),
      v.literal("instagram"),
      v.literal("youtube"),
      v.literal("x"),
      v.literal("facebook"),
      v.literal("threads"),
    ),
    // Account info from platform
    platformAccountId: v.string(), // e.g. @username or numeric ID from platform
    displayName: v.string(),
    profileImageUrl: v.optional(v.string()),
    // OAuth credentials (should be encrypted in production)
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    tokenExpiresAt: v.optional(v.number()),
    // Connection status
    isConnected: v.boolean(),
    lastSyncedAt: v.optional(v.number()),
    lastError: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_platform", ["userId", "platform"])
    .index("by_platform", ["platform"]),

  socialMediaStats: defineTable({
    userId: v.string(),
    accountId: v.id("socialMediaAccounts"),
    platform: v.union(
      v.literal("tiktok"),
      v.literal("instagram"),
      v.literal("youtube"),
      v.literal("x"),
      v.literal("facebook"),
      v.literal("threads"),
    ),
    // Common metrics
    followersCount: v.optional(v.number()),
    followingCount: v.optional(v.number()),
    // Platform-specific metrics stored flexibly
    platformMetrics: v.optional(
      v.object({
        totalLikes: v.optional(v.number()), // TikTok, Instagram
        totalViews: v.optional(v.number()), // TikTok, YouTube, Instagram
        totalVideos: v.optional(v.number()), // TikTok, YouTube
        totalPosts: v.optional(v.number()), // Instagram, X, Facebook
        subscribersCount: v.optional(v.number()), // YouTube
        totalTweets: v.optional(v.number()), // X (Twitter)
        totalRetweets: v.optional(v.number()), // X
        engagementRate: v.optional(v.number()), // All platforms
      }),
    ),
    syncedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_account", ["accountId"])
    .index("by_user_platform", ["userId", "platform"])
    .index("by_synced", ["syncedAt"]),

  scheduledPublishes: defineTable({
    userId: v.string(),
    // Polymorphic reference to content
    contentType: v.union(v.literal("campaign"), v.literal("routine")),
    contentId: v.union(v.id("contentCampaigns"), v.id("contentRoutines")), // Will also accept contentRoutines ID
    // Publishing target
    platform: v.union(
      v.literal("tiktok"),
      v.literal("instagram"),
      v.literal("youtube"),
      v.literal("x"),
      v.literal("facebook"),
      v.literal("threads"),
    ),
    accountId: v.id("socialMediaAccounts"),
    // Schedule & status
    scheduledAt: v.string(), // ISO datetime
    status: v.union(
      v.literal("pending"), // Waiting for scheduled time
      v.literal("processing"), // Currently publishing
      v.literal("published"), // Successfully published
      v.literal("failed"), // Failed to publish
      v.literal("cancelled"), // User cancelled
    ),
    // Publishing results
    publishedAt: v.optional(v.number()),
    platformPostId: v.optional(v.string()), // ID of post on platform
    platformPostUrl: v.optional(v.string()), // URL to post
    errorMessage: v.optional(v.string()),
    retryCount: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_content", ["contentType", "contentId"])
    .index("by_account", ["accountId"])
    .index("by_status", ["status"])
    .index("by_scheduled", ["scheduledAt"])
    .index("by_user_status", ["userId", "status"]),
});
