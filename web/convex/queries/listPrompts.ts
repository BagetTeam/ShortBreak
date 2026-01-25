import { query } from "convex/server";

export const listPrompts = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("prompts").withIndex("by_created_at").order("desc").collect();
  },
});
