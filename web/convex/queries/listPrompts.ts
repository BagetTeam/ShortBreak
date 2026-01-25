import { query } from "../_generated/server";

import { getClerkId } from "../lib/auth";
import { getUserByClerkIdFromDb } from "../lib/users";

export const listPrompts = query({
  args: {},
  handler: async (ctx) => {
    const clerkId = await getClerkId(ctx);
    const user = await getUserByClerkIdFromDb(ctx, clerkId);
    const prompts = await ctx.db
      .query("prompts")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .collect();
    return prompts.sort((a, b) => b.createdAt - a.createdAt);
  },
});
