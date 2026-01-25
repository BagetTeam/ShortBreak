import { mutation } from "../_generated/server";
import { v } from "convex/values";

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
    const now = Date.now();
    await Promise.all(
      args.items.map((item) =>
        ctx.db.insert("feedItems", {
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
