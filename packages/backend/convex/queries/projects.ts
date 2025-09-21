import { query } from "../_generated/server";
import { v } from "convex/values";
import { getUserId } from "../schema";
import { paginationOptsValidator } from "convex/server";

export const list = query({
  args: {
    search: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);

    // Get all projects for the user
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", userId!))
      .order("desc")
      .paginate(args.paginationOpts);

    return projects;
  },
});
