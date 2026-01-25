import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const updatePromptProgress = mutation({
  args: {
    promptId: v.id("prompts"),
    updates: v.object({
      lastWatchedIndex: v.optional(v.number()),
      lastVideoId: v.optional(v.string()),
      isFromPdf: v.optional(v.boolean()),
      originalTopicCount: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const patchData: Record<string, unknown> = {
      updatedAt: Date.now(),
    };
    
    if (args.updates.lastWatchedIndex !== undefined) {
      patchData.lastWatchedIndex = args.updates.lastWatchedIndex;
    }
    if (args.updates.lastVideoId !== undefined) {
      patchData.lastVideoId = args.updates.lastVideoId;
    }
    if (args.updates.isFromPdf !== undefined) {
      patchData.isFromPdf = args.updates.isFromPdf;
    }
    if (args.updates.originalTopicCount !== undefined) {
      patchData.originalTopicCount = args.updates.originalTopicCount;
    }
    
    await ctx.db.patch(args.promptId, patchData);
  },
});
