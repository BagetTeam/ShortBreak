import { v } from 'convex/values';
import { action, mutation, query } from './_generated/server';

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const YOUTUBE_ENDPOINT = 'https://www.googleapis.com/youtube/v3/search';

const getGeminiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('Missing GEMINI_API_KEY in Convex environment.');
  }
  return key;
};

const getGeminiModel = () => process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';

const getYoutubeKey = () => {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    throw new Error('Missing YOUTUBE_API_KEY in Convex environment.');
  }
  return key;
};

type OutlineModule = {
  topicTitle: string;
  searchQuery: string;
};

type FeedItemInput = {
  videoId: string;
  topicTitle: string;
  metaData: {
    title?: string;
    channelTitle?: string;
    thumbnailUrl?: string;
    publishedAt?: string;
  };
};

const cleanJsonText = (text: string) => {
  const withoutFences = text.replace(/```json|```/gi, '');
  const start = withoutFences.indexOf('{');
  const end = withoutFences.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('Gemini response did not include JSON.');
  }
  return withoutFences.slice(start, end + 1);
};

const parseOutline = (rawText: string) => {
  const jsonText = cleanJsonText(rawText);
  const parsed = JSON.parse(jsonText) as {
    courseTitle?: string;
    modules?: OutlineModule[];
  };
  if (!parsed.modules || !Array.isArray(parsed.modules)) {
    throw new Error('Gemini response missing modules array.');
  }
  return parsed;
};

const fetchShortsForQuery = async (searchQuery: string) => {
  const url = new URL(YOUTUBE_ENDPOINT);
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('type', 'video');
  url.searchParams.set('maxResults', '5');
  url.searchParams.set('videoDuration', 'short');
  url.searchParams.set('videoEmbeddable', 'true');
  url.searchParams.set('safeSearch', 'moderate');
  url.searchParams.set('q', searchQuery);
  url.searchParams.set('key', getYoutubeKey());

  const response = await fetch(url.toString());
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`YouTube API error: ${response.status} ${errorBody}`);
  }

  const data = (await response.json()) as {
    items?: Array<{
      id?: { videoId?: string };
      snippet?: {
        title?: string;
        channelTitle?: string;
        publishedAt?: string;
        thumbnails?: { high?: { url?: string } };
      };
    }>;
  };

  const first = data.items?.find((item) => item.id?.videoId);
  if (!first?.id?.videoId) {
    return null;
  }

  return {
    videoId: first.id.videoId,
    metaData: {
      title: first.snippet?.title,
      channelTitle: first.snippet?.channelTitle,
      thumbnailUrl: first.snippet?.thumbnails?.high?.url,
      publishedAt: first.snippet?.publishedAt,
    },
  };
};

const buildFeedItems = async (modules: OutlineModule[]) => {
  const items: FeedItemInput[] = [];
  for (const module of modules) {
    const video = await fetchShortsForQuery(module.searchQuery);
    if (!video) {
      continue;
    }
    items.push({
      videoId: video.videoId,
      topicTitle: module.topicTitle,
      metaData: video.metaData,
    });
  }
  return items;
};

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const createCourseWithFeed = mutation({
  args: {
    title: v.string(),
    originalPrompt: v.string(),
    pdfStorageId: v.optional(v.id('_storage')),
    feedItems: v.array(
      v.object({
        videoId: v.string(),
        topicTitle: v.string(),
        order: v.number(),
        metaData: v.object({
          title: v.optional(v.string()),
          channelTitle: v.optional(v.string()),
          thumbnailUrl: v.optional(v.string()),
          publishedAt: v.optional(v.string()),
        }),
      })
    ),
    userName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userName = args.userName ?? 'local';
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_name', (q) => q.eq('name', userName))
      .first();
    const userId = existingUser?._id ?? (await ctx.db.insert('users', { name: userName }));

    const courseId = await ctx.db.insert('courses', {
      userId,
      title: args.title,
      originalPrompt: args.originalPrompt,
      pdfStorageId: args.pdfStorageId,
      lastPosition: 0,
      createdAt: Date.now(),
    });

    for (const item of args.feedItems) {
      await ctx.db.insert('feedItems', {
        courseId,
        videoId: item.videoId,
        topicTitle: item.topicTitle,
        order: item.order,
        metaData: item.metaData,
      });
    }

    return { courseId };
  },
});

