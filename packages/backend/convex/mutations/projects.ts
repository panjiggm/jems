import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { currentUserId } from "../auth";
import { internal } from "../_generated/api";

export const create = mutation({
  args: {
    title: v.string(),
    type: v.union(
      v.literal("campaign"),
      v.literal("series"),
      v.literal("routine"),
    ),
    description: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    const now = Date.now();

    const projectId = await ctx.db.insert("projects", {
      ...args,
      userId,
      createdAt: now,
      updatedAt: now,
    });

    // Log activity
    await ctx.scheduler.runAfter(
      0,
      internal.mutations.projectActivities.logActivity,
      {
        userId,
        projectId,
        entityType: "project" as const,
        entityId: projectId,
        action: "created" as const,
        description: `Project "${args.title}" was created`,
        metadata: {
          type: args.type,
          hasDescription: !!args.description,
          hasStartDate: !!args.startDate,
          hasEndDate: !!args.endDate,
        },
      },
    );

    return projectId;
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    patch: v.object({
      title: v.optional(v.string()),
      type: v.optional(
        v.union(
          v.literal("campaign"),
          v.literal("series"),
          v.literal("routine"),
        ),
      ),
      description: v.optional(v.string()),
      startDate: v.optional(v.string()),
      endDate: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { id, patch }) => {
    const userId = await currentUserId(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== userId) throw new Error("NOT_FOUND");

    // Store old values for logging
    const oldValues = {
      title: doc.title,
      type: doc.type,
      description: doc.description,
      startDate: doc.startDate,
      endDate: doc.endDate,
    };

    await ctx.db.patch(id, { ...patch, updatedAt: Date.now() });

    // Log activity with changed fields
    const changedFields = Object.keys(patch).filter(
      (key) => patch[key as keyof typeof patch] !== undefined,
    );

    await ctx.scheduler.runAfter(
      0,
      internal.mutations.projectActivities.logActivity,
      {
        userId,
        projectId: id,
        entityType: "project" as const,
        entityId: id,
        action: "updated" as const,
        description: `Project "${patch.title || doc.title}" was updated`,
        metadata: {
          changedFields,
          oldValues: Object.fromEntries(
            changedFields.map((field) => [
              field,
              oldValues[field as keyof typeof oldValues],
            ]),
          ),
          newValues: patch,
        },
      },
    );

    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const userId = await currentUserId(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== userId) throw new Error("NOT_FOUND");

    // Log activity before deletion
    await ctx.scheduler.runAfter(
      0,
      internal.mutations.projectActivities.logActivity,
      {
        userId,
        projectId: id,
        entityType: "project" as const,
        entityId: id,
        action: "deleted" as const,
        description: `Project "${doc.title}" was deleted`,
        metadata: {
          deletedProject: {
            title: doc.title,
            type: doc.type,
            description: doc.description,
          },
        },
      },
    );

    await ctx.db.delete(id);

    // Clean up all activities for this project (optional - you might want to keep them for audit)
    // await ctx.scheduler.runAfter(0, internal.mutations.projectActivities.deleteActivitiesByEntity, {
    //   entityType: "project" as const,
    //   entityId: id,
    // });

    return true;
  },
});
