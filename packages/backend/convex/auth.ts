import { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";

export async function assertIdentity(ctx: QueryCtx | MutationCtx | ActionCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("UNAUTHENTICATED");
  return identity;
}

export async function currentUserId(ctx: QueryCtx | MutationCtx | ActionCtx) {
  const identity = await assertIdentity(ctx);
  return identity.subject; // Clerk user id
}
