import { query } from "../_generated/server";
import { v } from "convex/values";
import { getUserId } from "../schema";

export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    // Ensure user is authenticated
    const userId = await getUserId(ctx);
    if (!userId) return null;
    const url = await ctx.storage.getUrl(storageId);
    if (!url) throw new Error("NOT_FOUND");
    return { url };
  },
});

// Get all media files grouped by content (campaigns + routines)
export const getAllMediaGrouped = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    // Fetch all campaigns with media
    let campaigns = await ctx.db
      .query("contentCampaigns")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Fetch all routines with media
    let routines = await ctx.db
      .query("contentRoutines")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Filter by search if provided
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      campaigns = campaigns.filter((c) =>
        c.title.toLowerCase().includes(searchLower),
      );
      routines = routines.filter((r) =>
        r.title.toLowerCase().includes(searchLower),
      );
    }

    // Filter only items with media files
    const campaignsWithMedia = campaigns.filter(
      (c) => c.mediaFiles && c.mediaFiles.length > 0,
    );
    const routinesWithMedia = routines.filter(
      (r) => r.mediaFiles && r.mediaFiles.length > 0,
    );

    // Get project info for each content
    const result = [];

    for (const campaign of campaignsWithMedia) {
      const project = campaign.projectId
        ? await ctx.db.get(campaign.projectId)
        : null;
      result.push({
        contentId: campaign._id,
        contentType: "campaign" as const,
        title: campaign.title,
        slug: campaign.slug,
        platform: campaign.platform,
        mediaFiles: campaign.mediaFiles || [],
        projectId: campaign.projectId,
        projectTitle: project?.title || "No Project",
        updatedAt: campaign.updatedAt,
      });
    }

    for (const routine of routinesWithMedia) {
      const project = routine.projectId
        ? await ctx.db.get(routine.projectId)
        : null;
      result.push({
        contentId: routine._id,
        contentType: "routine" as const,
        title: routine.title,
        slug: routine.slug,
        platform: routine.platform,
        mediaFiles: routine.mediaFiles || [],
        projectId: routine.projectId,
        projectTitle: project?.title || "No Project",
        updatedAt: routine.updatedAt,
      });
    }

    // Sort by updatedAt descending
    result.sort((a, b) => b.updatedAt - a.updatedAt);

    return result;
  },
});

// Get overall file statistics
export const getMediaStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId)
      return {
        totalFiles: 0,
        totalStorage: 0,
        videoCount: 0,
        imageCount: 0,
        recentUploads: 0,
        campaignFiles: 0,
        routineFiles: 0,
      };

    // Fetch all campaigns and routines
    const campaigns = await ctx.db
      .query("contentCampaigns")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const routines = await ctx.db
      .query("contentRoutines")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    let totalFiles = 0;
    let totalStorage = 0;
    let videoCount = 0;
    let imageCount = 0;
    let recentUploads = 0;
    let campaignFiles = 0;
    let routineFiles = 0;

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    // Process campaigns
    campaigns.forEach((campaign) => {
      if (campaign.mediaFiles) {
        campaign.mediaFiles.forEach((media) => {
          totalFiles++;
          campaignFiles++;
          totalStorage += media.size;

          if (media.contentType.startsWith("video/")) {
            videoCount++;
          } else if (media.contentType.startsWith("image/")) {
            imageCount++;
          }

          if (media.uploadedAt >= sevenDaysAgo) {
            recentUploads++;
          }
        });
      }
    });

    // Process routines
    routines.forEach((routine) => {
      if (routine.mediaFiles) {
        routine.mediaFiles.forEach((media) => {
          totalFiles++;
          routineFiles++;
          totalStorage += media.size;

          if (media.contentType.startsWith("video/")) {
            videoCount++;
          } else if (media.contentType.startsWith("image/")) {
            imageCount++;
          }

          if (media.uploadedAt >= sevenDaysAgo) {
            recentUploads++;
          }
        });
      }
    });

    return {
      totalFiles,
      totalStorage,
      videoCount,
      imageCount,
      recentUploads,
      campaignFiles,
      routineFiles,
    };
  },
});

// Get all campaigns and routines for upload dialog
export const getContentList = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    // Fetch all campaigns
    const campaigns = await ctx.db
      .query("contentCampaigns")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // Fetch all routines
    const routines = await ctx.db
      .query("contentRoutines")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const result = [];

    // Process campaigns
    for (const campaign of campaigns) {
      const project = campaign.projectId
        ? await ctx.db.get(campaign.projectId)
        : null;
      result.push({
        id: campaign._id,
        title: campaign.title,
        type: "campaign" as const,
        platform: campaign.platform,
        mediaCount: campaign.mediaFiles?.length || 0,
        projectTitle: project?.title || "No Project",
      });
    }

    // Process routines
    for (const routine of routines) {
      const project = routine.projectId
        ? await ctx.db.get(routine.projectId)
        : null;
      result.push({
        id: routine._id,
        title: routine.title,
        type: "routine" as const,
        platform: routine.platform,
        mediaCount: routine.mediaFiles?.length || 0,
        projectTitle: project?.title || "No Project",
      });
    }

    return result;
  },
});
