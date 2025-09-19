import { query } from "../_generated/server";
import { v } from "convex/values";
import { getUserId } from "../schema";

export const list = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);

    // Get all projects for the user
    const allProjects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();

    // Apply search filter if provided
    // const filtered = args.search
    //   ? allProjects.filter((p) =>
    //       p.title.toLowerCase().includes((args.search as string).toLowerCase()),
    //     )
    //   : allProjects;

    // return { items: filtered, cursor: null, isDone: true };

    return allProjects;
  },
});
