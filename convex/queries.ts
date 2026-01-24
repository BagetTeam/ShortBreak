/**
 * Convex Queries
 *
 * These queries handle reading data from the Convex database.
 * Used for fetching users, courses, and feed items.
 */

import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all courses for a user.
 */
export const getUserCourses = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return courses;
  },
});

/**
 * Get a course by ID.
 */
export const getCourseById = query({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    return course;
  },
});

/**
 * Get all feed items for a course.
 */
export const getCourseFeed = query({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const feedItems = await ctx.db
      .query("feedItems")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    // Sort by order
    return feedItems.sort((a, b) => a.order - b.order);
  },
});

/**
 * Get feed items with pagination.
 * Useful for infinite scroll.
 */
export const getCourseFeedPaginated = query({
  args: {
    courseId: v.id("courses"),
    offset: v.number(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const feedItems = await ctx.db
      .query("feedItems")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    // Sort by order and paginate
    const sorted = feedItems.sort((a, b) => a.order - b.order);
    const paginated = sorted.slice(args.offset, args.offset + args.limit);

    return {
      items: paginated,
      hasMore: args.offset + args.limit < sorted.length,
      total: sorted.length,
    };
  },
});

/**
 * Get the count of feed items for a course.
 */
export const getCourseFeedCount = query({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const feedItems = await ctx.db
      .query("feedItems")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    return feedItems.length;
  },
});

/**
 * Get the next video in the feed after a given order.
 */
export const getNextFeedItem = query({
  args: {
    courseId: v.id("courses"),
    currentOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const feedItems = await ctx.db
      .query("feedItems")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    const sorted = feedItems.sort((a, b) => a.order - b.order);
    const nextItem = sorted.find((item) => item.order > args.currentOrder);

    return nextItem || null;
  },
});

/**
 * Get a single feed item by ID.
 */
export const getFeedItemById = query({
  args: {
    feedItemId: v.id("feedItems"),
  },
  handler: async (ctx, args) => {
    const feedItem = await ctx.db.get(args.feedItemId);
    return feedItem;
  },
});
