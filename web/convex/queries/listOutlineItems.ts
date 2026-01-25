import { query } from "../_generated/server";
import { v } from "convex/values";

import { getClerkId } from "../lib/auth";
import { getUserByClerkIdOptional } from "../lib/users";

export const listOutlineItems = query({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    const clerkId = await getClerkId(ctx);
    const user = await getUserByClerkIdOptional(ctx, clerkId);
    if (!user) {
      return [];
    }
    const prompt = await ctx.db.get(args.promptId);
    if (!prompt || prompt.userId !== user._id) {
      return [];
    }
    return ctx.db
      .query("outlineItems")
      .withIndex("by_prompt_order", (q) => q.eq("promptId", args.promptId))
      .collect();
  },
});
