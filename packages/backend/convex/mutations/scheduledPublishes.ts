import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { currentUserId } from "../auth";
import { Id } from "../_generated/dataModel";

// Schedule a content for publishing
export const create = mutation({
  args: {
    contentType: v.union(v.literal("campaign"), v.literal("routine")),
    contentId: v.union(v.id("contentCampaigns"), v.id("contentRoutines")), // Will also accept contentRoutines ID
    platform: v.union(
      v.literal("tiktok"),
      v.literal("instagram"),
      v.literal("youtube"),
      v.literal("x"),
      v.literal("facebook"),
      v.literal("threads"),
    ),
    accountId: v.id("socialMediaAccounts"),
    scheduledAt: v.string(), // ISO datetime
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    const now = Date.now();

    // Validate scheduled time is in the future
    const scheduledTime = new Date(args.scheduledAt);
    if (scheduledTime <= new Date()) {
      throw new Error("Scheduled time must be in the future");
    }

    // Validate account exists and belongs to user
    const account = await ctx.db.get(args.accountId);
    if (!account || account.userId !== userId) {
      throw new Error("Account not found");
    }

    // Validate account platform matches
    if (account.platform !== args.platform) {
      throw new Error("Account platform does not match selected platform");
    }

    // Validate account is connected
    if (!account.isConnected) {
      throw new Error(
        "Account is not connected. Please reconnect your account.",
      );
    }

    // Validate content exists
    const tableName =
      args.contentType === "campaign" ? "contentCampaigns" : "contentRoutines";
    const content = await ctx.db.get(
      args.contentId as Id<"contentCampaigns" | "contentRoutines">,
    );
    if (!content || (content as any).userId !== userId) {
      throw new Error("Content not found");
    }

    // Check if there's already a pending or processing schedule for this content
    const existingSchedule = await ctx.db
      .query("scheduledPublishes")
      .withIndex("by_content", (q) =>
        q
          .eq("contentType", args.contentType)
          .eq(
            "contentId",
            args.contentId as Id<"contentCampaigns" | "contentRoutines">,
          ),
      )
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("status"), "processing"),
        ),
      )
      .first();

    if (existingSchedule) {
      throw new Error(
        "This content already has a pending or processing schedule",
      );
    }

    const scheduleId = await ctx.db.insert("scheduledPublishes", {
      userId,
      contentType: args.contentType,
      contentId: args.contentId,
      platform: args.platform,
      accountId: args.accountId,
      scheduledAt: args.scheduledAt,
      status: "pending",
      retryCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Update content with scheduled publish info
    await ctx.db.patch(
      args.contentId as Id<"contentCampaigns" | "contentRoutines">,
      {
        publishInfo: {
          isPublished: false,
          scheduledPublishId: scheduleId,
        },
        updatedAt: now,
      },
    );

    return scheduleId;
  },
});

// Update scheduled time
export const updateScheduledTime = mutation({
  args: {
    scheduleId: v.id("scheduledPublishes"),
    scheduledAt: v.string(),
  },
  handler: async (ctx, { scheduleId, scheduledAt }) => {
    const userId = await currentUserId(ctx);
    const schedule = await ctx.db.get(scheduleId);

    if (!schedule || schedule.userId !== userId) {
      throw new Error("Schedule not found");
    }

    // Can only update if status is pending
    if (schedule.status !== "pending") {
      throw new Error("Can only update pending schedules");
    }

    // Validate scheduled time is in the future
    const scheduledTime = new Date(scheduledAt);
    if (scheduledTime <= new Date()) {
      throw new Error("Scheduled time must be in the future");
    }

    await ctx.db.patch(scheduleId, {
      scheduledAt,
      updatedAt: Date.now(),
    });

    return scheduleId;
  },
});

// Cancel a scheduled publish
export const cancel = mutation({
  args: {
    scheduleId: v.id("scheduledPublishes"),
  },
  handler: async (ctx, { scheduleId }) => {
    const userId = await currentUserId(ctx);
    const schedule = await ctx.db.get(scheduleId);

    if (!schedule || schedule.userId !== userId) {
      throw new Error("Schedule not found");
    }

    // Can only cancel if status is pending or failed
    if (!["pending", "failed"].includes(schedule.status)) {
      throw new Error("Can only cancel pending or failed schedules");
    }

    const now = Date.now();

    await ctx.db.patch(scheduleId, {
      status: "cancelled",
      updatedAt: now,
    });

    // Update content publishInfo
    const content = await ctx.db.get(
      schedule.contentId as Id<"contentCampaigns" | "contentRoutines">,
    );
    if (content && content.publishInfo?.scheduledPublishId === scheduleId) {
      await ctx.db.patch(
        schedule.contentId as Id<"contentCampaigns" | "contentRoutines">,
        {
          publishInfo: {
            ...content.publishInfo,
            scheduledPublishId: undefined,
          },
          updatedAt: now,
        },
      );
    }

    return true;
  },
});

