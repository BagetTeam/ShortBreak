/**
 * YouTube Data API Integration
 *
 * This action handles searching for short-form educational videos
 * using the YouTube Data API. It filters for YouTube Shorts duration
 * and maps results to the course outline structure.
 */

"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

// Types for YouTube API response
interface YouTubeVideo {
  videoId: string;
  title: string;
  channelName: string;
  thumbnailUrl: string;
  duration?: string;
}

interface TopicWithVideo {
  topicTitle: string;
  video: YouTubeVideo | null;
}

/**
 * Search for a short video on a specific topic.
 * Filters for videos under 60 seconds (YouTube Shorts).
 */
export const searchShortVideo = action({
  args: {
    searchQuery: v.string(),
  },
  handler: async (ctx, args): Promise<YouTubeVideo | null> => {
    const { searchQuery } = args;

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error("YOUTUBE_API_KEY environment variable is not set");
    }

    try {
      // Search for videos with the query, adding "shorts" to find short-form content
      const searchParams = new URLSearchParams({
        part: "snippet",
        q: `${searchQuery} shorts`,
        type: "video",
        videoDuration: "short", // Filters for videos under 4 minutes
        maxResults: "10",
        order: "relevance",
        key: apiKey,
      });

      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${searchParams}`
      );

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error("YouTube Search API error:", errorText);
        throw new Error(`YouTube API error: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      const videos = searchData.items || [];

      if (videos.length === 0) {
        console.log(`No videos found for query: ${searchQuery}`);
        return null;
      }

      // Get video IDs for duration filtering
      const videoIds = videos
        .map((item: any) => item.id?.videoId)
        .filter(Boolean)
        .join(",");

      // Get detailed video info including duration
      const detailsParams = new URLSearchParams({
        part: "contentDetails,snippet",
        id: videoIds,
        key: apiKey,
      });

      const detailsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?${detailsParams}`
      );

      if (!detailsResponse.ok) {
        console.error("YouTube Videos API error");
        // Fall back to first search result
        const firstVideo = videos[0];
        return {
          videoId: firstVideo.id.videoId,
          title: firstVideo.snippet.title,
          channelName: firstVideo.snippet.channelTitle,
          thumbnailUrl: firstVideo.snippet.thumbnails?.high?.url || "",
        };
      }

      const detailsData = await detailsResponse.json();
      const videoDetails = detailsData.items || [];

      // Find a video that's actually short (under 60 seconds preferred, under 180 acceptable)
      for (const video of videoDetails) {
        const duration = parseDuration(video.contentDetails?.duration);

        // Prefer videos under 60 seconds, accept up to 180 seconds
        if (duration && duration <= 180) {
          return {
            videoId: video.id,
            title: video.snippet.title,
            channelName: video.snippet.channelTitle,
            thumbnailUrl: video.snippet.thumbnails?.high?.url || "",
            duration: formatDuration(duration),
          };
        }
      }

      // If no short video found, return the first result anyway
      const firstVideo = videos[0];
      return {
        videoId: firstVideo.id.videoId,
        title: firstVideo.snippet.title,
        channelName: firstVideo.snippet.channelTitle,
        thumbnailUrl: firstVideo.snippet.thumbnails?.high?.url || "",
      };
    } catch (error) {
      console.error("Error searching for video:", error);
      throw error;
    }
  },
});

/**
 * Fetch videos for multiple topics in a course outline.
 * Returns an array of topics with their associated videos.
 */
export const fetchVideosForTopics = action({
  args: {
    topics: v.array(
      v.object({
        title: v.string(),
        searchQuery: v.string(),
      })
    ),
  },
  handler: async (ctx, args): Promise<TopicWithVideo[]> => {
    const { topics } = args;

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error("YOUTUBE_API_KEY environment variable is not set");
    }

    const results: TopicWithVideo[] = [];

    // Process topics sequentially to avoid rate limiting
    for (const topic of topics) {
      try {
        // Search for videos with the query
        const searchParams = new URLSearchParams({
          part: "snippet",
          q: `${topic.searchQuery} shorts educational`,
          type: "video",
          videoDuration: "short",
          maxResults: "5",
          order: "relevance",
          key: apiKey,
        });

        const searchResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?${searchParams}`
        );

        if (!searchResponse.ok) {
          console.error(`YouTube API error for topic: ${topic.title}`);
          results.push({ topicTitle: topic.title, video: null });
          continue;
        }

        const searchData = await searchResponse.json();
        const videos = searchData.items || [];

        if (videos.length === 0) {
          results.push({ topicTitle: topic.title, video: null });
          continue;
        }

        // Get first video's details
        const firstVideo = videos[0];
        const videoId = firstVideo.id?.videoId;

        if (!videoId) {
          results.push({ topicTitle: topic.title, video: null });
          continue;
        }

        // Get video duration
        const detailsParams = new URLSearchParams({
          part: "contentDetails,snippet",
          id: videoId,
          key: apiKey,
        });

        const detailsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?${detailsParams}`
        );

        let duration: string | undefined;
        if (detailsResponse.ok) {
          const detailsData = await detailsResponse.json();
          const videoDetail = detailsData.items?.[0];
          if (videoDetail?.contentDetails?.duration) {
            const durationSeconds = parseDuration(videoDetail.contentDetails.duration);
            if (durationSeconds) {
              duration = formatDuration(durationSeconds);
            }
          }
        }

        results.push({
          topicTitle: topic.title,
          video: {
            videoId,
            title: firstVideo.snippet.title,
            channelName: firstVideo.snippet.channelTitle,
            thumbnailUrl: firstVideo.snippet.thumbnails?.high?.url || "",
            duration,
          },
        });

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error fetching video for topic ${topic.title}:`, error);
        results.push({ topicTitle: topic.title, video: null });
      }
    }

    return results;
  },
});

/**
 * Parse ISO 8601 duration to seconds.
 * Example: "PT1M30S" -> 90
 */
function parseDuration(isoDuration: string | undefined): number | null {
  if (!isoDuration) return null;

  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Format seconds as mm:ss.
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
