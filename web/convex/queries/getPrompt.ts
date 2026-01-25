import { query } from "convex/server";
import { v } from "convex/values";

export const getPrompt = query({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.promptId);
  },
});