export const appendFeedItems = mutation({
  args: {
    courseId: v.id('courses'),
    feedItems: v.array(
      v.object({
        videoId: v.string(),
        topicTitle: v.string(),
        order: v.number(),
        metaData: v.object({
          title: v.optional(v.string()),
          channelTitle: v.optional(v.string()),
          thumbnailUrl: v.optional(v.string()),
          publishedAt: v.optional(v.string()),
        }),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const item of args.feedItems) {
      await ctx.db.insert('feedItems', {
        courseId: args.courseId,
        videoId: item.videoId,
        topicTitle: item.topicTitle,
        order: item.order,
        metaData: item.metaData,
      });
    }
    return { inserted: args.feedItems.length };
  },
});

export const updateCoursePosition = mutation({
  args: {
    courseId: v.id('courses'),
    lastPosition: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.courseId, { lastPosition: args.lastPosition });
  },
});

export const getLatestCourse = query({
  args: {
    userName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userName = args.userName ?? 'local';
    const user = await ctx.db
      .query('users')
      .withIndex('by_name', (q) => q.eq('name', userName))
      .first();
    if (!user) {
      return null;
    }

    return await ctx.db
      .query('courses')
      .withIndex('by_user_created_at', (q) => q.eq('userId', user._id))
      .order('desc')
      .first();
  },
});

export const getFeedItems = query({
  args: {
    courseId: v.id('courses'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('feedItems')
      .withIndex('by_course_order', (q) => q.eq('courseId', args.courseId))
      .collect();
  },
});

export const generateCourseOutline = action({
  args: {
    prompt: v.optional(v.string()),
    pdfBase64: v.optional(v.string()),
    courseHint: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const prompt = args.prompt?.trim();
    if (!prompt && !args.pdfBase64) {
      throw new Error('Provide a prompt or a PDF.');
    }

    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
    if (args.pdfBase64) {
      parts.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: args.pdfBase64,
        },
      });
    }

    parts.push({
      text: [
        'You are a curriculum designer.',
        'Break this topic into 5 engaging short-form video concepts.',
        'For each concept, provide a specific YouTube search query.',
        'Respond with JSON using this schema:',
        '{"courseTitle": string, "modules": [{"topicTitle": string, "searchQuery": string}] }',
        args.courseHint ? `Course hint: ${args.courseHint}` : null,
        prompt ? `User prompt: ${prompt}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
    });

    const response = await fetch(
      `${GEMINI_ENDPOINT}/${getGeminiModel()}:generateContent?key=${getGeminiKey()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorBody}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const rawText =
      data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';

    const outline = parseOutline(rawText);
    const feedItems = await buildFeedItems(outline.modules);

    return {
      courseTitle: outline.courseTitle ?? prompt ?? args.courseHint ?? 'Learning Course',
      modules: outline.modules,
      feedItems,
    };
  },
});

export const appendNextModule = action({
  args: {
    courseTitle: v.string(),
    coveredTopics: v.array(v.string()),
  },
  handler: async (_ctx, args) => {
    const promptText = [
      'You are a curriculum designer.',
      `Course title: ${args.courseTitle}.`,
      'The following topics are already covered:',
      args.coveredTopics.length ? args.coveredTopics.join(', ') : 'None yet.',
      'Provide the next 5 logical short-form video topics in this course.',
      'For each topic, include a specific YouTube search query.',
      'Respond with JSON using this schema:',
      '{"modules": [{"topicTitle": string, "searchQuery": string}] }',
    ].join('\n');

    const response = await fetch(
      `${GEMINI_ENDPOINT}/${getGeminiModel()}:generateContent?key=${getGeminiKey()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorBody}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const rawText =
      data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';

    const outline = parseOutline(rawText);
    const feedItems = await buildFeedItems(outline.modules);

    return {
      modules: outline.modules,
      feedItems,
    };
  },
});

export const fetchYouTubeShorts = action({
  args: {
    searchQuery: v.string(),
  },
  handler: async (_ctx, args) => {
    const video = await fetchShortsForQuery(args.searchQuery);
    return video ?? null;
  },
});
