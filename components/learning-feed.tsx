/**
 * Learning Feed Component (Reels-style)
 *
 * A full-screen vertical swipe video feed similar to TikTok/Reels.
 * Features:
 * - Full-screen YouTube Shorts playback
 * - Vertical swipe navigation
 * - Topic title overlay
 * - Course progress indicator
 * - Only visible video plays, others are paused
 *
 * REMINDER: You must configure the iOS Shortcut manually:
 * 1. Open Shortcuts > Automation > App (Instagram) > Is Opened.
 * 2. Logic: If Clipboard == "PASS_OPEN" → Clear Clipboard & Stop. Else → Open [This App].
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Dimensions,
  ActivityIndicator,
  ViewToken,
} from "react-native";
import YoutubePlayer, { YoutubeIframeRef } from "react-native-youtube-iframe";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Types
interface FeedItem {
  _id: string;
  videoId: string;
  topicTitle: string;
  order: number;
  metaData: {
    channelName: string;
    duration?: string;
    thumbnailUrl?: string;
    title: string;
  };
}

interface LearningFeedProps {
  items: FeedItem[];
  courseTitle: string;
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  hasMoreItems?: boolean;
}

/**
 * Individual video item in the feed
 */
function FeedItemView({
  item,
  isActive,
  courseTitle,
  currentIndex,
  totalItems,
}: {
  item: FeedItem;
  isActive: boolean;
  courseTitle: string;
  currentIndex: number;
  totalItems: number;
}) {
  const playerRef = useRef<YoutubeIframeRef>(null);
  const [isReady, setIsReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);

  const onStateChange = useCallback((state: string) => {
    if (state === "buffering") {
      setIsBuffering(true);
    } else if (state === "playing") {
      setIsBuffering(false);
    } else if (state === "ended") {
      // Could auto-advance here
    }
  }, []);

  const onReady = useCallback(() => {
    setIsReady(true);
    setIsBuffering(false);
  }, []);

  return (
    <View style={styles.feedItem}>
      {/* YouTube Player */}
      <View style={styles.playerContainer}>
        <YoutubePlayer
          ref={playerRef}
          height={SCREEN_HEIGHT}
          width={SCREEN_WIDTH}
          play={isActive && isReady}
          videoId={item.videoId}
          onChangeState={onStateChange}
          onReady={onReady}
          webViewProps={{
            allowsInlineMediaPlayback: true,
            mediaPlaybackRequiresUserAction: false,
          }}
          initialPlayerParams={{
            controls: false,
            modestbranding: true,
            rel: false,
            showClosedCaptions: false,
          }}
        />

        {/* Loading indicator */}
        {isBuffering && isActive && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </View>

      {/* Bottom Gradient Overlay */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        style={styles.bottomGradient}
      >
        {/* Topic Info */}
        <View style={styles.topicContainer}>
          <Text style={styles.topicTitle}>{item.topicTitle}</Text>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {item.metaData.title}
          </Text>
          <Text style={styles.channelName}>
            📺 {item.metaData.channelName}
            {item.metaData.duration && ` • ${item.metaData.duration}`}
          </Text>
        </View>

        {/* Course Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.courseTitle}>{courseTitle}</Text>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${((currentIndex + 1) / totalItems) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {totalItems}
          </Text>
        </View>
      </LinearGradient>

      {/* Top Gradient (optional, for status bar area) */}
      <LinearGradient
        colors={["rgba(0,0,0,0.5)", "transparent"]}
        style={styles.topGradient}
      />
    </View>
  );
}

/**
 * Main Learning Feed component
 */
export default function LearningFeed({
  items,
  courseTitle,
  initialIndex = 0,
  onIndexChange,
  onLoadMore,
  isLoadingMore = false,
  hasMoreItems = false,
}: LearningFeedProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList>(null);

  // Handle viewability changes
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100,
  }).current;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        const newIndex = viewableItems[0].index;
        setActiveIndex(newIndex);
        onIndexChange?.(newIndex);

        // Check if we need to load more (when user is 3 items from the end)
        if (hasMoreItems && !isLoadingMore && newIndex >= items.length - 3) {
          onLoadMore?.();
        }
      }
    },
    [items.length, hasMoreItems, isLoadingMore, onIndexChange, onLoadMore]
  );

  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig,
      onViewableItemsChanged,
    },
  ]).current;

  // Scroll to initial index
  useEffect(() => {
    if (initialIndex > 0 && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: initialIndex,
        animated: false,
      });
    }
  }, [initialIndex]);

  const renderItem = useCallback(
    ({ item, index }: { item: FeedItem; index: number }) => (
      <FeedItemView
        item={item}
        isActive={index === activeIndex}
        courseTitle={courseTitle}
        currentIndex={index}
        totalItems={items.length}
      />
    ),
    [activeIndex, courseTitle, items.length]
  );

  const keyExtractor = useCallback((item: FeedItem) => item._id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: SCREEN_HEIGHT,
      offset: SCREEN_HEIGHT * index,
      index,
    }),
    []
  );

  const ListFooterComponent = useCallback(() => {
    if (!hasMoreItems) {
      return (
        <View style={styles.endMessage}>
        <Text style={styles.endMessageText}>
          You have completed this course!
        </Text>
        </View>
      );
    }

    if (isLoadingMore) {
      return (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.loadingMoreText}>Loading more...</Text>
        </View>
      );
    }

    return null;
  }, [hasMoreItems, isLoadingMore]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        pagingEnabled
        horizontal={false}
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs}
        getItemLayout={getItemLayout}
        removeClippedSubviews
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={2}
        ListFooterComponent={ListFooterComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  feedItem: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "#000",
  },
  playerContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 250,
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  topicContainer: {
    marginBottom: 20,
  },
  topicTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  videoTitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 4,
  },
  channelName: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  progressContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
  },
  courseTitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    marginBottom: 6,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "right",
  },
  endMessage: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  endMessageText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingMore: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  loadingMoreText: {
    color: "#fff",
    fontSize: 14,
  },
});
