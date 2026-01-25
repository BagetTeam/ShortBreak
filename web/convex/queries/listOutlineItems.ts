import { query } from "../_generated/server";
import { v } from "convex/values";

export const listOutlineItems = query({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("outlineItems")
      .withIndex("by_prompt_order", (q) => q.eq("promptId", args.promptId))
      .collect();
  },
});
