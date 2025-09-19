import { query } from "../_generated/server";
import { v } from "convex/values";
import { currentUserId } from "../auth";

export const list = query({
  args: {
    cursor: v.optional(v.string()),
    pageSize: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);

    const pageSize = Math.min(args.pageSize ?? 20, 100);
    const q = ctx.db
      .query("projects")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", userId))
      .order("desc");

    const { page, isDone, continueCursor } = await q.paginate({
      cursor: args.cursor ?? null,
      numItems: pageSize,
    });

    const filtered = args.search
      ? page.filter((p) =>
          p.title.toLowerCase().includes((args.search as string).toLowerCase()),
        )
      : page;

    return { items: filtered, cursor: continueCursor, isDone };
  },
});
