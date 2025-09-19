import { v } from "convex/values";

export const paginationV = {
  cursor: v.optional(v.string()),
  pageSize: v.optional(v.number()),
};

export const filterV = {
  projectId: v.optional(v.id("projects")),
  status: v.optional(v.array(v.string())),
  platform: v.optional(v.array(v.string())),
  dateFrom: v.optional(v.string()),
  dateTo: v.optional(v.string()),
  search: v.optional(v.string()),
};
