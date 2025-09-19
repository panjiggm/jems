import { query } from "../_generated/server";
import { v } from "convex/values";
import { currentUserId } from "../auth";

export const list = query({
  args: {
    projectId: v.optional(v.id("projects")),
    status: v.optional(v.array(v.string())),
    platform: v.optional(v.array(v.string())),
    dateFrom: v.optional(v.string()),
    dateTo: v.optional(v.string()),
    search: v.optional(v.string()),
    cursor: v.optional(v.string()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    const pageSize = Math.min(args.pageSize ?? 20, 100);

    let q = ctx.db
      .query("contents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc");

    if (args.projectId) {
      q = ctx.db
        .query("contents")
        .withIndex("by_user_project", (q) =>
          q.eq("userId", userId).eq("projectId", args.projectId!),
        );
    }

    const { page, isDone, continueCursor } = await q.paginate({
      cursor: args.cursor ?? null,
      numItems: pageSize,
    });

    let items = page;

    if (args.status?.length)
      items = items.filter((c) => (args.status as string[]).includes(c.status));
    if (args.platform?.length)
      items = items.filter((c) =>
        (args.platform as string[]).includes(c.platform),
      );
    if (args.dateFrom)
      items = items.filter(
        (c) => !c.dueDate || c.dueDate >= (args.dateFrom as string),
      );
    if (args.dateTo)
      items = items.filter(
        (c) => !c.dueDate || c.dueDate <= (args.dateTo as string),
      );
    if (args.search)
      items = items.filter((c) =>
        c.title.toLowerCase().includes((args.search as string).toLowerCase()),
      );

    return { items, cursor: continueCursor, isDone };
  },
});
