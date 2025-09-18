import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { Auth } from "convex/server";

export const getUserId = async (ctx: { auth: Auth }) => {
  return (await ctx.auth.getUserIdentity())?.subject;
};

export default defineSchema({
  profile: defineTable({
    userId: v.string(),
    full_name: v.string(),
    phone: v.string(),
    avatar_url: v.string(),
    is_onboarding_completed: v.boolean(),
  }),
  niches: defineTable({
    slug: v.string(),
    label: v.string(),
    category: v.string(),
    emoji: v.optional(v.string()),
  }),
  persona: defineTable({
    userId: v.string(),
    nicheIds: v.array(v.id("niches")),
    bio: v.string(),
    ai_prompt: v.string(),
  }),
});
