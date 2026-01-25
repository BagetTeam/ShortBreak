"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

import { api } from "../_generated/api";
import { getClerkId } from "../lib/auth";

export const fetchNextTopic = action({
  args: {
    promptId: v.id("prompts"),
  },
  handler: async (ctx, args) => {
    const clerkId = await getClerkId(ctx);
    await ctx.runQuery(api.queries.getUserByClerkId.getUserByClerkId, {
      clerkId,
    });
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error("Missing YOUTUBE_API_KEY.");
    }

    // Get all outline items for this prompt
    const outlineItems = await ctx.runQuery(
      api.queries.listOutlineItems.listOutlineItems,
      { promptId: args.promptId }
    );

    if (!outlineItems || outlineItems.length === 0) {
      return { status: "no_topics", items: [] };
    }

    // Find the first topic that hasn't had its videos fetched yet
    const sortedItems = [...outlineItems].sort((a, b) => a.order - b.order);
    const nextTopic = sortedItems.find((item) => !item.videosFetched);

    if (!nextTopic) {
      // All topics have been fetched - signal that we need expansion
      return { status: "needs_expansion", items: [] };
    }

    // Fetch videos for this specific topic
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.search = new URLSearchParams({
      key: apiKey,
      part: "snippet",
      maxResults: "8", // Fetch 8 videos per topic
      type: "video",
      videoDuration: "short",
      q: nextTopic.searchQuery,
    }).toString();

    const response = await fetch(url);
    if (!response.ok) {
      console.error("YouTube API error:", response.status);
      return { status: "error", items: [] };
    }

    const data = await response.json();
    const videoItems = data?.items || [];

    // Get the current max order from existing feed items
    const existingFeedItems = await ctx.runQuery(
      api.queries.listFeedItems.listFeedItems,
      { promptId: args.promptId }
    );
    const maxOrder = existingFeedItems?.length
      ? Math.max(...existingFeedItems.map((item) => item.order))
      : -1;

    const feedItems = videoItems
      .map((candidate: any, index: number) => {
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
          outlineItemId: nextTopic._id,
          videoId,
          topicTitle: nextTopic.title,
          order: maxOrder + 1 + index,
          metaData: {
            channelTitle,
            publishedAt,
          },
        };
      })
      .filter((item: any): item is NonNullable<typeof item> => item !== null);

    // Add feed items to database
    if (feedItems.length > 0) {
      await ctx.runMutation(api.mutations.appendFeedItems.appendFeedItems, {
        promptId: args.promptId,
        items: feedItems,
      });
    }

    // Mark this topic as fetched
    await ctx.runMutation(
      api.mutations.appendOutlineItems.markTopicFetched,
      { outlineItemId: nextTopic._id }
    );

    // Update the last loaded topic index
    await ctx.runMutation(
      api.mutations.appendOutlineItems.updateLastLoadedTopic,
      { promptId: args.promptId, topicIndex: nextTopic.order }
    );

    return {
      status: "success",
      topicTitle: nextTopic.title,
      topicOrder: nextTopic.order,
      items: feedItems,
      hasMoreTopics: sortedItems.some(
        (item) => item.order > nextTopic.order && !item.videosFetched
      ),
    };
  },
});
