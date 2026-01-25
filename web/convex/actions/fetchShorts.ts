"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

type OutlineInput = {
  title: string;
  searchQuery: string;
  order: number;
  outlineItemId?: Id<"outlineItems">;
};

export const fetchShorts = action({
  args: {
    promptId: v.id("prompts"),
    items: v.array(
      v.object({
        title: v.string(),
        searchQuery: v.string(),
        order: v.number(),
        outlineItemId: v.optional(v.id("outlineItems")),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error("Missing YOUTUBE_API_KEY.");
    }

    const results = await Promise.all(
      args.items.map(async (item: OutlineInput) => {
        const url = new URL("https://www.googleapis.com/youtube/v3/search");
        url.search = new URLSearchParams({
          key: apiKey,
          part: "snippet",
          maxResults: "1",
          type: "video",
          videoDuration: "short",
          q: item.searchQuery,
        }).toString();

        const response = await fetch(url);
        if (!response.ok) {
          return null;
        }

        const data = await response.json();
        const candidate = data?.items?.[0];
        const videoId = candidate?.id?.videoId as string | undefined;
        if (!videoId) {
          return null;
        }

        const channelTitle =
          typeof candidate?.snippet?.channelTitle === "string"
            ? candidate.snippet.channelTitle
            : undefined;
        const publishedAt =
          typeof candidate?.snippet?.publishedAt === "string"
            ? candidate.snippet.publishedAt
            : undefined;

        return {
          outlineItemId: item.outlineItemId,
          videoId,
          topicTitle: item.title,
          order: item.order,
          metaData: {
            channelTitle,
            publishedAt,
          },
        };
      }),
    );

    const feedItems = results.filter(
      (item): item is NonNullable<typeof item> => item !== null,
    );

    await ctx.runMutation(api.mutations.appendFeedItems.appendFeedItems, {
      promptId: args.promptId,
      items: feedItems,
    });

    return feedItems;
  },
});
