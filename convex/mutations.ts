/**
 * Convex Mutations
 *
 * These mutations handle creating and updating data in the Convex database.
 * Used for managing users, courses, and feed items.
 */

import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create or get a user.
 * For simplicity, we use device-based identification.
 */
export const getOrCreateUser = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // For MVP, just create a new user each time
    // In production, you'd want to identify by device ID or auth
    const userId = await ctx.db.insert("users", {
      name: args.name,
      createdAt: Date.now(),
    });

    return userId;
  },
});

/**
 * Create a new course/learning session.
 */
export const createCourse = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    originalPrompt: v.string(),
    pdfStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const courseId = await ctx.db.insert("courses", {
      userId: args.userId,
      title: args.title,
      originalPrompt: args.originalPrompt,
      pdfStorageId: args.pdfStorageId,
      lastPosition: 0,
      createdAt: Date.now(),
    });

    return courseId;
  },
});

/**
 * Update the last watched position in a course.
 */
export const updateCoursePosition = mutation({
  args: {
    courseId: v.id("courses"),
    position: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.courseId, {
      lastPosition: args.position,
    });
  },
});

/**
 * Add feed items (videos) to a course.
 */
export const addFeedItems = mutation({
  args: {
    courseId: v.id("courses"),
    items: v.array(
      v.object({
        videoId: v.string(),
        topicTitle: v.string(),
        order: v.number(),
        metaData: v.object({
          channelName: v.string(),
          duration: v.optional(v.string()),
          thumbnailUrl: v.optional(v.string()),
          title: v.string(),
        }),
      })
    ),
  },
  handler: async (ctx, args) => {
    const insertedIds = [];

    for (const item of args.items) {
      const id = await ctx.db.insert("feedItems", {
        courseId: args.courseId,
        videoId: item.videoId,
        topicTitle: item.topicTitle,
        order: item.order,
        metaData: item.metaData,
      });
      insertedIds.push(id);
    }

    return insertedIds;
  },
});

/**
 * Delete a course and all its feed items.
 */
export const deleteCourse = mutation({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    // Delete all feed items for this course
    const feedItems = await ctx.db
      .query("feedItems")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    for (const item of feedItems) {
      await ctx.db.delete(item._id);
    }

    // Delete the course
    await ctx.db.delete(args.courseId);
  },
});

/**
 * Generate a URL for uploading a file to Convex storage.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
