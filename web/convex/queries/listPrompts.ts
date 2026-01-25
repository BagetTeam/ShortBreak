import { query } from "../_generated/server";

export const listPrompts = query({
  args: {},
  handler: async (ctx) => {
    try {
      const prompts = await ctx.db
        .query("prompts")
        .withIndex("by_created_at")
        .collect();
      
      // Sort by createdAt descending (newest first)
      // Filter out any prompts missing createdAt (shouldn't happen, but safety check)
      return prompts
        .filter((p) => typeof p.createdAt === "number")
        .sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error("Error in listPrompts:", error);
      // Fallback: try without index
      const prompts = await ctx.db.query("prompts").collect();
      return prompts
        .filter((p) => typeof p.createdAt === "number")
        .sort((a, b) => b.createdAt - a.createdAt);
    }
  },
});
