import { mutation } from "../_generated/server";
import { v } from "convex/values";

import { getClerkId } from "../lib/auth";
import { getUserByClerkIdFromDb } from "../lib/users";

export const updatePromptProgress = mutation({
  args: {
    promptId: v.id("prompts"),
    lastWatchedIndex: v.number(),
    lastVideoId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const clerkId = await getClerkId(ctx);
    const user = await getUserByClerkIdFromDb(ctx, clerkId);
    const prompt = await ctx.db.get(args.promptId);
    if (!prompt || prompt.userId !== user._id) {
      throw new Error("Prompt not found");
    }
    await ctx.db.patch(args.promptId, {
      lastWatchedIndex: args.lastWatchedIndex,
      lastVideoId: args.lastVideoId,
      updatedAt: Date.now(),
    });
  },
});
