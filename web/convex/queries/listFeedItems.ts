import { query } from "../_generated/server";
import { v } from "convex/values";

export const listFeedItems = query({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("feedItems")
      .withIndex("by_prompt_order", (q) => q.eq("promptId", args.promptId))
      .order("asc")
      .collect();
  },
});
