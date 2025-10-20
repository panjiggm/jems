import { query } from "../_generated/server";
import { v } from "convex/values";
import { currentUserId } from "../auth";

export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    // Ensure user is authenticated
    await currentUserId(ctx);
    const url = await ctx.storage.getUrl(storageId);
    if (!url) throw new Error("NOT_FOUND");
    return { url };
  },
});
