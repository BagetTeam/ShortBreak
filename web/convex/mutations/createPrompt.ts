import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createPrompt = mutation({
  args: {
    prompt: v.string(),
    title: v.optional(v.string()),
    attachmentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const title =
      args.title?.trim() || args.prompt.trim().split("\n")[0].slice(0, 64);
    return ctx.db.insert("prompts", {
      title,
      prompt: args.prompt,
      attachmentId: args.attachmentId,
      status: "processing",
      createdAt: now,
      updatedAt: now,
      lastWatchedIndex: 0,
    });
  },
});
