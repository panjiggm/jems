# Feature #1 - Development Guide (Convex + Clerk + Next.js + Turborepo)

This document is a hands-on build guide: schema, queries, mutations, actions, pagination, filters, and integration notes.

---

## Schema (convex/schema.ts)

```ts
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    userId: v.string(),
    title: v.string(),
    type: v.union(
      v.literal("campaign"),
      v.literal("series"),
      v.literal("routine"),
    ),
    description: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_createdAt", ["userId", "createdAt"]),

  contents: defineTable({
    userId: v.string(),
    projectId: v.id("projects"),
    title: v.string(),
    platform: v.union(
      v.literal("tiktok"),
      v.literal("instagram"),
      v.literal("youtube"),
      v.literal("x"),
      v.literal("facebook"),
      v.literal("threads"),
      v.literal("other"),
    ),
    status: v.union(
      v.literal("draft"),
      v.literal("in_progress"),
      v.literal("scheduled"),
      v.literal("published"),
    ),
    dueDate: v.optional(v.string()),
    scheduledAt: v.optional(v.string()),
    publishedAt: v.optional(v.string()),
    notes: v.optional(v.string()),
    assetIds: v.optional(v.array(v.string())),
    aiMetadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_project", ["userId", "projectId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_user_platform", ["userId", "platform"])
    .index("by_user_dueDate", ["userId", "dueDate"]),

  tasks: defineTable({
    userId: v.string(),
    projectId: v.id("projects"),
    contentId: v.optional(v.id("contents")),
    title: v.string(),
    status: v.union(v.literal("todo"), v.literal("doing"), v.literal("done")),
    dueDate: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_project", ["userId", "projectId"])
    .index("by_user_dueDate", ["userId", "dueDate"]),
});
```

---