// Update status to processing (internal use by scheduled function)
export const setProcessing = mutation({
  args: {
    scheduleId: v.id("scheduledPublishes"),
  },
  handler: async (ctx, { scheduleId }) => {
    const schedule = await ctx.db.get(scheduleId);

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    if (schedule.status !== "pending") {
      throw new Error("Can only process pending schedules");
    }

    await ctx.db.patch(scheduleId, {
      status: "processing",
      updatedAt: Date.now(),
    });

    return scheduleId;
  },
});

// Mark as published (internal use after successful publish)
export const setPublished = mutation({
  args: {
    scheduleId: v.id("scheduledPublishes"),
    platformPostId: v.string(),
    platformPostUrl: v.string(),
  },
  handler: async (ctx, { scheduleId, platformPostId, platformPostUrl }) => {
    const schedule = await ctx.db.get(scheduleId);

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    const now = Date.now();

    await ctx.db.patch(scheduleId, {
      status: "published",
      publishedAt: now,
      platformPostId,
      platformPostUrl,
      updatedAt: now,
    });

    // Update content publishInfo
    await ctx.db.patch(
      schedule.contentId as Id<"contentCampaigns" | "contentRoutines">,
      {
        publishInfo: {
          isPublished: true,
          scheduledPublishId: scheduleId,
          publishedAt: new Date(now).toISOString(),
          platformPostId,
          platformPostUrl,
        },
        updatedAt: now,
      },
    );

    return scheduleId;
  },
});

// Mark as failed (internal use after failed publish)
export const setFailed = mutation({
  args: {
    scheduleId: v.id("scheduledPublishes"),
    errorMessage: v.string(),
  },
  handler: async (ctx, { scheduleId, errorMessage }) => {
    const schedule = await ctx.db.get(scheduleId);

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    const retryCount = (schedule.retryCount || 0) + 1;

    await ctx.db.patch(scheduleId, {
      status: "failed",
      errorMessage,
      retryCount,
      updatedAt: Date.now(),
    });

    return scheduleId;
  },
});

// Retry a failed publish
export const retry = mutation({
  args: {
    scheduleId: v.id("scheduledPublishes"),
    scheduledAt: v.optional(v.string()), // Optional new scheduled time
  },
  handler: async (ctx, { scheduleId, scheduledAt }) => {
    const userId = await currentUserId(ctx);
    const schedule = await ctx.db.get(scheduleId);

    if (!schedule || schedule.userId !== userId) {
      throw new Error("Schedule not found");
    }

    if (schedule.status !== "failed") {
      throw new Error("Can only retry failed schedules");
    }

    // Check if we've exceeded max retries
    if ((schedule.retryCount || 0) >= 3) {
      throw new Error("Maximum retry attempts exceeded");
    }

    const updates: any = {
      status: "pending",
      errorMessage: undefined,
      updatedAt: Date.now(),
    };

    if (scheduledAt) {
      // Validate scheduled time is in the future
      const scheduledTime = new Date(scheduledAt);
      if (scheduledTime <= new Date()) {
        throw new Error("Scheduled time must be in the future");
      }
      updates.scheduledAt = scheduledAt;
    }

    await ctx.db.patch(scheduleId, updates);

    return scheduleId;
  },
});

// Delete a schedule (only if cancelled or failed)
export const remove = mutation({
  args: {
    scheduleId: v.id("scheduledPublishes"),
  },
  handler: async (ctx, { scheduleId }) => {
    const userId = await currentUserId(ctx);
    const schedule = await ctx.db.get(scheduleId);

    if (!schedule || schedule.userId !== userId) {
      throw new Error("Schedule not found");
    }

    // Can only delete if cancelled or failed
    if (!["cancelled", "failed"].includes(schedule.status)) {
      throw new Error("Can only delete cancelled or failed schedules");
    }

    // Clear reference in content if exists
    const content = await ctx.db.get(
      schedule.contentId as Id<"contentCampaigns" | "contentRoutines">,
    );
    if (content && content.publishInfo?.scheduledPublishId === scheduleId) {
      await ctx.db.patch(
        schedule.contentId as Id<"contentCampaigns" | "contentRoutines">,
        {
          publishInfo: {
            ...content.publishInfo,
            scheduledPublishId: undefined,
          },
          updatedAt: Date.now(),
        },
      );
    }

    await ctx.db.delete(scheduleId);

    return true;
  },
});
