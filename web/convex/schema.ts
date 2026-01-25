import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
  }).index("by_clerk_id", ["clerkId"]),

  prompts: defineTable({
    userId: v.id("users"),
    title: v.string(),
    prompt: v.string(),
    attachmentId: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("processing"),
        v.literal("ready"),
        v.literal("error"),
      ),
    ),
    errorMessage: v.optional(v.string()),
    lastWatchedIndex: v.optional(v.number()),
    lastVideoId: v.optional(v.string()),
    // Track which topic index has been loaded (for lazy loading)
    lastLoadedTopicIndex: v.optional(v.number()),
    // Track how many times the outline has been expanded for infinite scrolling
    expansionCount: v.optional(v.number()),
    // Track if the outline was generated from a PDF course outline
    isFromPdf: v.optional(v.boolean()),
    // Track the original number of topics from the PDF (to know when to expand)
    originalTopicCount: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_created_at", ["createdAt"])
    .index("by_user_id", ["userId"])

  outlineItems: defineTable({
    userId: v.id("users"),
    promptId: v.id("prompts"),
    title: v.string(),
    searchQuery: v.string(),
    order: v.number(),
    // Track if videos have been fetched for this topic
    videosFetched: v.optional(v.boolean()),
    // Track if this was added during expansion (for UI distinction)
    isExpansion: v.optional(v.boolean()),
    // Track which expansion round this came from
    expansionRound: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_prompt", ["promptId"])
    .index("by_prompt_order", ["promptId", "order"])
    .index("by_user_id", ["userId"]),

  feedItems: defineTable({
    userId: v.id("users"),
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
      }),
    ),
    createdAt: v.number(),
  })
    .index("by_prompt", ["promptId"])
    .index("by_prompt_order", ["promptId", "order"])
    .index("by_user_id", ["userId"]),
});
