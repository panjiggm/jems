import { v } from "convex/values";
import { api } from "../_generated/api";
import { action } from "../_generated/server";

// Helper function untuk upload video ke TikTok
async function uploadVideoToTikTok(
  accessToken: string,
  videoUrl: string,
  title: string,
  description?: string,
) {
  // Step 1: Initialize upload
  const initResponse = await fetch(
    "https://open.tiktokapis.com/v2/post/publish/video/init/",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        post_info: {
          title: title,
          description: description || "",
          privacy_level: "PUBLIC_TO_EVERYONE",
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 1000,
        },
        source_info: {
          source: "PULL_FROM_URL",
          video_url: videoUrl,
        },
      }),
    },
  );

  if (!initResponse.ok) {
    const error = await initResponse.text();
    throw new Error(`TikTok upload init failed: ${error}`);
  }

  const data = await initResponse.json();

  return {
    publishId: data.data.publish_id,
    uploadUrl: data.data.upload_url,
  };
}

// Update publishContent function
export const publishContent = action({
  args: {
    scheduleId: v.id("scheduledPublishes"),
  },
  handler: async (ctx, { scheduleId }) => {
    const scheduleData = await ctx.runQuery(
      api.queries.scheduledPublishes.getById,
      { scheduleId },
    );

    if (!scheduleData) {
      throw new Error("Schedule not found");
    }

    const { schedule, account, content } = scheduleData;

    if (!account || !account.isConnected) {
      await ctx.runMutation(api.mutations.scheduledPublishes.setFailed, {
        scheduleId,
        errorMessage: "Account is not connected",
      });
      return;
    }

    if (!content) {
      await ctx.runMutation(api.mutations.scheduledPublishes.setFailed, {
        scheduleId,
        errorMessage: "Content not found",
      });
      return;
    }

    try {
      await ctx.runMutation(api.mutations.scheduledPublishes.setProcessing, {
        scheduleId,
      });

      switch (schedule.platform) {
        case "tiktok": {
          // Pastikan ada media file
          if (!content.mediaFiles || content.mediaFiles.length === 0) {
            throw new Error("No media files found for TikTok post");
          }

          const mediaFile = content.mediaFiles[0]; // TikTok: 1 video per post

          // Get video URL from Convex storage
          const videoUrl = await ctx.storage.getUrl(mediaFile.storageId);
          if (!videoUrl) {
            throw new Error("Failed to get video URL");
          }

          // Upload to TikTok
          const result = await uploadVideoToTikTok(
            account.accessToken,
            videoUrl,
            content.title,
            content.notes,
          );

          // Mark as published
          await ctx.runMutation(api.mutations.scheduledPublishes.setPublished, {
            scheduleId,
            platformPostId: result.publishId,
            platformPostUrl: `https://www.tiktok.com/@${account.displayName}/video/${result.publishId}`,
          });

          break;
        }

        default:
          throw new Error(
            `Publishing to ${schedule.platform} not implemented yet`,
          );
      }
    } catch (error: any) {
      await ctx.runMutation(api.mutations.scheduledPublishes.setFailed, {
        scheduleId,
        errorMessage: error.message || "Unknown error during publishing",
      });
    }
  },
});
