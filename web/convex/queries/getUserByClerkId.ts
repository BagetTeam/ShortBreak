import { query } from "../_generated/server";
import { v } from "convex/values";

import { getClerkId } from "../lib/auth";
import { getUserByClerkIdFromDb } from "../lib/users";

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const authClerkId = await getClerkId(ctx);
    if (authClerkId !== args.clerkId) {
      throw new Error("Unauthorized");
    }
    return getUserByClerkIdFromDb(ctx, authClerkId);
  },
});
