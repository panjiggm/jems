"use node";

import { action } from "../_generated/server";

export const generateUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    const uploadUrl = await ctx.storage.generateUploadUrl();
    return { uploadUrl };
  },
});
