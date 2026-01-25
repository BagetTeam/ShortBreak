import { mutation } from "../_generated/server";
import { v } from "convex/values";

import { getClerkId } from "../lib/auth";
import { getUserByClerkIdFromDb } from "../lib/users";

export const appendFeedItems = mutation({
  args: {
    promptId: v.id("prompts"),
    items: v.array(
      v.object({
        outlineItemId: v.optional(v.id("outlineItems")),
        videoId: v.string(),
        topicTitle: v.string(),
        order: v.number(),
        metaData: v.optional(
          v.object({
            channelTitle: v.optional(v.string()),
            duration: v.optional(v.string()),
            publishedAt: v.optional(v.string()),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const clerkId = await getClerkId(ctx);
    const user = await getUserByClerkIdFromDb(ctx, clerkId);
    const prompt = await ctx.db.get(args.promptId);
    if (!prompt || prompt.userId !== user._id) {
      throw new Error("Prompt not found");
    }
    const now = Date.now();
    await Promise.all(
      args.items.map((item) =>
        ctx.db.insert("feedItems", {
          userId: user._id,
          promptId: args.promptId,
          outlineItemId: item.outlineItemId,
          videoId: item.videoId,
          topicTitle: item.topicTitle,
          order: item.order,
          metaData: item.metaData,
          createdAt: now,
        })
      )
    );
  },
});
