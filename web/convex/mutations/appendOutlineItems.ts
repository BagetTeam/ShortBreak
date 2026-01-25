import { mutation } from "../_generated/server";
import { v } from "convex/values";

import { getClerkId } from "../lib/auth";
import { getUserByClerkIdFromDb } from "../lib/users";

export const appendOutlineItems = mutation({
  args: {
    promptId: v.id("prompts"),
    items: v.array(
      v.object({
        title: v.string(),
        searchQuery: v.string(),
        order: v.number(),
        isExpansion: v.optional(v.boolean()),
        expansionRound: v.optional(v.number()),
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
    const created = await Promise.all(
      args.items.map((item) =>
        ctx.db.insert("outlineItems", {
          userId: user._id,
          promptId: args.promptId,
          title: item.title,
          searchQuery: item.searchQuery,
          order: item.order,
          videosFetched: false,
          isExpansion: item.isExpansion ?? false,
          expansionRound: item.expansionRound ?? 0,
          createdAt: now,
        })
      )
    );
    return created;
  },
});

// Mark an outline item as having its videos fetched
export const markTopicFetched = mutation({
  args: {
    outlineItemId: v.id("outlineItems"),
  },
  handler: async (ctx, args) => {
    const clerkId = await getClerkId(ctx);
    const user = await getUserByClerkIdFromDb(ctx, clerkId);
    const outlineItem = await ctx.db.get(args.outlineItemId);
    if (!outlineItem || outlineItem.userId !== user._id) {
      throw new Error("Outline item not found");
    }
    await ctx.db.patch(args.outlineItemId, {
      videosFetched: true,
    });
  },
});

// Update the prompt's last loaded topic index
export const updateLastLoadedTopic = mutation({
  args: {
    promptId: v.id("prompts"),
    topicIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const clerkId = await getClerkId(ctx);
    const user = await getUserByClerkIdFromDb(ctx, clerkId);
    const prompt = await ctx.db.get(args.promptId);
    if (!prompt || prompt.userId !== user._id) {
      throw new Error("Prompt not found");
    }
    await ctx.db.patch(args.promptId, {
      lastLoadedTopicIndex: args.topicIndex,
      updatedAt: Date.now(),
    });
  },
});

// Increment the expansion count for a prompt
export const incrementExpansionCount = mutation({
  args: {
    promptId: v.id("prompts"),
  },
  handler: async (ctx, args) => {
    const clerkId = await getClerkId(ctx);
    const user = await getUserByClerkIdFromDb(ctx, clerkId);
    const prompt = await ctx.db.get(args.promptId);
    if (!prompt || prompt.userId !== user._id) {
      throw new Error("Prompt not found");
    }
    
    await ctx.db.patch(args.promptId, {
      expansionCount: (prompt.expansionCount ?? 0) + 1,
      updatedAt: Date.now(),
    });
    
    return (prompt.expansionCount ?? 0) + 1;
  },
});
