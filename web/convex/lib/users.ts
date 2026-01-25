import type { MutationCtx, QueryCtx } from "../_generated/server";

import { getClerkId } from "./auth";

export const getUserByClerkIdFromDb = async (
  ctx: QueryCtx | MutationCtx,
  clerkId: string,
) => {
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .unique();
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const getOrCreateUser = async (
  ctx: MutationCtx,
  clerkId?: string,
) => {
  const resolvedClerkId = clerkId ?? (await getClerkId(ctx));
  const existing = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", resolvedClerkId))
    .unique();
  if (existing) {
    return existing;
  }

  const userId = await ctx.db.insert("users", { clerkId: resolvedClerkId });
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("Failed to create user");
  }
  return user;
};
