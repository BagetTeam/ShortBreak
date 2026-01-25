import { mutation } from "convex/server";
import { v } from "convex/values";

export const appendOutlineItems = mutation({
  args: {
    promptId: v.id("prompts"),
    items: v.array(
      v.object({
        title: v.string(),
        searchQuery: v.string(),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await Promise.all(
      args.items.map((item) =>
        ctx.db.insert("outlineItems", {
          promptId: args.promptId,
          title: item.title,
          searchQuery: item.searchQuery,
          order: item.order,
          createdAt: now,
        })
      )
    );
  },
});
