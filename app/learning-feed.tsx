/**
 * Learning Feed Screen
 *
 * Displays the Reels-style educational video feed for a course.
 * Handles:
 * - Fetching course data from Convex
 * - Managing video playback position
 * - Infinite scroll pagination
 *
 * REMINDER: You must configure the iOS Shortcut manually:
 * 1. Open Shortcuts > Automation > App (Instagram) > Is Opened.
 * 2. Logic: If Clipboard == "PASS_OPEN" → Clear Clipboard & Stop. Else → Open [This App].
 */

import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import LearningFeed from "@/components/learning-feed";

export default function LearningFeedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ courseId: string }>();
  const courseId = params.courseId as Id<"courses">;

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Convex queries
  const course = useQuery(api.queries.getCourseById, courseId ? { courseId } : "skip");
  const feedItems = useQuery(api.queries.getCourseFeed, courseId ? { courseId } : "skip");

  // Convex mutations/actions
  const updateCoursePosition = useMutation(api.mutations.updateCoursePosition);
  const generateMoreTopics = useAction(api.actions.gemini.generateMoreTopics);
  const fetchVideosForTopics = useAction(api.actions.youtube.fetchVideosForTopics);
  const addFeedItems = useMutation(api.mutations.addFeedItems);

  // Handle index change (save progress)
  const handleIndexChange = useCallback(
    async (index: number) => {
      if (courseId) {
        try {
          await updateCoursePosition({ courseId, position: index });
        } catch (error) {
          console.error("Error updating course position:", error);
        }
      }
    },
    [courseId, updateCoursePosition]
  );

  // Handle loading more content (pagination)
  const handleLoadMore = useCallback(async () => {
    if (!course || !feedItems || isLoadingMore) return;

    setIsLoadingMore(true);

    try {
      // Get existing topic titles
      const existingTopics = feedItems.map((item) => item.topicTitle);

      // Generate more topics using Gemini
      const newTopics = await generateMoreTopics({
        originalPrompt: course.originalPrompt,
        existingTopics,
        numNewTopics: 5,
      });

      if (newTopics.length === 0) {
        console.log("No more topics to generate");
        setIsLoadingMore(false);
        return;
      }

      // Fetch videos for new topics
      const topicsWithVideos = await fetchVideosForTopics({
        topics: newTopics.map((t) => ({
          title: t.title,
          searchQuery: t.searchQuery,
        })),
      });

      // Add new feed items
      const startOrder = feedItems.length;
      const newFeedItems = topicsWithVideos
        .filter((t: any) => t.video !== null)
        .map((t: any, index: number) => ({
          videoId: t.video.videoId,
          topicTitle: t.topicTitle,
          order: startOrder + index,
          metaData: {
            channelName: t.video.channelName,
            duration: t.video.duration,
            thumbnailUrl: t.video.thumbnailUrl,
            title: t.video.title,
          },
        }));

      if (newFeedItems.length > 0) {
        await addFeedItems({ courseId, items: newFeedItems });
      }
    } catch (error) {
      console.error("Error loading more content:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    course,
    feedItems,
    isLoadingMore,
    courseId,
    generateMoreTopics,
    fetchVideosForTopics,
    addFeedItems,
  ]);

  const handleClose = () => {
    router.back();
  };

  // Loading state
  if (!course || !feedItems) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading your feed...</Text>
      </SafeAreaView>
    );
  }

  // Empty state
  if (feedItems.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.emptyTitle}>No Videos Found</Text>
        <Text style={styles.emptySubtitle}>
          We could not find any videos for this course. Try a different topic.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={handleClose}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" hidden />

      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>

      {/* Learning Feed */}
      <LearningFeed
        items={feedItems}
        courseTitle={course.title}
        initialIndex={course.lastPosition}
        onIndexChange={handleIndexChange}
        onLoadMore={handleLoadMore}
        isLoadingMore={isLoadingMore}
        hasMoreItems={true} // Always allow loading more from AI
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  emptySubtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 100,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});
