import { mutation } from "convex/server";
import { v } from "convex/values";

export const deletePrompt = mutation({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) {
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
