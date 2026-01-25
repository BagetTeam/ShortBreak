import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  prompts: defineTable({
    title: v.string(),
    prompt: v.string(),
    attachmentId: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("processing"),
        v.literal("ready"),
        v.literal("error")
      )
    ),
    errorMessage: v.optional(v.string()),
    lastWatchedIndex: v.optional(v.number()),
    lastVideoId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_created_at", ["createdAt"]),
  outlineItems: defineTable({
    promptId: v.id("prompts"),
    title: v.string(),
    searchQuery: v.string(),
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_prompt", ["promptId"])
    .index("by_prompt_order", ["promptId", "order"]),
  feedItems: defineTable({
    promptId: v.id("prompts"),
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
    createdAt: v.number(),
  })
    .index("by_prompt", ["promptId"])
    .index("by_prompt_order", ["promptId", "order"]),
});
