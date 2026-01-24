import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    name: v.string(),
  }).index('by_name', ['name']),
  courses: defineTable({
    userId: v.id('users'),
    title: v.string(),
    originalPrompt: v.string(),
    pdfStorageId: v.optional(v.id('_storage')),
    lastPosition: v.number(),
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_created_at', ['userId', 'createdAt']),
    
  feedItems: defineTable({
    courseId: v.id('courses'),
    videoId: v.string(),
    topicTitle: v.string(),
    order: v.number(),
    metaData: v.object({
      title: v.optional(v.string()),
      channelTitle: v.optional(v.string()),
      thumbnailUrl: v.optional(v.string()),
      publishedAt: v.optional(v.string()),
    }),
  }).index('by_course_order', ['courseId', 'order']),
});
