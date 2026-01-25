import { mutation } from "convex/server";
import { v } from "convex/values";

export const updatePromptProgress = mutation({
  args: {
    promptId: v.id("prompts"),
    lastWatchedIndex: v.number(),
    lastVideoId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.promptId, {
      lastWatchedIndex: args.lastWatchedIndex,
      lastVideoId: args.lastVideoId,
      updatedAt: Date.now(),
    });
  },
});
