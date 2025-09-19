import { query } from "../_generated/server";
import { v } from "convex/values";
import { currentUserId } from "../auth";

export const list = query({
  args: {
    projectId: v.optional(v.id("projects")),
    contentId: v.optional(v.id("contents")),
    status: v.optional(v.array(v.string())),
    overdueOnly: v.optional(v.boolean()),
    cursor: v.optional(v.string()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    const pageSize = Math.min(args.pageSize ?? 20, 100);

    let q = ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("asc");

    if (args.projectId)
      q = ctx.db
        .query("tasks")
        .withIndex("by_user_project", (q) =>
          q.eq("userId", userId).eq("projectId", args.projectId!),
        );

    const { page, isDone, continueCursor } = await q.paginate({
      cursor: args.cursor ?? null,
      numItems: pageSize,
    });

    let items = page;
    if (args.contentId)
      items = items.filter((t) => t.contentId === args.contentId);
    if (args.status?.length)
      items = items.filter((t) => (args.status as string[]).includes(t.status));
    if (args.overdueOnly) {
      const today = new Date().toISOString().slice(0, 10);
      items = items.filter(
        (t) => t.dueDate && t.dueDate < today && t.status !== "done",
      );
    }

    items.sort(
      (a, b) =>
        (a.dueDate || "").localeCompare(b.dueDate || "") ||
        b._creationTime - a._creationTime,
    );

    return { items, cursor: continueCursor, isDone };
  },
});
