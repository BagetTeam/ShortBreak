import { mutation } from "../_generated/server";
import { v } from "convex/values";

import { getClerkId } from "../lib/auth";
import { getOrCreateUser } from "../lib/users";

export const createPrompt = mutation({
  args: {
    prompt: v.string(),
    title: v.optional(v.string()),
    attachmentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const clerkId = await getClerkId(ctx);
    const user = await getOrCreateUser(ctx, clerkId);
    const now = Date.now();
    const title =
      args.title?.trim() || args.prompt.trim().split("\n")[0].slice(0, 64);
    return ctx.db.insert("prompts", {
      userId: user._id,
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
