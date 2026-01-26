import { mutation } from "../_generated/server";
import { v } from "convex/values";

import { getClerkId } from "../lib/auth";
import { getUserByClerkIdFromDb } from "../lib/users";

export const deletePrompt = mutation({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    const clerkId = await getClerkId(ctx);
    const user = await getUserByClerkIdFromDb(ctx, clerkId);
    const prompt = await ctx.db.get(args.promptId);
    if (!prompt || prompt.userId !== user._id) {
      return;
    }

    const outlineItems = await ctx.db
      .query("outlineItems")
      .withIndex("by_prompt", (q) => q.eq("promptId", args.promptId))
      .collect();

    const feedItems = await ctx.db
      .query("feedItems")
      .withIndex("by_prompt", (q) => q.eq("promptId", args.promptId))
      .collect();

    await Promise.all([
      ...outlineItems.map((item) => ctx.db.delete(item._id)),
      ...feedItems.map((item) => ctx.db.delete(item._id)),
    ]);

    await ctx.db.delete(args.promptId);
  },
});
