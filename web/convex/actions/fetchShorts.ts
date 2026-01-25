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
          maxResults: "10", // Fetch 10 videos per topic for infinite feed
          type: "video",
          videoDuration: "short",
          q: item.searchQuery,
        }).toString();

        const response = await fetch(url);
        if (!response.ok) {
          return [];
        }

        const data = await response.json();
        const items = data?.items || [];
        
        return items
          .map((candidate: any) => {
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
          })
          .filter((item: any): item is NonNullable<typeof item> => item !== null);
      }),
    );

    const feedItems = results.flat();

    await ctx.runMutation(api.mutations.appendFeedItems.appendFeedItems, {
      promptId: args.promptId,
      items: feedItems,
    });

    return feedItems;
  },
});
