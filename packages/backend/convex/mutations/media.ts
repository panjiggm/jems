import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { currentUserId } from "../auth";
import { internal } from "../_generated/api";

const mediaItem = v.object({
  storageId: v.id("_storage"),
  filename: v.string(),
  size: v.number(),
  contentType: v.string(),
  extension: v.string(),
  durationMs: v.optional(v.number()),
  width: v.optional(v.number()),
  height: v.optional(v.number()),
  uploadedAt: v.number(),
});

export const attachCampaignMedia = mutation({
  args: { campaignId: v.id("contentCampaigns"), file: mediaItem },
  handler: async (ctx, { campaignId, file }) => {
    const userId = await currentUserId(ctx);
    const campaign = await ctx.db.get(campaignId);
    if (!campaign || campaign.userId !== userId) throw new Error("NOT_FOUND");

    const mediaFiles = [...(campaign.mediaFiles ?? []), file];
    await ctx.db.patch(campaignId, { mediaFiles, updatedAt: Date.now() });

    await ctx.scheduler.runAfter(
      0,
      internal.mutations.projectActivities.logActivity,
      {
        userId,
        projectId: campaign.projectId,
        entityType: "content_campaign" as const,
        entityId: campaignId,
        action: "updated" as const,
        description: `Attached media to campaign "${campaign.title}"`,
        metadata: {
          filename: file.filename,
          size: file.size,
          contentType: file.contentType,
        },
      },
    );

    return true;
  },
});

export const removeCampaignMedia = mutation({
  args: { campaignId: v.id("contentCampaigns"), storageId: v.id("_storage") },
  handler: async (ctx, { campaignId, storageId }) => {
    const userId = await currentUserId(ctx);
    const campaign = await ctx.db.get(campaignId);
    if (!campaign || campaign.userId !== userId) throw new Error("NOT_FOUND");

    const mediaFiles = (campaign.mediaFiles ?? []).filter(
      (m: any) => m.storageId !== storageId,
    );
    await ctx.db.patch(campaignId, { mediaFiles, updatedAt: Date.now() });

    await ctx.storage.delete(storageId);

    await ctx.scheduler.runAfter(
      0,
      internal.mutations.projectActivities.logActivity,
      {
        userId,
        projectId: campaign.projectId,
        entityType: "content_campaign" as const,
        entityId: campaignId,
        action: "updated" as const,
        description: `Removed media from campaign "${campaign.title}"`,
        metadata: { storageId },
      },
    );

    return true;
  },
});

export const attachRoutineMedia = mutation({
  args: { routineId: v.id("contentRoutines"), file: mediaItem },
  handler: async (ctx, { routineId, file }) => {
    const userId = await currentUserId(ctx);
    const routine = await ctx.db.get(routineId);
    if (!routine || routine.userId !== userId) throw new Error("NOT_FOUND");

    const mediaFiles = [...(routine.mediaFiles ?? []), file];
    await ctx.db.patch(routineId, { mediaFiles, updatedAt: Date.now() });

    await ctx.scheduler.runAfter(
      0,
      internal.mutations.projectActivities.logActivity,
      {
        userId,
        projectId: routine.projectId,
        entityType: "content_routine" as const,
        entityId: routineId,
        action: "updated" as const,
        description: `Attached media to routine "${routine.title}"`,
        metadata: {
          filename: file.filename,
          size: file.size,
          contentType: file.contentType,
        },
      },
    );

    return true;
  },
});

export const removeRoutineMedia = mutation({
  args: { routineId: v.id("contentRoutines"), storageId: v.id("_storage") },
  handler: async (ctx, { routineId, storageId }) => {
    const userId = await currentUserId(ctx);
    const routine = await ctx.db.get(routineId);
    if (!routine || routine.userId !== userId) throw new Error("NOT_FOUND");

    const mediaFiles = (routine.mediaFiles ?? []).filter(
      (m: any) => m.storageId !== storageId,
    );
    await ctx.db.patch(routineId, { mediaFiles, updatedAt: Date.now() });

    await ctx.storage.delete(storageId);

    await ctx.scheduler.runAfter(
      0,
      internal.mutations.projectActivities.logActivity,
      {
        userId,
        projectId: routine.projectId,
        entityType: "content_routine" as const,
        entityId: routineId,
        action: "updated" as const,
        description: `Removed media from routine "${routine.title}"`,
        metadata: { storageId },
      },
    );

    return true;
  },
});
